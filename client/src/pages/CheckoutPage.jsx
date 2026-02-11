import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { getErrorMessage } from '../utils/api.js'
import OrderSummary from '../components/OrderSummary.jsx'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addOrder, validateCoupon, menuItems } = useData()
  const {
    items,
    subTotal,
    discountAmount,
    total,
    coupon,
    applyCoupon,
    clearCoupon,
    clearCart,
  } = useCart()
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: user?.username || '',
    address: '',
    phone: user?.phone || '',
  })
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [couponCode, setCouponCode] = useState(coupon?.code || '')
  const [couponMessage, setCouponMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const deliveryFee = subTotal > 0 ? 29 : 0
  const taxes = Math.round(total * 0.05)
  const grandTotal = Math.max(total + deliveryFee + taxes, 0)

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="card empty-state">
          <h2>No items to checkout</h2>
          <p>Head back to the menu to add items to your cart.</p>
        </div>
      </div>
    )
  }

  const handleDetailsChange = (event) => {
    const { name, value } = event.target
    setDeliveryDetails((prev) => ({ ...prev, [name]: value }))
  }

  const applyCouponCode = async () => {
    if (!couponCode) return
    setCouponMessage('')
    try {
      const result = await validateCoupon(couponCode, subTotal)
      const resolvedCoupon = result.coupon
      const resolvedDiscount = result.discountAmount
      applyCoupon({
        ...resolvedCoupon,
        code: couponCode.toUpperCase(),
        discountAmount: resolvedDiscount,
      })
      setCouponMessage('Coupon applied successfully.')
    } catch (err) {
      clearCoupon()
      setCouponMessage('')
      toast.error(getErrorMessage(err, 'Unable to apply coupon.'))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const menuById = new Map((menuItems || []).map((m) => [m.id, m]))
    const unavailable = items.filter((cartItem) => {
      const menuItem = menuById.get(cartItem.id)
      return !menuItem || menuItem.available === false
    })
    if (unavailable.length > 0) {
      toast.error(
        'Some items in your cart are no longer available. Please remove them from your cart to continue.'
      )
      return
    }
    setIsSubmitting(true)
    try {
      const payload = {
        user: user.id,
        items: items.map((item) => ({
          menu: item.id,
          quantity: item.quantity,
          addons: (item.addons || []).map((addon) => addon.id || addon._id || addon),
        })),
        deliveryDetails,
        paymentMethod,
        couponCode: coupon?.code || couponCode || undefined,
        subTotal,
        discountAmount,
        deliveryFee,
        taxes,
        total: grandTotal,
      }
      if (paymentMethod === 'Online') {
        sessionStorage.setItem(
          'pending-order',
          JSON.stringify({ order: payload, lineItems: items }),
        )
        navigate('/payment')
        return
      }
      await addOrder(payload)
      clearCart()
      toast.success('Order placed successfully.')
      navigate('/orders')
    } catch (err) {
      const msg = getErrorMessage(err, 'Unable to place order.')
      const isRouteNotFound = msg && /route|router|404|not found/i.test(msg)
      toast.error(isRouteNotFound ? 'Unable to place order. Please check your connection and try again, or contact support.' : msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container">
      <div className="section-header">
        <h2>Checkout</h2>
      </div>
      <form className="grid grid-cols-1 lg:grid-cols-2 gap-6" onSubmit={handleSubmit}>
        <div className="card form-card">
          <h3>Delivery details</h3>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              className="input"
              value={deliveryDetails.name}
              onChange={handleDetailsChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              name="phone"
              className="input"
              value={deliveryDetails.phone}
              onChange={handleDetailsChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Delivery address</label>
            <textarea
              id="address"
              name="address"
              className="textarea"
              value={deliveryDetails.address}
              onChange={handleDetailsChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="paymentMethod">Payment method</label>
            <select
              id="paymentMethod"
              className="select"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
            >
              <option value="COD">Cash on delivery</option>
              <option value="Online">Online payment</option>
            </select>
          </div>
        </div>

        <OrderSummary
          items={items}
          itemsCount={itemsCount}
          subTotal={subTotal}
          discountAmount={discountAmount}
          deliveryFee={deliveryFee}
          taxes={taxes}
          grandTotal={grandTotal}
          couponInput={couponCode}
          onCouponInputChange={(event) => setCouponCode(event.target.value.toUpperCase())}
          onApplyCoupon={applyCouponCode}
          couponMessage={couponMessage}
          isSubmitting={isSubmitting}
          showCoupon={true}
          showDeliveryFee={true}
          showTaxes={true}
          showGrandTotal={true}
          buttonLabel={isSubmitting ? 'Placing order...' : 'Place order'}
        />
      </form>
    </div>
  )
}

export default CheckoutPage
