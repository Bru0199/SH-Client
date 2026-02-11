export const MENU_ITEM_UNAVAILABLE_LABEL = 'Menu item'

const getByNameId = (map, id) => {
  if (!map || id == null) return null
  const v = map.get(id) ?? map.get(String(id))
  return (v && String(v).trim()) || null
}

export const getMenuItemDisplayName = (menuMap, menuId, fallbackName, lastKnownNames) => {
  const fallback = (fallbackName && String(fallbackName).trim()) ? String(fallbackName).trim() : null
  const fromCache = getByNameId(lastKnownNames, menuId)
  const resolvedFallback = fallback || fromCache || null
  if (!menuMap || menuId == null) {
    return resolvedFallback || MENU_ITEM_UNAVAILABLE_LABEL
  }
  const menu = menuMap.get(menuId) ?? menuMap.get(String(menuId))
  if (menu?.name?.trim()) return menu.name
  return resolvedFallback || MENU_ITEM_UNAVAILABLE_LABEL
}

export const isMenuItemAvailable = (menuMap, menuId) => {
  if (!menuMap || menuId == null) return false
  const menu = menuMap.get(menuId)
  return Boolean(menu?.name?.trim())
}

export const formatCurrency = (amount) => {
  const value = Number(amount || 0)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatDateTime = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
