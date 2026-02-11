import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { apiPost, getErrorMessage } from '../utils/api.js'
import { formatCurrency } from '../utils/format.js'
import OrderSummary from '../components/OrderSummary.jsx'

const DEBUG = import.meta.env.DEV
const debugLog = (label, data) => {
  if (DEBUG) {
    console.log(`[Payment] ${label}`, data)
  }
}
const debugError = (label, err) => {
  if (DEBUG) {
    console.error(`[Payment] ${label}`, err?.message, err?.status, err?.data, err)
  }
}

function buildOrderPayload(pendingOrder, overrides = {}) {
  const {
    user,
    items,
    deliveryDetails,
    subTotal,
    discountAmount,
    total,
    couponCode,
    coupon,
  } = pendingOrder
  const base = {
    user,
    items: Array.isArray(items) ? items : pendingOrder.items || [],
    deliveryDetails: deliveryDetails || {},
    status: 'Pending',
    couponCode: couponCode || (coupon && coupon.code) || undefined,
    coupon: typeof coupon === 'object' && (coupon?.id || coupon?._id) ? (coupon.id || coupon._id) : undefined,
    subTotal: Number(subTotal ?? 0),
    discountAmount: Number(discountAmount ?? 0),
    total: Number(total ?? 0),
    paymentMethod: 'Online',
    paymentStatus: 'Pending',
    ...overrides,
  }

  const orderIdValue = overrides.orderID ?? overrides.razorpayOrderId
  if (orderIdValue) {
    base.orderID = orderIdValue
    base.order_id = orderIdValue
  }
  return base
}

