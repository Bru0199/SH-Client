import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const UserMenu = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  if (!user) return null

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="user-trigger" type="button" onClick={() => setOpen((prev) => !prev)}>
        <span className="avatar">{getInitials(user.username)}</span>
        <span className="user-name desktop-only">{user.username}</span>
        <ChevronDown size={16} className="desktop-only" />
      </button>
      {open && (
        <div className="user-dropdown">
          <Link className="dropdown-item" to="/profile" onClick={() => setOpen(false)}>
            <User size={16} />
            Profile
          </Link>
          <button
            className="dropdown-item"
            type="button"
            onClick={async () => {
              await logout()
              setOpen(false)
              navigate('/')
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
