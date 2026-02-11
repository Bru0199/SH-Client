import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Star, Info } from 'lucide-react'
import { getErrorMessage, isRouteNotFound, isAlreadyReviewedError } from '../utils/api.js'
import { readStorage, writeStorage, STORAGE_KEYS } from '../utils/storage.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { formatCurrency, formatDateTime, getMenuItemDisplayName, isMenuItemAvailable } from '../utils/format.js'
import StatusTimeline from '../components/StatusTimeline.jsx'
import Invoice from '../components/Invoice.jsx'
import InvoiceModal from '../components/InvoiceModal.jsx'

const STAR_COUNT = 5

const OrdersPage = () => {
  const { user } = useAuth()
  const { orders, menuItems, lastKnownMenuNames, addons, reviews, cancelOrder, addReview, fetchPublicData, loading, errors } = useData()
  const [ratingOrderId, setRatingOrderId] = useState(null)
  const [ratingOverrides, _setRatingOverrides] = useState({})
  const [localRatings, setLocalRatings] = useState(() =>
    readStorage(STORAGE_KEYS.orderRatings, {}),
  )
  const [commentDraft, setCommentDraft] = useState({})

  const [itemRatingDraft, setItemRatingDraft] = useState({})

  const menuMap = useMemo(
    () => new Map(menuItems.map((item) => [item.id, item])),
    [menuItems],
  )

  const userOrders = orders.filter((order) => order.user === user.id)

  const orderRatingByReview = useMemo(() => {
    const map = {}
    reviews.forEach((review) => {
      if (review.order != null && review.user === user?.id && review.rating != null) {
        map[review.order] = review.rating
      }
    })
    return map
  }, [reviews, user?.id])

  const orderReviewByOrder = useMemo(() => {
    const map = {}
    reviews.forEach((review) => {
      if (review.order != null && review.user === user?.id) {
        map[review.order] = review
      }
    })
    return map
  }, [reviews, user?.id])

  const orderReviewsByOrderMenu = useMemo(() => {
    const map = {}
    reviews.forEach((review) => {
      if (review.order != null && review.user === user?.id && review.menu != null) {
        if (!map[review.order]) map[review.order] = {}
        map[review.order][review.menu] = review
      }
    })
    return map
  }, [reviews, user?.id])

  const orderDistinctMenus = (order) => {
    const seen = new Set()
    return (order.items || []).filter((item) => {
      const menuId = item.menu
      if (seen.has(menuId)) return false
      seen.add(menuId)
      return true
    })
  }

  const handleCancel = async (orderId) => {
    try {
      await cancelOrder(orderId)
      toast.success('Order cancelled.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to cancel order.'))
    }
  }

  const setItemDraft = (orderId, menuId, field, value) => {
    setItemRatingDraft((prev) => {
      const order = prev[orderId] ?? {}
      const item = order[menuId] ?? { rating: 0, comment: '' }
      const next = { ...prev, [orderId]: { ...order, [menuId]: { ...item, [field]: value } } }
      return next
    })
  }

  const handleRateItem = (order, menuId, rating) => {
    if (orderRatingByReview[order.id] != null) return
    const value = Math.min(STAR_COUNT, Math.max(1, Number(rating)))
    setItemDraft(order.id, menuId, 'rating', value)
  }

  const handleSubmitOrderReview = async (order) => {
    const orderId = order.id
    if (orderRatingByReview[orderId] != null) {
      toast('You\'ve already rated this order.')
      return
    }
    const distinctItems = orderDistinctMenus(order)
    const drafts = itemRatingDraft[orderId] ?? {}
    const withRating = distinctItems.filter((item) => {
      const d = drafts[item.menu]
      return d?.rating != null && d.rating >= 1
    })
    const singleComment = (commentDraft[orderId] ?? '').trim()
    const hasRating = withRating.length > 0
    const hasComment = singleComment.length > 0
    const canSubmit = hasRating || hasComment
    if (!canSubmit) {
      toast('Add a rating and/or a comment, then submit.')
      return
    }
    const avgRating = hasRating
      ? Math.round(
          withRating.reduce((sum, item) => sum + (drafts[item.menu]?.rating ?? 0), 0) / withRating.length,
        )
      : 0
    const ratingSummary = withRating
      .map((item) => {
        const d = drafts[item.menu]
        const name = getMenuItemDisplayName(menuMap, item.menu, item.name, lastKnownMenuNames)
        return `${name}: ${d.rating}/5`
      })
      .join(', ')
    const combinedComment = hasRating && hasComment
      ? `${ratingSummary}. — ${singleComment}`
      : hasRating
        ? ratingSummary
        : singleComment
    const orderShortId = order.id?.toString?.().slice(-6) || '—'
    const resolveMenuIdFromItem = (item) => {
      if (!item) return null
      const fromMenu = item.menu != null
        ? (typeof item.menu === 'object' ? (item.menu?.id ?? item.menu?._id) : item.menu)
        : null
      if (fromMenu != null && fromMenu !== '') return fromMenu
      const fromMenuId = item.menuId != null
        ? (typeof item.menuId === 'object' ? (item.menuId?.id ?? item.menuId?._id) : item.menuId)
        : null
      if (fromMenuId != null && fromMenuId !== '') return fromMenuId
      const fromMenuIdKey = item.menu_id != null
        ? (typeof item.menu_id === 'object' ? (item.menu_id?.id ?? item.menu_id?._id) : item.menu_id)
        : null
      return (fromMenuIdKey != null && fromMenuIdKey !== '') ? fromMenuIdKey : null
    }
    let firstMenuId = (order.items || []).map(resolveMenuIdFromItem).find((id) => id != null && id !== '')
    if (firstMenuId == null || firstMenuId === '') {
      const distinct = orderDistinctMenus(order)
      const firstDistinct = distinct[0]
      firstMenuId = firstDistinct ? resolveMenuIdFromItem(firstDistinct) : null
    }
    if (firstMenuId == null || firstMenuId === '') {
      toast.error(`Unable to submit review for Order #${orderShortId}: no menu item to attach the review to.`)
      return
    }
    setRatingOrderId(orderId)
    try {
      await addReview({
        order: orderId,
        menu: firstMenuId,
        rating: avgRating,
        comment: combinedComment,
      })
      setItemRatingDraft((prev) => {
        const next = { ...prev }
        delete next[orderId]
        return next
      })
      setCommentDraft((prev) => {
        const next = { ...prev }
        delete next[orderId]
        return next
      })
      setLocalRatings((prev) => {
        const next = { ...prev }
        delete next[orderId]
        writeStorage(STORAGE_KEYS.orderRatings, next)
        return next
      })
      toast.success('Thanks! Your ratings have been saved.')
    } catch (error) {
      if (isAlreadyReviewedError(error)) {
        setItemRatingDraft((prev) => {
          const next = { ...prev }
          delete next[orderId]
          return next
        })
        toast('You\'ve already rated this order.')
        fetchPublicData()
      } else if (isRouteNotFound(error)) {
        setLocalRatings((prev) => {
          const next = { ...prev, [orderId]: avgRating }
          writeStorage(STORAGE_KEYS.orderRatings, next)
          return next
        })
        toast.success('Thanks! Your rating has been saved.')
      } else {
        toast.error(getErrorMessage(error, 'Unable to save rating.'))
      }
    } finally {
      setRatingOrderId(null)
    }
  }

  const getOrderRating = (order) =>
    orderRatingByReview[order.id] ??
    order.rating ??
    ratingOverrides[order.id] ??
    localRatings[order.id] ??
    null

  if (loading.orders) {
    return (
      <div className="container">
        <div className="card empty-state">
          <h2>Loading orders</h2>
          <p>Please wait while we fetch your latest orders.</p>
        </div>
      </div>
    )
  }

  if (userOrders.length === 0) {
    return (
      <div className="container">
        {errors.orders && <div className="alert error">{errors.orders}</div>}
        <div className="card empty-state">
          <h2>No orders yet</h2>
          <p>Place your first order and track it here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      {errors.orders && <div className="alert error">{errors.orders}</div>}
      <header className="section-header orders-page-header">
        <h2>Your orders</h2>
        <span className="badge badge--live">Live status</span>
      </header>
      <div className="orders-list">
        {userOrders.map((order) => (
          <div className="card order-card" key={order.id}>

            <div className="order-card-detail">
              <div className="order-card-header">
              <div className="order-card-meta">
                <h3 className="order-card-title">Order #{order.id?.toString?.().slice(-6) || '—'}</h3>
                <p className="order-card-date">Placed {formatDateTime(order.createdAt)}</p>
              </div>
              <div className="order-card-badges">
                <span className="status-pill info">{order.paymentMethod}</span>
                <span
                  className={`status-pill ${
                    order.paymentStatus === 'Paid' ? 'success' : 'warning'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
            <div className="order-card-items">
              {(order.items || []).map((item) => {
                const menuItem = menuMap.get(item.menu)
                const unitPrice = menuItem?.price || 0
                const totalPrice = unitPrice * item.quantity
                const itemAddons = (item.addons || []).map((addonIdOrObj) => {
                  const addonId = typeof addonIdOrObj === 'object' ? (addonIdOrObj.id || addonIdOrObj._id) : addonIdOrObj
                  return addons.find((a) => a.id === addonId)
                }).filter(Boolean)
                return (
                  <div key={item.menu + (item.addonKey || '')} className="order-item-block">
                    <div className="order-item-row">
                      <span className="order-item-label">
                        {getMenuItemDisplayName(menuMap, item.menu, item.name, lastKnownMenuNames)} x {item.quantity}
                        <span className="order-item-unit">@ {formatCurrency(unitPrice)}</span>
                      </span>
                      <span className="order-item-total">{formatCurrency(totalPrice)}</span>
                    </div>
                    {itemAddons.length > 0 && itemAddons.map((addon) => {
                      const addonTotal = addon.price * item.quantity
                      return (
                        <div key={addon.id} className="order-item-addon-row">
                          <span className="order-item-label">
                            {addon.name} x {item.quantity}
                            <span className="order-item-unit">@ {formatCurrency(addon.price)}</span>
                          </span>
                          <span className="order-item-total">{formatCurrency(addonTotal)}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
            <div className="order-card-summary">
              <div className="summary-row">
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
                          return addons.find((a) => a.id === addonId)
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
              <div className="summary-row total">
                <span>Grand total</span>
                <strong>
                  {formatCurrency(
                    order.total ??
                    (() => {
                      const subtotal = (order.items || []).reduce((sum, item) => {
                        const menuItem = menuMap.get(item.menu)
                        const unitPrice = menuItem?.price || 0
                        const itemTotal = unitPrice * item.quantity
                        const itemAddons = (item.addons || []).map((addonIdOrObj) => {
                          const addonId = typeof addonIdOrObj === 'object' ? (addonIdOrObj.id || addonIdOrObj._id) : addonIdOrObj
                          return addons.find((a) => a.id === addonId)
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
            </div>
            <div className="order-card-status">
              <StatusTimeline status={order.status} />
            </div>
            <div className="order-card-actions">
              {order.status === 'Delivered' && (
                <InvoiceModal order={order} menuMap={menuMap} />
              )}
              {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                <button
                  className="button ghost button--danger-ghost"
                  type="button"
                  onClick={() => handleCancel(order.id)}
                >
                  Cancel order
                </button>
              )}
            </div>
            </div>

            {order.status === 'Delivered' && (
              <div className="order-card-rating">
                {orderRatingByReview[order.id] != null ? (
                  <div className="order-rating-card-done">
                    <div className="order-rating-card-done-header">
                      <Star size={20} fill="currentColor" strokeWidth={0} className="order-rating-card-done-icon" />
                      <span className="order-card-rating-label">You rated this order</span>
                    </div>
                    <div className="order-rating-summary">
                      <span className="order-card-rating-value">
                        {getOrderRating(order)} / {STAR_COUNT} stars
                      </span>
                      {orderReviewByOrder[order.id]?.comment && (
                        <p className="order-card-rating-comment">{orderReviewByOrder[order.id].comment}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="order-rating-block">
                    <div className="order-rating-card-header">
                      <Star size={22} strokeWidth={1.5} className="order-rating-card-star-icon" />
                      <h4 className="order-rating-card-title">Rate your experience</h4>
                      <p className="order-rating-heading">Rate any items and/or add a comment — both optional.</p>
                    </div>
                    <ul className="order-rating-items" aria-label="Rate each item">
                      {orderDistinctMenus(order).map((item) => {
                        const menuId = item.menu
                        const menuName = getMenuItemDisplayName(menuMap, menuId, item.name, lastKnownMenuNames)
                        const isMenuUnavailable = !isMenuItemAvailable(menuMap, menuId)
                        const existingReview = orderReviewsByOrderMenu[order.id]?.[menuId]
                        const draft = itemRatingDraft[order.id]?.[menuId]
                        const currentRating = existingReview?.rating ?? draft?.rating ?? 0
                        const isUpdating = ratingOrderId === order.id
                        const starsDisabled = isUpdating || isMenuUnavailable
                        return (
                          <li
                            key={menuId}
                            className={`order-rating-item ${isMenuUnavailable ? 'order-rating-item--unavailable' : ''}`}
                            title={isMenuUnavailable ? 'Menu not available — this item was removed from the menu' : undefined}
                          >
                            <span className="order-rating-item-name">
                              {menuName}
                              {isMenuUnavailable && (
                                <span className="order-rating-item-unavailable-hint" title="Menu not available — item was removed from the menu">
                                  <Info size={14} aria-hidden />
                                </span>
                              )}
                            </span>
                            <div
                              className={`order-rating-stars order-rating-stars--inline ${isMenuUnavailable ? 'order-rating-stars--disabled' : ''}`}
                              role="group"
                              aria-label={isMenuUnavailable ? 'Rating not available — menu item removed' : `Rate ${menuName}`}
                              title={isMenuUnavailable ? 'Menu not available' : undefined}
                            >
                              {Array.from({ length: STAR_COUNT }, (_, i) => {
                                const value = i + 1
                                const filled = value <= currentRating
                                return (
                                  <button
                                    key={value}
                                    type="button"
                                    className="order-rating-star"
                                    onClick={() => handleRateItem(order, menuId, value)}
                                    disabled={starsDisabled}
                                    aria-label={`${value} star${value === 1 ? '' : 's'}`}
                                    aria-pressed={filled}
                                    title={isMenuUnavailable ? 'Menu not available' : undefined}
                                  >
                                    <Star
                                      size={20}
                                      fill={filled ? 'currentColor' : 'none'}
                                      strokeWidth={2}
                                      className={filled ? 'order-rating-star-filled' : 'order-rating-star-empty'}
                                    />
                                  </button>
                                )
                              })}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                    <label className="order-rating-comment-label" htmlFor={`order-comment-${order.id}`}>
                      Your comment (optional)
                    </label>
                    <textarea
                      id={`order-comment-${order.id}`}
                      className="order-rating-comment-box"
                      placeholder="How was everything? Share your experience..."
                      value={commentDraft[order.id] ?? ''}
                      onChange={(e) => setCommentDraft((prev) => ({ ...prev, [order.id]: e.target.value }))}
                      maxLength={500}
                      rows={3}
                      aria-label="Review comment for this order"
                    />
                    <button
                      type="button"
                      className="button primary order-rating-submit"
                      onClick={() => handleSubmitOrderReview(order)}
                      disabled={ratingOrderId === order.id}
                    >
                      {ratingOrderId === order.id ? 'Saving…' : 'Submit review'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrdersPage
