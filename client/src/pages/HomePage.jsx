import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { Star } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { formatCurrency } from '../utils/format.js'
import placeholderImage from '../assets/placeholder-food.svg'

const HomePage = () => {
  const { menuItems, stats, categories, loading, errors } = useData()
  const activeCategories = useMemo(
    () => categories.filter((c) => c.status === 'active'),
    [categories],
  )
  const activeCategoryIds = useMemo(
    () => new Set(activeCategories.map((c) => c.id)),
    [activeCategories],
  )
  const featured = useMemo(
    () =>
      menuItems
        .filter(
          (item) =>
            item.available !== false &&
            (!item.category || activeCategoryIds.has(item.category)),
        )
        .slice(0, 3),
    [menuItems, activeCategoryIds],
  )
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

  return (
    <div className="container">
      {errors.public && <div className="alert error">{errors.public}</div>}
      {loading.public && <div className="alert">Loading highlights...</div>}
      <section className="hero">
        <div>
          <h1>Order management built for hungry moments.</h1>
          <p>
            StillHungry keeps menu discovery, checkout, and order tracking in one
            place. Switch between user and admin views instantly.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/menu">
              Browse Menu
            </Link>
            <Link className="button ghost" to="/orders">
              Track Order
            </Link>
          </div>
        </div>
        <div className="card">
          <h3>Today&apos;s Ops Snapshot</h3>
          <div className="list">
            <div className="summary-row">
              <span>Live orders</span>
              <strong>{stats.orders}</strong>
            </div>
            <div className="summary-row">
              <span>Avg prep time</span>
              <strong>18 mins</strong>
            </div>
            <div className="summary-row">
              <span>Customer rating</span>
              <strong>4.8 / 5</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="section-header">
          <h2 className="text-2xl font-bold md:text-3xl">Best sellers</h2>
          <Link className="button ghost" to="/menu">
            View full menu
          </Link>
        </div>
        <div className="card-grid best-seller-grid">
          {featured.map((item) => (
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
                <Link className="button primary" to="/menu">
                  Order now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="mt-10">
        <div className="section-header">
          <h2>Why teams love StillHungry</h2>
        </div>
        <div className="card-grid grid-3">
          {[
            {
              title: 'Fast checkout',
              body: 'Add items, choose add-ons, and place orders in minutes.',
            },
            {
              title: 'Live order status',
              body: 'Track every stage from preparation to delivery.',
            },
            {
              title: 'Admin control',
              body: 'Create menus, coupons, and monitor every order.',
            },
          ].map((item) => (
            <div className="card" key={item.title}>
              <h3>{item.title}</h3>
              <p className="menu-description">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="mt-10">
        <div className="section-header">
          <h2>Contact Us</h2>
        </div>
        <div className="card">
          <div className="responsive-stack">
            <div>
              <h3>We are here to help</h3>
              <p className="menu-description">
                Reach out for onboarding, menu setup, or support.
              </p>
              <div className="list">
                <span>hello@stillhungry.app</span>
                <span>+91 99900 12345</span>
              </div>
            </div>
            <div className="form-card">
              <div className="form-group">
                <label htmlFor="contactName">Name</label>
                <input id="contactName" className="input" placeholder="Your name" />
              </div>
              <div className="form-group">
                <label htmlFor="contactEmail">Email</label>
                <input id="contactEmail" className="input" placeholder="Email" />
              </div>
              <div className="form-group">
                <label htmlFor="contactMessage">Message</label>
                <textarea
                  id="contactMessage"
                  className="textarea"
                  placeholder="How can we help?"
                />
              </div>
              <button className="button primary" type="button">
                Send message
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
