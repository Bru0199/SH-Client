import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { formatCurrency } from '../utils/format.js'
import placeholderImage from '../assets/placeholder-food.svg'

const CartPage = () => {
  const navigate = useNavigate()
  const { menuItems } = useData()
  const {
    items,
    subTotal,
    discountAmount,
    total,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart()

  const menuById = useMemo(
    () => new Map((menuItems || []).map((m) => [m.id, m])),
    [menuItems],
  )
  const hasUnavailableItems = useMemo(
    () =>
      items.some((cartItem) => {
        const menuItem = menuById.get(cartItem.id)
        return !menuItem || menuItem.available === false
      }),
    [items, menuById],
  )

  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const deliveryFee = subTotal > 0 ? 29 : 0
  const taxes = Math.round(total * 0.05)
  const grandTotal = Math.max(total + deliveryFee + taxes, 0)

  if (items.length === 0) {
    return (
      <div className="container">
        <div className="card empty-state">
          <h2>Your cart is empty</h2>
          <p>Start by adding a few tasty items from the menu.</p>
          <Link className="button primary" to="/menu">
            Browse menu
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container cart-page">
      <div className="section-header cart-page-header">
        <h2 className="cart-page-title">Your cart</h2>
        <div className="cart-page-actions">
          <button className="button ghost" onClick={() => navigate('/menu')} type="button">
            Continue shopping
          </button>
          <button className="button ghost button--danger-ghost" onClick={clearCart} type="button">
            Clear cart
          </button>
        </div>
      </div>
      {hasUnavailableItems && (
        <div className="alert error">
          Some items in your cart are no longer available. Remove them to proceed to checkout.
        </div>
      )}
      <div className="cart-subtotal">
        <span>
          Subtotal ({itemsCount} items)
        </span>
        <strong>{formatCurrency(subTotal)}</strong>
      </div>
      <div className="cart-layout">
        <div className="cart-items-list">
          {items.map((item) => {
            const addonsTotal = (item.addons || []).reduce(
              (sum, addon) => sum + Number(addon.price || 0),
              0,
            )
            const lineTotal = (item.price + addonsTotal) * item.quantity
            const menuItem = menuById.get(item.id)
            const isUnavailable = !menuItem || menuItem.available === false
            return (
              <div
                key={`${item.id}-${item.addonKey}`}
                className={`cart-item-card ${isUnavailable ? 'is-unavailable' : ''}`}
              >
                {isUnavailable && (
                  <span className="status-pill danger">
                    No longer available
                  </span>
                )}
                <div className="cart-item-body">
                  <img
                    src={item.image || placeholderImage}
                    alt={item.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <p className="cart-item-addons">
                      {item.addons?.length > 0
                        ? item.addons.map((addon) => addon.name).join(', ')
                        : 'No add-ons'}
                    </p>
                    <span className="cart-item-line-total">
                      {formatCurrency(lineTotal)}
                    </span>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.quantity === 1) {
                          removeItem(item.id, item.addonKey)
                        } else {
                          updateQuantity(item.id, item.addonKey, item.quantity - 1)
                        }
                      }}
                      aria-label={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                    >
                      {item.quantity === 1 ? (
                        <Trash2 size={18} />
                      ) : (
                        <Minus size={18} />
                      )}
                    </button>
                    <span className="qty-num">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.addonKey, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <button
                    className="button ghost button--danger-ghost cart-remove-btn"
                    type="button"
                    onClick={() => removeItem(item.id, item.addonKey)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        <div className="card summary-card cart-summary-card">
          <h3 className="cart-summary-title">Order summary</h3>
          <div className="cart-summary-rows">
            <div className="summary-row">
              <span>Items</span>
              <strong>{itemsCount}</strong>
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatCurrency(subTotal)}</strong>
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
            <div className="summary-row total cart-grand-total">
              <span>Grand total</span>
              <strong>{formatCurrency(grandTotal)}</strong>
            </div>
          </div>
          {discountAmount > 0 && (
            <p className="cart-saved">You saved {formatCurrency(discountAmount)}</p>
          )}
          <button
            className="button primary cart-checkout-btn"
            type="button"
            onClick={() => navigate('/checkout')}
            disabled={hasUnavailableItems}
          >
            {hasUnavailableItems ? 'Remove unavailable items to checkout' : 'Proceed to checkout'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartPage
