import { ClipboardList, ShoppingCart, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import UserMenu from './UserMenu.jsx'
import Logo from './Logo.jsx'

const Header = () => {
  const { user, openAuthModal } = useAuth()
  const { items } = useCart()
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const isUser = user?.role === 'user'

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] border-b shadow-sm min-h-[var(--navbar-height)] flex flex-col justify-center"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="w-full max-w-[min(1200px,100%-32px)] mx-auto min-w-0 flex items-center justify-between gap-6 py-3">
        <NavLink className="brand" to="/">
          <Logo />
        </NavLink>
        <nav className="nav-links desktop-only">
          <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/">
            Home
          </NavLink>
          <a className="nav-link" href="/#about">
            About Us
          </a>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/menu">
            Menu
          </NavLink>
          <a className="nav-link" href="/#contact">
            Contact Us
          </a>
        </nav>
        <div className="nav-actions">
          {isUser && (
            <>
              <NavLink
                className={({ isActive }) => `icon-link icon-link--cart cart-btn ${isActive ? 'active' : ''}`}
                to="/cart"
                title={cartCount > 0 ? `Cart (${cartCount} items)` : 'Cart'}
              >
                {cartCount > 0 && (
                  <span
                    className={`cart-count-badge ${cartCount >= 10 ? 'cart-count-badge--double' : ''}`}
                    aria-label={`${cartCount} items in cart`}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
                <ShoppingCart size={22} strokeWidth={2} className="cart-btn-icon" />
              </NavLink>
              <NavLink
                className={({ isActive }) => `icon-link ${isActive ? 'active' : ''}`}
                to="/orders"
                title="Orders"
              >
                <ClipboardList size={18} />
              </NavLink>
            </>
          )}
          {user?.role === 'admin' && (
            <NavLink
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              to="/admin"
            >
              Admin
            </NavLink>
          )}
          <ThemeToggle />
          {user ? (
            <UserMenu />
          ) : (
            <button
              className="button primary"
              type="button"
              onClick={() => openAuthModal('login')}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
