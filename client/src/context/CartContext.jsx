import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS, readStorage, writeStorage } from '../utils/storage.js'

const CartContext = createContext(null)

const normalizeAddonsKey = (addons = []) =>
  addons
    .map((addon) => addon._id || addon.id || addon)
    .sort()
    .join('|')

const enrichItem = (item, quantity, addons) => ({
  id: item._id || item.id,
  name: item.name,
  price: Number(item.price || 0),
  image: item.image,
  quantity,
  addons,
  addonKey: normalizeAddonsKey(addons),
})

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => readStorage(STORAGE_KEYS.cart, []))
  const [coupon, setCoupon] = useState(() =>
    readStorage(STORAGE_KEYS.coupon, null),
  )

  useEffect(() => {
    writeStorage(STORAGE_KEYS.cart, items)
  }, [items])

  useEffect(() => {
    writeStorage(STORAGE_KEYS.coupon, coupon)
  }, [coupon])

  const addItem = (item, quantity = 1, addons = []) => {
    setItems((prev) => {
      const enriched = enrichItem(item, quantity, addons)
      const existingIndex = prev.findIndex(
        (entry) =>
          entry.id === enriched.id && entry.addonKey === enriched.addonKey,
      )
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        }
        return updated
      }
      return [...prev, enriched]
    })
  }

  const updateQuantity = (id, addonKey, quantity) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.addonKey === addonKey
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      ),
    )
  }

  const removeItem = (id, addonKey) => {
    setItems((prev) =>
      prev.filter((item) => !(item.id === id && item.addonKey === addonKey)),
    )
  }

  const clearCart = () => {
    setItems([])
    setCoupon(null)
  }

  const applyCoupon = (couponDetails) => {
    setCoupon(couponDetails)
  }

  const clearCoupon = () => {
    setCoupon(null)
  }

  const subTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const addonsTotal = (item.addons || []).reduce(
        (addonSum, addon) => addonSum + Number(addon.price || 0),
        0,
      )
      return sum + (item.price + addonsTotal) * item.quantity
    }, 0)
  }, [items])

  const discountAmount = useMemo(() => {
    if (!coupon) return 0
    if (coupon.discountAmount != null) return Number(coupon.discountAmount)
    if (coupon.discount != null) {
      const discount = Number(coupon.discount)
      if (discount <= 100) {
        return (subTotal * discount) / 100
      }
      return discount
    }
    return 0
  }, [coupon, subTotal])

  const total = Math.max(subTotal - discountAmount, 0)

  const value = useMemo(
    () => ({
      items,
      coupon,
      subTotal,
      discountAmount,
      total,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      applyCoupon,
      clearCoupon,
    }),
    [items, coupon, subTotal, discountAmount, total],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
