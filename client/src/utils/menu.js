export const resolveMenuAddons = (menuItem, addons) => {
  if (!menuItem || !Array.isArray(menuItem.addons)) return []
  if (menuItem.addons.length === 0) return []

  if (typeof menuItem.addons[0] === 'object') {
    return menuItem.addons
  }

  const addonIds = menuItem.addons.map((addon) => addon?.toString?.() || addon)
  return addons.filter((addon) => addonIds.includes(addon.id || addon._id))
}
