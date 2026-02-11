import { formatCurrency } from '../utils/format.js'
import { useData } from '../context/DataContext.jsx'

const OrderSummary = ({ items, discountAmount, deliveryFee, taxes, grandTotal, couponMessage, onApplyCoupon, couponInput, onCouponInputChange, isSubmitting, showCoupon, showGrandTotal, buttonLabel, onSubmit }) => {
  const { addons: allAddons } = useData()
  return (
    <div className="card form-card">
      <h3>Order summary</h3>
      <div className="list">
        {items && items.map((item) => {
          const unitPrice = item.price || 0
          const totalPrice = unitPrice * item.quantity
          const itemAddons = (item.addons || []).map((addonIdOrObj) => {
            const addonId = typeof addonIdOrObj === 'object' ? (addonIdOrObj.id || addonIdOrObj._id) : addonIdOrObj
            return allAddons.find((a) => a.id === addonId)
          }).filter(Boolean)
          return (
            <div key={item.id + (item.addonKey || '')} className="mb-2.5">
              <div className="flex w-full items-center font-medium">
                <div className="flex flex-1 items-center">
                  <span>{item.name} x {item.quantity}</span>
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

      <div className="summary-row">
        <span>Subtotal</span>
        <strong>{formatCurrency(
          items.reduce((sum, item) => {
            const unitPrice = item.price || 0
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
      <div className="summary-row">
        <span>Discount</span>
        <strong>-{formatCurrency(discountAmount)}</strong>
      </div>
      <div className="summary-row">
        <span>Delivery fee</span>
        <strong>{formatCurrency(deliveryFee)}</strong>
      </div>
      <div className="summary-row">
        <span>Taxes</span>
        <strong>{formatCurrency(taxes)}</strong>
      </div>
      {showGrandTotal && (
        <div className="summary-row total">
          <span>Grand total</span>
          <strong>{formatCurrency(grandTotal)}</strong>
        </div>
      )}
      <div className="summary-row saved">
        <span>You saved</span>
        <strong>{formatCurrency(discountAmount)}</strong>
      </div>
      {showCoupon && (
        <div className="form-group">
          <label htmlFor="coupon">Coupon code</label>
          <div className="inline-fields">
            <input
              id="coupon"
              className="input"
              value={couponInput}
              onChange={onCouponInputChange}
              placeholder="HUNGRY10"
            />
            <button className="button ghost" type="button" onClick={onApplyCoupon}>
              Apply
            </button>
          </div>
          {couponMessage && <div className="alert success">{couponMessage}</div>}
        </div>
      )}
      {buttonLabel && (
        <button className="button primary" type="submit" disabled={isSubmitting} onClick={onSubmit}>
          {buttonLabel}
        </button>
      )}
    </div>
  )
}

export default OrderSummary
