export const STORAGE_KEYS = {
  token: 'stillhungry-token',
  user: 'stillhungry-user',
  cart: 'stillhungry-cart',
  coupon: 'stillhungry-coupon',
  orderRatings: 'stillhungry-order-ratings',
}

export const readStorage = (key, fallback = null) => {
  if (typeof window === 'undefined') return fallback
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export const writeStorage = (key, value) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export const readToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEYS.token)
}

export const writeToken = (token) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.token, token || '')
}

export const clearToken = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.token)
}
