import { Phone, Home, Info, UtensilsCrossed } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const MobileBottomNav = () => {
  return (
    <nav className="mobile-bottom-nav mobile-only" aria-label="Mobile navigation">
      <NavLink
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        aria-label="Home"
        title="Home"
        to="/"
      >
        <Home size={20} />
        <span className="sr-only">Home</span>
      </NavLink>
      <a className="mobile-nav-item" href="/#about" aria-label="About us" title="About us">
        <Info size={20} />
        <span className="sr-only">About Us</span>
      </a>
      <NavLink
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        aria-label="Menu"
        title="Menu"
        to="/menu"
      >
        <UtensilsCrossed size={20} />
        <span className="sr-only">Menu</span>
      </NavLink>
      <a className="mobile-nav-item" href="/#contact" aria-label="Contact us" title="Contact us">
        <Phone size={20} />
        <span className="sr-only">Contact Us</span>
      </a>
    </nav>
  )
}

export default MobileBottomNav