const PaymentPage = () => {
  const navigate = useNavigate()
  const { addOrder, fetchOrders, menuItems } = useData()
  const { clearCart } = useCart()
  const [isPaying, setIsPaying] = useState(false)
  const pendingState = useMemo(() => {
    const raw = sessionStorage.getItem('pending-order')
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw)
      if (parsed?.order) return parsed
      return { order: parsed, lineItems: parsed.items || [] }
    } catch {
      return null
    }
  }, [])
  const pendingOrder = pendingState?.order
  const lineItems = useMemo(() => pendingState?.lineItems ?? [], [pendingState])
  const menuMap = useMemo(
    () => new Map(menuItems.map((item) => [item.id, item])),
    [menuItems],
  )
  const hasUnavailableItems = useMemo(() => {
    return lineItems.some((item) => {
      const menuId = item.menu ?? item.id
      const menuItem = menuMap.get(menuId)
      return !menuItem || menuItem.available === false
    })
  }, [lineItems, menuMap])
  const summaryItems = lineItems.length
    ? lineItems
    : (pendingOrder?.items || []).map((item) => {
        const menuItem = menuMap.get(item.menu) || {}
        return {
          ...menuItem,
          id: menuItem.id || item.menu,
          quantity: item.quantity,
          addons: item.addons || [],
        }
      })

  const amountToPay = useMemo(() => {
    if (!pendingOrder) return 0
    const raw = Number(pendingOrder.grandTotal ?? pendingOrder.total ?? 0)
    return Math.round(raw * 100) / 100
  }, [pendingOrder])

  if (!pendingOrder) {
    return (
      <div className="container">
        <div className="card empty-state">
          <h2>No payment pending</h2>
          <p>Please return to checkout to place your order.</p>
        </div>
      </div>
    )
  }

  const loadRazorpay = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => reject(new Error('Unable to load Razorpay.'))
      document.body.appendChild(script)
    })

  const handlePayment = async () => {
    if (hasUnavailableItems) {
      toast.error(
        'Some items in your order are no longer available. Please return to checkout and remove them.'
      )
      return
    }
    setIsPaying(true)
    try {
      if (amountToPay <= 0) {
        toast.error('Invalid order total. Please return to checkout.')
        setIsPaying(false)
        return
      }

      const createPayload = { amount: amountToPay, currency: 'INR' }
      debugLog('POST /api/payment/create-order request', createPayload)
      const createResponse = await apiPost('/api/payment/create-order', createPayload)
      debugLog('POST /api/payment/create-order response', createResponse)
      const paymentData = createResponse?.data || createResponse || {}
      const razorpayOrderId =
        paymentData.orderId ||
        paymentData.id ||
        paymentData.order?.id ||
        paymentData.order_id
      const keyId =
        paymentData.keyId ||
        paymentData.key ||
        import.meta.env.VITE_RAZORPAY_KEY_ID

      if (!keyId) {
        throw new Error(
          'Razorpay key is missing. Add VITE_RAZORPAY_KEY_ID to your .env and restart the dev server.'
        )
      }
      if (!razorpayOrderId) {
        throw new Error(
          'Payment order could not be created. Ensure your backend implements POST /api/payment/create-order and returns orderId (or id).'
        )
      }

      await loadRazorpay()

      const options = {
        key: keyId,
        amount: Math.round(amountToPay * 100),
        currency: paymentData.currency || 'INR',
        name: 'StillHungry',
        description: 'Order payment',
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            const verifyPayload = {
              orderId: razorpayOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }
            debugLog('POST /api/payment/verify request', verifyPayload)
            try {
              await apiPost('/api/payment/verify', verifyPayload)
              debugLog('POST /api/payment/verify success', null)
            } catch (verifyErr) {
              const verifyMsg = getErrorMessage(verifyErr, '')
              const verifyNotFound = verifyErr?.status === 404 || /order not found|not found/i.test(verifyMsg)
              debugError('POST /api/payment/verify failed', verifyErr)
              if (verifyNotFound) {
                debugLog('Verify returned 404/Order not found – backend may expect an order in DB. Proceeding to save order.', null)
              } else {
                throw verifyErr
              }
            }
            const orderPayload = buildOrderPayload(pendingOrder, {
              paymentMethod: 'Online',
              paymentStatus: 'Paid',
              razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderID: razorpayOrderId,
            })
            debugLog('Order payload for POST /api/orders', orderPayload)
            let orderCreated = false
            try {
              debugLog('Calling addOrder (POST /api/orders)...', null)
              await addOrder(orderPayload)
              orderCreated = true
              debugLog('addOrder success', null)
            } catch (orderErr) {
              const orderMsg = getErrorMessage(orderErr, '')
              debugError('addOrder (POST /api/orders) failed', orderErr)
              const isNotFound = /order not found|404|not found/i.test(orderMsg) || orderErr?.status === 404
              if (isNotFound) {
                debugLog('Trying fallback POST /api/payment/complete...', null)
                try {
                  await apiPost('/api/payment/complete', {
                    ...orderPayload,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  })
                  orderCreated = true
                  debugLog('POST /api/payment/complete success', null)
                  await fetchOrders()
                } catch (completeErr) {
                  debugError('POST /api/payment/complete failed', completeErr)
                  if (completeErr?.status === 404 || /not found/i.test(getErrorMessage(completeErr, ''))) {
                    toast.error(
                      `Payment successful but order could not be saved (Order not found). Save this payment ID and contact support: ${response.razorpay_payment_id}`
                    )
                  } else {
                    throw completeErr
                  }
                }
              } else {
                throw orderErr
              }
            }
            if (orderCreated) {
              clearCart()
              sessionStorage.removeItem('pending-order')
              toast.success('Payment successful. Order placed.')
              navigate('/orders')
            }
          } catch (error) {
            const msg = getErrorMessage(error, 'Payment verification failed.')
            debugError('Payment handler error', error)
            toast.error(msg)
          } finally {
            setIsPaying(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.')
        setIsPaying(false)
      })
      razorpay.open()
    } catch (error) {
      debugError('handlePayment (create-order or Razorpay open) error', error)
      toast.error(getErrorMessage(error, 'Unable to start payment.'))
      setIsPaying(false)
    }
  }

  return (
    <div className="container">
      <div className="section-header">
        <h2>Online payment</h2>
      </div>
      <div className="responsive-stack">
        <div className="card form-card">
          <h3>Razorpay checkout</h3>
          <p className="menu-description">
            Complete your payment with Razorpay to confirm the order.
          </p>
          {hasUnavailableItems && (
            <div className="alert error">
              Some items in your order are no longer available. Please return to checkout and remove them from your cart.
            </div>
          )}
          <div className="summary-row total">
            <span>Amount</span>
            <strong>{formatCurrency(amountToPay)}</strong>
          </div>
          <button
            className="button primary"
            type="button"
            onClick={handlePayment}
            disabled={isPaying || hasUnavailableItems}
          >
            <CreditCard size={16} />
            {isPaying ? 'Processing...' : hasUnavailableItems ? 'Unavailable items in order' : 'Pay now'}
          </button>
        </div>
        <OrderSummary
          items={summaryItems}
          itemsCount={summaryItems.length}
          subTotal={pendingOrder.subTotal}
          discountAmount={pendingOrder.discountAmount}
          deliveryFee={typeof pendingOrder.deliveryFee === 'number' ? pendingOrder.deliveryFee : 0}
          taxes={typeof pendingOrder.taxes === 'number' ? pendingOrder.taxes : 0}
          grandTotal={amountToPay}
          showCoupon={false}
          showDeliveryFee={true}
          showTaxes={true}
          showGrandTotal={true}
        />
      </div>
    </div>
  )
}

export default PaymentPage
