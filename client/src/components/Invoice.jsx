import { formatCurrency, formatDateTime, getMenuItemDisplayName } from '../utils/format.js'
import Logo from './Logo.jsx'
import { useData } from '../context/DataContext.jsx'

const Invoice = ({ order, menuMap }) => {
  const { addons: allAddons, lastKnownMenuNames } = useData()
  if (!order) return null

  const orderIdSuffix = order.id?.toString?.().slice(-6) || '000000'
  const invoiceNumber = `INV-${orderIdSuffix}-${new Date(order.createdAt).getTime().toString().slice(-6)}`
  return (
    <div className="invoice p-6">
      <h1 className="mb-6 text-center text-[2rem] font-bold">Invoice</h1>
      <div className="invoice-header mb-6 flex items-center gap-6">
        <Logo size="sm" />
        <div>
          <div className="mb-1 text-[1.05em] font-medium">Invoice No: {invoiceNumber}</div>
          <div className="mb-1">Order #{orderIdSuffix}</div>
          <div className="text-[0.95em] text-muted">
            {formatDateTime(order.createdAt)}
          </div>
        </div>
      </div>
      <div className="invoice-body">
        <h3 className="mb-4 text-base font-semibold">Order Details</h3>
        <div className="list mb-5">
          {(order.items || []).map((item) => {
            const menuItem = menuMap.get(item.menu)
            const unitPrice = menuItem?.price || 0
            const totalPrice = unitPrice * item.quantity

            const itemAddons = (item.addons || []).map((addonIdOrObj) => {
              const addonId = typeof addonIdOrObj === 'object' ? (addonIdOrObj.id || addonIdOrObj._id) : addonIdOrObj
              return allAddons.find((a) => a.id === addonId)
            }).filter(Boolean)
            return (
              <div key={item.menu + (item.addonKey || '')} className="mb-3">
                <div className="flex w-full items-center font-medium">
                  <div className="flex flex-1 items-center">
                    <span>{getMenuItemDisplayName(menuMap, item.menu, item.name, lastKnownMenuNames)} x {item.quantity}</span>
                    <span className="ml-2 text-[0.93em] font-normal text-muted">
                      @ {formatCurrency(unitPrice)}
                    </span>
                  </div>
                  <span className="min-w-[80px] text-right">{formatCurrency(totalPrice)}</span>
                </div>
                {itemAddons.length > 0 && (
                  itemAddons.map((addon) => {
                    const addonTotal = addon.price * item.quantity
                    return (
                      <div key={addon.id} className="mb-0.5 flex w-full items-center text-[0.97em]">
                        <div className="ml-[18px] flex flex-1 items-center">
                          <span className="text-muted">{addon.name} x {item.quantity}</span>
                          <span className="ml-2 text-[0.93em] font-normal text-muted">
                            @ {formatCurrency(addon.price)}
                          </span>
                        </div>
                        <span className="min-w-[80px] text-right">{formatCurrency(addonTotal)}</span>
                      </div>
                    )
                  })
                )}
              </div>
            )
          })}
        </div>

        <div className="summary-row mb-2">
          <span>Subtotal</span>
          <strong>{formatCurrency(
            (order.items || []).reduce((sum, item) => {
              const menuItem = menuMap.get(item.menu)
              const unitPrice = menuItem?.price || 0
              const itemTotal = unitPrice * item.quantity
              const itemAddons = (item.addons || []).map((addonIdOrObj) => {
                const addonId = typeof addonIdOrObj === 'object' ? (addonIdOrObj.id || addonIdOrObj._id) : addonIdOrObj
                return allAddons.find((a) => a.id === addonId)
              }).filter(Boolean)
              const addonsTotal = itemAddons.reduce((aSum, addon) => aSum + (addon.price * item.quantity), 0)
              return sum + itemTotal + addonsTotal
            }, 0)
          )}</strong>
        </div>

        <div className="summary-row mb-2">
          <span>Discount</span>
          <strong>-
            {formatCurrency(
              (() => {
                const subtotal = (order.items || []).reduce((sum, item) => {
                  const menuItem = menuMap.get(item.menu)
                  const unitPrice = menuItem?.price || 0
                  const itemTotal = unitPrice * item.quantity
                  const itemAddons = (item.addons || []).map((addonIdOrObj) => {
                    const addonId = typeof addonIdOrObj === 'object' ? (addonIdOrObj.id || addonIdOrObj._id) : addonIdOrObj
                    return allAddons.find((a) => a.id === addonId)
                  }).filter(Boolean)
                  const addonsTotal = itemAddons.reduce((aSum, addon) => aSum + (addon.price * item.quantity), 0)
                  return sum + itemTotal + addonsTotal
                }, 0)
                if (order.couponCode === 'HUNGRY10') {
                  return Math.round(subtotal * 0.10)
                }
                return 0
              })()
            )}
          </strong>
        </div>
        <div className="summary-row mb-2">
          <span>Delivery fee</span>
          <strong>{formatCurrency(order.deliveryFee)}</strong>
        </div>
        <div className="summary-row mb-2">
          <span>Taxes</span>
          <strong>{formatCurrency(order.taxes)}</strong>
        </div>
        <div className="summary-row total mb-3">
          <span>Grand total</span>
          <strong>
            {formatCurrency(
              (() => {
                const subtotal = (order.items || []).reduce((sum, item) => {
                  const menuItem = menuMap.get(item.menu)
                  const unitPrice = menuItem?.price || 0
                  const itemTotal = unitPrice * item.quantity
                  const itemAddons = (item.addons || []).map((addonIdOrObj) => {
                    const addonId = typeof addonIdOrObj === 'object' ? (addonIdOrObj.id || addonIdOrObj._id) : addonIdOrObj
                    return allAddons.find((a) => a.id === addonId)
                  }).filter(Boolean)
                  const addonsTotal = itemAddons.reduce((aSum, addon) => aSum + (addon.price * item.quantity), 0)
                  return sum + itemTotal + addonsTotal
                }, 0)
                let discount = 0
                if (order.couponCode === 'HUNGRY10') {
                  discount = Math.round(subtotal * 0.10)
                }
                return subtotal - discount + (order.deliveryFee || 0) + (order.taxes || 0)
              })()
            )}
          </strong>
        </div>
        <div className="summary-row saved mb-2">
          <span>You saved</span>
          <strong>
            {formatCurrency(
              (() => {
                const subtotal = (order.items || []).reduce((sum, item) => {
                  const menuItem = menuMap.get(item.menu)
                  const unitPrice = menuItem?.price || 0
                  const itemTotal = unitPrice * item.quantity
                  const itemAddons = (item.addons || []).map((addonIdOrObj) => {
                    const addonId = typeof addonIdOrObj === 'object' ? (addonIdOrObj.id || addonIdOrObj._id) : addonIdOrObj
                    return allAddons.find((a) => a.id === addonId)
                  }).filter(Boolean)
                  const addonsTotal = itemAddons.reduce((aSum, addon) => aSum + (addon.price * item.quantity), 0)
                  return sum + itemTotal + addonsTotal
                }, 0)
                if (order.couponCode === 'HUNGRY10') {
                  return Math.round(subtotal * 0.10)
                }
                return 0
              })()
            )}
          </strong>
        </div>
        {order.couponCode && (
          <div className="summary-row mb-2">
            <span>Coupon</span>
            <strong>{order.couponCode}</strong>
          </div>
        )}
        <div className="summary-row">
          <span>Payment method</span>
          <strong>{order.paymentMethod}</strong>
        </div>
      </div>
    </div>
  )
}

export default Invoice
