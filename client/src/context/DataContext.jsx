import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext.jsx'
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  getErrorMessage,
  isRouteNotFound,
  resolveImageUrl,
} from '../utils/api.js'

const ADMIN_USERS_PATH = import.meta.env.VITE_API_ADMIN_USERS_PATH || '/api/admin/users'

const DataContext = createContext(null)

const extractArray = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (payload?.data && typeof payload.data === 'object') {
    for (const key of keys) {
      if (Array.isArray(payload.data[key])) {
        return payload.data[key]
      }
    }
  }
  if (Array.isArray(payload?.results)) return payload.results
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key]
    }
  }
  return []
}

const extractItem = (payload, keys = []) => {
  if (!payload) return null
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    for (const key of keys) {
      if (payload.data[key]) return payload.data[key]
    }
    return payload.data
  }
  for (const key of keys) {
    if (payload?.[key]) return payload[key]
  }
  return payload
}

const resolveId = (value) => {
  if (!value) return value
  if (typeof value === 'object') return value.id || value._id
  return value
}

const normalizeEntity = (item) => {
  if (!item) return null
  const id = item.id || item._id
  return { ...item, id }
}

const normalizeCategory = (category) => {
  const next = normalizeEntity(category)
  if (!next) return null
  const status =
    next.status || (next.active === false ? 'inactive' : 'active')
  return {
    ...next,
    name: next.name || next.title || '',
    description: next.description || next.desc || '',
    price: Number(next.price ?? next.cost ?? 0),
    image: resolveImageUrl(next.image || next.imageUrl || next.image_url),
    status,
  }
}

const normalizeAddon = (addon) => {
  const next = normalizeEntity(addon)
  if (!next) return null
  return {
    ...next,
    name: next.name || next.title || '',
    price: Number(next.price ?? 0),
    available: next.available ?? next.isAvailable ?? true,
  }
}

const normalizeMenuItem = (item) => {
  const next = normalizeEntity(item)
  if (!next) return null
  return {
    ...next,
    name: next.name || next.title || '',
    description: next.description || next.desc || '',
    image: resolveImageUrl(next.image || next.imageUrl || next.image_url),
    category: resolveId(next.category) || '',
    addons: Array.isArray(next.addons)
      ? next.addons.map((addon) => resolveId(addon))
      : [],
    available: next.available ?? next.isAvailable ?? true,
    veg: next.type === 'non-veg' ? false : (next.type === 'veg' ? true : (next.veg ?? next.vegetarian ?? true)),
  }
}

const normalizeCoupon = (coupon) => {
  const next = normalizeEntity(coupon)
  if (!next) return null
  return {
    ...next,
    code:
      next.code?.toString?.().toUpperCase() ||
      next.couponCode?.toString?.().toUpperCase() ||
      next.coupon_code?.toString?.().toUpperCase() ||
      '',
    discount: Number(next.discount ?? next.amount ?? 0),
    minOrderAmount: Number(next.minOrderAmount ?? next.min_order_amount ?? 0),
  }
}

const normalizeUser = (user) => {
  const next = normalizeEntity(user)
  if (!next) return null
  const status =
    next.status || (next.active === false ? 'inactive' : next.active ? 'active' : undefined)
  return {
    ...next,
    username:
      next.username || next.name || next.fullName || next.full_name || '',
    status: status || next.status || 'active',
  }
}

const normalizeReview = (review) => {
  const next = normalizeEntity(review)
  if (!next) return null
  const menuObj = typeof next.menu === 'object' ? next.menu : null
  const menuName =
    next.menuName?.trim() ||
    menuObj?.name?.trim() ||
    null
  return {
    ...next,
    user: resolveId(next.user),
    menu: resolveId(next.menu),
    menuName: menuName || undefined,
    order: resolveId(next.order) ?? resolveId(next.order_id) ?? null,
    rating: next.rating != null ? Number(next.rating) : null,
    comment: next.comment != null ? String(next.comment) : '',
    approved: next.approved ?? next.isApproved ?? true,
  }
}

const normalizeOrderItem = (item) => {
  if (!item) return item
  const menuId = resolveId(item.menu)
  const menuObj = typeof item.menu === 'object' ? item.menu : null
  const dishObj = typeof item.dish === 'object' ? item.dish : null
  const productObj = typeof item.product === 'object' ? item.product : null
  const name =
    item.name?.trim() ||
    item.menuName?.trim() ||
    item.menu_name?.trim() ||
    item.itemName?.trim() ||
    item.productName?.trim() ||
    item.product_name?.trim() ||
    item.dishName?.trim() ||
    item.foodName?.trim() ||
    item.title?.trim() ||
    item.label?.trim() ||
    menuObj?.name?.trim() ||
    menuObj?.title?.trim() ||
    menuObj?.menuName?.trim() ||
    dishObj?.name?.trim() ||
    productObj?.name?.trim() ||
    null
  return {
    ...item,
    quantity: item.quantity ?? item.qty ?? 1,
    menu: menuId,
    name: name || undefined,
    addons: Array.isArray(item.addons)
      ? item.addons.map((addon) =>
          typeof addon === 'object' ? normalizeEntity(addon) : addon,
        )
      : [],
  }
}

const normalizeOrder = (order) => {
  const next = normalizeEntity(order)
  if (!next) return null
  const userObj =
    typeof next.user === 'object'
      ? normalizeUser(next.user)
      : next.userObj
      ? normalizeUser(next.userObj)
      : null
  return {
    ...next,
    user: userObj?.id || resolveId(next.user),
    userObj,
    items: Array.isArray(next.items)
      ? next.items.map(normalizeOrderItem)
      : [],
    paymentStatus:
      next.paymentStatus ||
      next.payment_status ||
      (next.isPaid ? 'Paid' : 'Pending'),
    paymentMethod:
      next.paymentMethod || next.payment_method || next.method || next.paymentType,
    deliveryFee: next.deliveryFee ?? next.delivery_fee ?? 0,
    taxes: next.taxes ?? next.tax ?? 0,
    total: next.total ?? next.amount ?? next.grandTotal ?? next.grand_total,
    subTotal: next.subTotal ?? next.sub_total ?? next.subtotal,
    rating: next.rating ?? next.order_rating ?? next.orderRating ?? null,
  }
}

const buildFormData = (payload) => {
  const formData = new FormData()
  const hasImageFile = Boolean(payload?.imageFile)
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (key === 'imageFile') return
    if (key === 'image' && hasImageFile) return
    if (value == null || value === '') return
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value))
      return
    }
    if (typeof value === 'boolean') {
      formData.append(key, value ? 'true' : 'false')
      return
    }
    if (typeof value === 'number') {
      formData.append(key, String(value))
      return
    }
    formData.append(key, value)
  })
  if (hasImageFile) {
    formData.append('image', payload.imageFile)
  }
  return formData
}

const stripImageFile = (payload) => {
  if (!payload) return payload
  const { imageFile: _imageFile, ...rest } = payload
  return rest
}

const useLastKnownMenuNames = (menuItems, orders) => {
  return useMemo(() => {
    const next = new Map()
    menuItems.forEach((m) => {
      if (m?.id != null && m?.name?.trim()) {
        const name = m.name.trim()
        next.set(m.id, name)
        next.set(String(m.id), name)
      }
    })
    ;(orders || []).forEach((order) => {
      ;(order.items || []).forEach((item) => {
        const id = item?.menu
        const name = item?.name?.trim()
        if (id != null && name) {
          next.set(id, name)
          next.set(String(id), name)
        }
      })
    })
    return next
  }, [menuItems, orders])
}

export const DataProvider = ({ children }) => {
  const { user, token } = useAuth()
  const [categories, setCategories] = useState([])
  const [addons, setAddons] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [coupons, setCoupons] = useState([])
  const [users, setUsers] = useState([])
  const [reviews, setReviews] = useState([])
  const [orders, setOrders] = useState([])
  const lastKnownMenuNames = useLastKnownMenuNames(menuItems, orders)
  const [adminStats, setAdminStats] = useState(null)
  const [loading, setLoading] = useState({
    public: false,
    admin: false,
    orders: false,
  })
  const [errors, setErrors] = useState({
    public: '',
    admin: '',
    orders: '',
  })

  const setLoadingState = (key, value) => {
    setLoading((prev) => ({ ...prev, [key]: value }))
  }

  const setErrorState = (key, error, fallback) => {
    const message = error ? getErrorMessage(error, fallback) : ''
    setErrors((prev) => ({ ...prev, [key]: message }))
  }

  useEffect(() => {
    const socketUrl = window.location.origin
    const socket = io(socketUrl, {
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionAttempts: 5,
    })
    socket.on('connect_error', () => {

    })
    socket.on('orderStatus', (payload) => {
      if (!payload?.orderId) return
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== payload.orderId) return order
          return {
            ...order,
            ...(payload.status != null && { status: payload.status }),
            ...(payload.paymentStatus != null && { paymentStatus: payload.paymentStatus }),
          }
        }),
      )
    })
    socket.on('orderUpdated', (payload) => {
      const order = payload?.order ?? payload?.data ?? payload
      if (!order?.id) return
      const normalized = normalizeOrder(order)
      if (normalized) {
        setOrders((prev) =>
          prev.some((o) => o.id === normalized.id)
            ? prev.map((o) => (o.id === normalized.id ? normalized : o))
            : [normalized, ...prev],
        )
      } else {
        fetchOrders()
      }
    })
    socket.on('ordersUpdated', () => fetchOrders())
    socket.on('categoriesUpdated', () => fetchPublicData())
    socket.on('menuUpdated', () => fetchPublicData())
    socket.on('addonsUpdated', () => fetchPublicData())
    socket.on('couponsUpdated', () => fetchPublicData())
    socket.on('reviewsUpdated', () => fetchPublicData())
    socket.on('usersUpdated', () => fetchAdminData())
    socket.on('dataUpdated', (payload) => {
      const type = payload?.type ?? payload?.collection
      if (type === 'orders') fetchOrders()
      else if (['categories', 'menu', 'addons', 'coupons', 'reviews'].includes(type)) fetchPublicData()
      else if (type === 'users') fetchAdminData()
    })
    return () => socket.disconnect()
  }, [token])

  const fetchPublicData = async () => {
    setLoadingState('public', true)
    setErrorState('public', null)
    try {
      const results = await Promise.allSettled([
        apiGet('/api/categories', { auth: false }),
        apiGet('/api/addons', { auth: false }),
        apiGet('/api/menu', { auth: false }),
        apiGet('/api/coupons', { auth: false }),
        apiGet('/api/reviews', { auth: false }),
      ])

      const [
        categoriesResult,
        addonsResult,
        menuResult,
        couponsResult,
        reviewsResult,
      ] = results

      if (categoriesResult.status === 'fulfilled') {
        setCategories(
          extractArray(categoriesResult.value, ['categories']).map(normalizeCategory),
        )
      }
      if (addonsResult.status === 'fulfilled') {
        setAddons(
          extractArray(addonsResult.value, ['addons']).map(normalizeAddon),
        )
      }
      if (menuResult.status === 'fulfilled') {
        setMenuItems(
          extractArray(menuResult.value, ['menu', 'items']).map(normalizeMenuItem),
        )
      }
      if (couponsResult.status === 'fulfilled') {
        setCoupons(
          extractArray(couponsResult.value, ['coupons']).map(normalizeCoupon),
        )
      }
      if (reviewsResult.status === 'fulfilled') {
        setReviews(
          extractArray(reviewsResult.value, ['reviews']).map(normalizeReview),
        )
      }

      const firstError = results.find((result) => result.status === 'rejected')
      if (firstError?.status === 'rejected') {
        setErrorState('public', firstError.reason, 'Unable to load menu data.')
      }
    } catch (error) {
      setErrorState('public', error, 'Unable to load menu data.')
    } finally {
      setLoadingState('public', false)
    }
  }

  const fetchOrders = async () => {
    if (!token && !user) {
      setOrders([])
      return
    }
    setLoadingState('orders', true)
    setErrorState('orders', null)
    try {
      const endpoint =
        user?.role === 'admin' ? '/api/admin/orders' : '/api/orders'
      const response = await apiGet(endpoint)
      setOrders(
        extractArray(response, ['orders']).map(normalizeOrder).filter(Boolean),
      )
    } catch (error) {
      setErrorState('orders', error, 'Unable to load orders.')
    } finally {
      setLoadingState('orders', false)
    }
  }

  const fetchAdminData = async () => {
    if ((!token && !user) || user?.role !== 'admin') return
    setLoadingState('admin', true)
    setErrorState('admin', null)
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        apiGet('/api/admin/stats'),
        apiGet(ADMIN_USERS_PATH),
      ])
      const resolvedStats = extractItem(statsResponse, ['stats'])
      setAdminStats(resolvedStats || null)
      setUsers(
        extractArray(usersResponse, ['users']).map(normalizeUser).filter(Boolean),
      )
    } catch (error) {
      setErrorState('admin', error, 'Unable to load admin data.')
    } finally {
      setLoadingState('admin', false)
    }
  }

  useEffect(() => {
    fetchPublicData()
  }, [])

  useEffect(() => {
    fetchOrders()
    fetchAdminData()
  }, [token, user?.role, user?.id])

  useEffect(() => {
    if (user?.role !== 'admin') {
      setUsers([])
      setAdminStats(null)
    }
  }, [user?.role])

  const addCategory = async (payload) => {
    const hasFile = Boolean(payload?.imageFile)
    const body = hasFile ? buildFormData(payload) : stripImageFile(payload)
    const response = await apiPost('/api/categories', body, {
      isFormData: hasFile,
    })
    const created = normalizeCategory(
      extractItem(response, ['category', 'data']),
    )
    if (created) {
      setCategories((prev) => [created, ...prev])
    } else {
      await fetchPublicData()
    }
    return created
  }

  const updateCategory = async (id, payload) => {
    const hasFile = Boolean(payload?.imageFile)
    const body = hasFile ? buildFormData(payload) : stripImageFile(payload)
    const response = await apiPut(`/api/categories/${id}`, body, {
      isFormData: hasFile,
    })
    const updated = normalizeCategory(
      extractItem(response, ['category', 'data']),
    )
    if (updated) {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updated : cat)),
      )
    } else {
      await fetchPublicData()
    }
    return updated
  }

  const deleteCategory = async (id) => {
    await apiDelete(`/api/categories/${id}`)
    setCategories((prev) => prev.filter((cat) => cat.id !== id))
    setMenuItems((prev) =>
      prev.map((item) =>
        item.category === id ? { ...item, category: '' } : item,
      ),
    )
  }

  const addAddon = async (payload) => {
    const response = await apiPost('/api/addons', payload)
    const created = normalizeAddon(extractItem(response, ['addon', 'data']))
    if (created) {
      setAddons((prev) => [created, ...prev])
    } else {
      await fetchPublicData()
    }
    return created
  }

  const updateAddon = async (id, payload) => {
    const response = await apiPut(`/api/addons/${id}`, payload)
    const updated = normalizeAddon(extractItem(response, ['addon', 'data']))
    if (updated) {
      setAddons((prev) =>
        prev.map((addon) => (addon.id === id ? updated : addon)),
      )
    } else {
      await fetchPublicData()
    }
    return updated
  }

  const deleteAddon = async (id) => {
    await apiDelete(`/api/addons/${id}`)
    setAddons((prev) => prev.filter((addon) => addon.id !== id))
    setMenuItems((prev) =>
      prev.map((item) => ({
        ...item,
        addons: (item.addons || []).filter((addonId) => addonId !== id),
      })),
    )
  }

  const addMenuItem = async (payload) => {
    const hasFile = Boolean(payload?.imageFile)
    const body = hasFile ? buildFormData(payload) : stripImageFile(payload)
    const response = await apiPost('/api/menu', body, {
      isFormData: hasFile,
    })
    const created = normalizeMenuItem(
      extractItem(response, ['menu', 'item', 'data']),
    )
    if (created) {
      setMenuItems((prev) => [created, ...prev])
    } else {
      await fetchPublicData()
    }
    return created
  }

  const updateMenuItem = async (id, payload) => {
    const hasFile = Boolean(payload?.imageFile)
    const body = hasFile ? buildFormData(payload) : stripImageFile(payload)
    const response = await apiPut(`/api/menu/${id}`, body, {
      isFormData: hasFile,
    })
    const updated = normalizeMenuItem(
      extractItem(response, ['menu', 'item', 'data']),
    )
    if (updated) {
      setMenuItems((prev) =>
        prev.map((item) => (item.id === id ? updated : item)),
      )
    } else {
      await fetchPublicData()
    }
    return updated
  }

  const deleteMenuItem = async (id) => {
    await apiDelete(`/api/menu/${id}`)
    setMenuItems((prev) => prev.filter((item) => item.id !== id))
  }

  const addCoupon = async (payload) => {
    const response = await apiPost('/api/coupons', payload)
    const created = normalizeCoupon(extractItem(response, ['coupon', 'data']))
    if (created) {
      setCoupons((prev) => [created, ...prev])
    } else {
      await fetchPublicData()
    }
    return created
  }

  const updateCoupon = async (id, payload) => {
    const response = await apiPut(`/api/coupons/${id}`, payload)
    const updated = normalizeCoupon(extractItem(response, ['coupon', 'data']))
    if (updated) {
      setCoupons((prev) =>
        prev.map((coupon) => (coupon.id === id ? updated : coupon)),
      )
    } else {
      await fetchPublicData()
    }
    return updated
  }

  const deleteCoupon = async (id) => {
    await apiDelete(`/api/coupons/${id}`)
    setCoupons((prev) => prev.filter((coupon) => coupon.id !== id))
  }

  const addUser = async (payload) => {
    const response = await apiPost(ADMIN_USERS_PATH, payload)
    const created = normalizeUser(extractItem(response, ['user', 'data']))
    if (created) {
      setUsers((prev) => [created, ...prev])
    } else {
      await fetchAdminData()
    }
    return created
  }

  const updateUser = async (id, payload) => {
    const response = await apiPut(`${ADMIN_USERS_PATH}/${id}`, payload)
    const updated = normalizeUser(extractItem(response, ['user', 'data']))
    if (updated) {
      setUsers((prev) =>
        prev.map((userEntry) => (userEntry.id === id ? updated : userEntry)),
      )
    } else {
      await fetchAdminData()
    }
    return updated
  }

  const deleteUser = async (id) => {
    await apiDelete(`${ADMIN_USERS_PATH}/${id}`)
    setUsers((prev) => prev.filter((userEntry) => userEntry.id !== id))
  }

  const addReview = async (payload) => {
    const response = await apiPost('/api/reviews', payload)
    const created = normalizeReview(extractItem(response, ['review', 'data']))
    if (created) {
      setReviews((prev) => [created, ...prev])
    } else {
      await fetchPublicData()
    }
    return created
  }

  const toggleReviewApproval = async (id) => {
    const response = await apiPatch(`/api/admin/reviews/${id}/toggle`)
    const updated = normalizeReview(extractItem(response, ['review', 'data']))
    if (updated) {
      setReviews((prev) =>
        prev.map((review) => (review.id === id ? updated : review)),
      )
    } else {
      await fetchPublicData()
    }
    return updated
  }

  const deleteReview = async (id) => {
    try {
      await apiDelete(`/api/reviews/${id}`)
    } catch (error) {
      if (isRouteNotFound(error)) {
        setReviews((prev) => prev.filter((review) => review.id !== id))
        return
      }
      throw error
    }
    setReviews((prev) => prev.filter((review) => review.id !== id))
  }

  const addOrder = async (payload) => {
    const response = await apiPost('/api/orders', payload)
    const created = normalizeOrder(extractItem(response, ['order', 'data']))
    if (created) {
      setOrders((prev) => [created, ...prev])
    } else {
      await fetchOrders()
    }
    return created
  }

  const updateOrderStatus = async (id, status) => {
    const response = await apiPut(`/api/orders/${id}/status`, { status })
    const updated = normalizeOrder(extractItem(response, ['order', 'data']))
    if (updated) {
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? updated : order)),
      )
    } else {
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? { ...order, status } : order)),
      )
    }
  }

  const updateOrderPaymentStatus = async (id, paymentStatus) => {
    const response = await apiPut(`/api/orders/${id}/status`, { paymentStatus })
    const updated = normalizeOrder(extractItem(response, ['order', 'data']))
    if (updated) {
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? updated : order)),
      )
    } else {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, paymentStatus } : order,
        ),
      )
    }
  }

  const updateOrder = async (id, payload) => {
    const response = await apiPut(`/api/orders/${id}`, payload)
    const updated = normalizeOrder(extractItem(response, ['order', 'data']))
    if (updated) {
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? updated : order)),
      )
    }
    return updated
  }

  const cancelOrder = async (id) => {
    const response = await apiPut(`/api/orders/${id}/cancel`)
    const updated = normalizeOrder(extractItem(response, ['order', 'data']))
    if (updated) {
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? updated : order)),
      )
    } else {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status: 'Cancelled' } : order,
        ),
      )
    }
  }

  const validateCoupon = async (code, orderAmount) => {
    const normalized = code?.toString?.().trim().toUpperCase()
    if (!normalized) {
      throw new Error('Please enter a coupon code.')
    }
    const response = await apiPost('/api/coupons/validate', {
      code: normalized,
      orderAmount,
      amount: orderAmount,
    })
    const resolvedCoupon = normalizeCoupon(
      extractItem(response, ['coupon', 'data']),
    )
    const discountAmount =
      response?.discountAmount ??
      response?.data?.discountAmount ??
      response?.discount ??
      0
    if (!resolvedCoupon && response?.message) {
      throw new Error(response.message)
    }
    return { coupon: resolvedCoupon, discountAmount }
  }

  const stats = useMemo(() => {
    if (adminStats) return adminStats
    const revenue = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    )
    const pendingOrders = orders.filter(
      (order) => order.status !== 'Delivered' && order.status !== 'Cancelled',
    ).length
    return {
      users: users.length,
      orders: orders.length,
      revenue,
      pendingOrders,
    }
  }, [adminStats, orders, users])

  const value = useMemo(
    () => ({
      categories,
      addons,
      menuItems,
      lastKnownMenuNames,
      coupons,
      users,
      reviews,
      orders,
      stats,
      loading,
      errors,
      fetchPublicData,
      fetchOrders,
      fetchAdminData,
      addCategory,
      updateCategory,
      deleteCategory,
      addAddon,
      updateAddon,
      deleteAddon,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      addUser,
      updateUser,
      deleteUser,
      addReview,
      toggleReviewApproval,
      deleteReview,
      addOrder,
      updateOrderStatus,
      updateOrderPaymentStatus,
      updateOrder,
      cancelOrder,
      validateCoupon,
    }),
    [
      categories,
      addons,
      menuItems,
      lastKnownMenuNames,
      coupons,
      users,
      reviews,
      orders,
      stats,
      loading,
      errors,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}
