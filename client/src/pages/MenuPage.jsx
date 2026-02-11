import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { formatCurrency } from '../utils/format.js'
import { resolveMenuAddons } from '../utils/menu.js'
import { useCart } from '../context/CartContext.jsx'
import Modal from '../components/Modal.jsx'
import placeholderImage from '../assets/placeholder-food.svg'

const MenuPage = () => {
  const navigate = useNavigate()
  const { user, openAuthModal } = useAuth()
  const { menuItems, categories, addons, loading, errors } = useData()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const { addItem, items: cartItems } = useCart()

  const activeCategories = useMemo(
    () => categories.filter((c) => c.status === 'active'),
    [categories],
  )
  const activeCategoryIds = useMemo(
    () => new Set(activeCategories.map((c) => c.id)),
    [activeCategories],
  )

  const filteredMenu = useMemo(() => {
    return menuItems.filter((item) => {
      if (!item) return false
      const inActiveCategory = !item.category || activeCategoryIds.has(item.category)
      if (!inActiveCategory) return false
      const matchesSearch =
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        categoryFilter === 'all' || item.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [menuItems, search, categoryFilter, activeCategoryIds])

  const categoryMap = useMemo(
    () => new Map(activeCategories.map((category) => [category.id, category.name])),
    [activeCategories],
  )

  const categoryColorClasses = [
    'category-pill-bg-0',
    'category-pill-bg-1',
    'category-pill-bg-2',
    'category-pill-bg-3',
    'category-pill-bg-4',
  ]
  const getCategoryColor = (categoryId) => {
    const index = activeCategories.findIndex((category) => category.id === categoryId)
    if (index < 0) return categoryColorClasses[0]
    return categoryColorClasses[index % categoryColorClasses.length]
  }

  const isItemInCart = (itemId) =>
    cartItems.some((entry) => (entry.id || entry._id) === itemId)

  const pageSize = 8
  const totalPages = Math.max(1, Math.ceil(filteredMenu.length / pageSize))
  const activePage = Math.min(currentPage, totalPages)
  const paginatedMenu = filteredMenu.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize,
  )

  const openModal = (item) => {
    if (!user) {
      toast.error('Please login to add items.')
      openAuthModal('login')
      return
    }
    setSelectedItem(item)
    setSelectedAddons([])
    setQuantity(1)
  }

  const closeModal = () => {
    setSelectedItem(null)
  }

  const handleAddonToggle = (addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((entry) => entry.id === addon.id)
      if (exists) {
        return prev.filter((entry) => entry.id !== addon.id)
      }
      return [...prev, addon]
    })
  }

  const handleAddToCart = () => {
    if (!selectedItem) return
    if (!user) {
      toast.error('Please login to continue.')
      openAuthModal('login')
      return
    }
    addItem(selectedItem, quantity, selectedAddons)
    closeModal()
    toast.success('Added to cart.')
    navigate('/cart')
  }

  const handleCategorySelect = (categoryId) => {
    setCategoryFilter(categoryId)
    setCurrentPage(1)
  }

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="container">
      {errors.public && <div className="alert error">{errors.public}</div>}
      {loading.public && <div className="alert">Loading menu...</div>}
      <div className="section-header">
        <div>
          <h2>Browse the Menu</h2>
          <p className="menu-description">
            Hand-picked meals ready for quick checkout.
          </p>
        </div>
      </div>

      <div className="menu-toolbar">
        <div className="form-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            className="input"
            placeholder="Search meals, cuisines, combos..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="category-row">
          <button
            type="button"
            className={`category-chip ${categoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleCategorySelect('all')}
          >
            <span className="category-avatar">All</span>
            <span className="category-label">All</span>
          </button>
          {activeCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`category-chip ${
                categoryFilter === category.id ? 'active' : ''
              }`}
              onClick={() => handleCategorySelect(category.id)}
            >
              <img src={category.image || placeholderImage} alt={category.name} />
              <span className="category-label">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {loading.public && menuItems.length === 0 ? (
        <div className="empty-state card">
          <p>Loading menu items...</p>
        </div>
      ) : filteredMenu.length === 0 ? (
        <div className="empty-state card">
          <h3>{menuItems.length === 0 ? 'Menu coming soon' : 'No items match your search'}</h3>
          <p>
            {menuItems.length === 0
              ? "We're still building our menu. Check back soon for delicious options!"
              : 'Try a different search or category filter.'}
          </p>
        </div>
      ) : (
        <div className="card-grid grid-3">
          {paginatedMenu.map((item) => (
            <div className="card menu-card" key={item.id}>
              <div className="menu-card-image-wrap">
                <img
                  src={item.image || placeholderImage}
                  alt={item.name}
                  loading="lazy"
                />
              </div>
              <div className="menu-card-body">
                <div className="menu-meta">
                  <h3>{item.name}</h3>
                  <span className="menu-price">{formatCurrency(item.price)}</span>
                </div>
                <div className="menu-card-badges">
                  <span className={`menu-card-badge menu-card-badge--category ${getCategoryColor(item.category)}`}>
                    {categoryMap.get(item.category) || 'Category'}
                  </span>
                  <span className={`menu-card-badge menu-card-badge--type ${item.veg !== false ? 'menu-card-badge--veg' : 'menu-card-badge--nonveg'}`}>
                    {item.veg !== false ? 'Veg' : 'Non-veg'}
                  </span>
                  <span className={`menu-card-badge menu-card-badge--available ${item.available ? 'menu-card-badge--yes' : 'menu-card-badge--no'}`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="menu-description">{item.description}</p>
                <div className="menu-rating">
                  <Star size={16} fill="currentColor" />
                  <span>{item.rating?.toFixed(1) || '4.5'}</span>
                  <span className="rating-count">({item.reviews || 0})</span>
                </div>
                <button
                  className="button primary"
                  onClick={() => openModal(item)}
                  type="button"
                  disabled={!item.available || isItemInCart(item.id)}
                >
                  {!item.available
                    ? 'Unavailable'
                    : isItemInCart(item.id)
                      ? 'In cart'
                      : 'Add to cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredMenu.length > pageSize && (
        <div className="pagination">
          <button
            className="button ghost"
            type="button"
            disabled={activePage === 1}
            onClick={() => setCurrentPage(Math.max(1, activePage - 1))}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={`page-${index + 1}`}
              className={`button ghost ${activePage === index + 1 ? 'active' : ''}`}
              type="button"
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            className="button ghost"
            type="button"
            disabled={activePage === totalPages}
            onClick={() => setCurrentPage(Math.min(totalPages, activePage + 1))}
          >
            Next
          </button>
        </div>
      )}

      <Modal
        title={selectedItem ? `Customize ${selectedItem.name}` : 'Customize'}
        isOpen={Boolean(selectedItem)}
        onClose={closeModal}
      >
        {selectedItem && (
          <div className="form-card">
            {(() => {
              const availableAddonsList = addons.filter((a) => a.available !== false)
              const availableAddons = resolveMenuAddons(selectedItem, availableAddonsList)
              return (
                <>
                  <div className="form-group">
                    <label>Quantity</label>
                      <div className="quantity-controls full">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((prev) => Math.max(1, prev - 1))
                        }
                      >
                        -
                      </button>
                      <span>{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => prev + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Add-ons</label>
                    <div className="list">
                      {availableAddons.length === 0 ? (
                        <span className="menu-description">
                          No add-ons available for this item.
                        </span>
                      ) : (
                        availableAddons.map((addon) => (
                          <label key={addon.id} className="pill">
                            <input
                              type="checkbox"
                              checked={selectedAddons.some(
                                (selected) => selected.id === addon.id,
                              )}
                              onChange={() => handleAddonToggle(addon)}
                            />
                            {addon.name} ({formatCurrency(addon.price)})
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    className="button primary"
                    type="button"
                    onClick={handleAddToCart}
                  >
                    Add {quantity} to cart
                  </button>
                </>
              )
            })()}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MenuPage
