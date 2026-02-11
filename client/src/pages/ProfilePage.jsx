import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage } from '../utils/api.js'

const ProfilePage = () => {
  const { user, updateProfile, openAuthModal } = useAuth()
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    if (!user) return
    setForm({
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
    })
  }, [user])

  if (!user) {
    return (
      <div className="container">
        <div className="card empty-state">
          <h2>Please login</h2>
          <p>You need to login to view your profile.</p>
          <button
            className="button primary"
            type="button"
            onClick={() => openAuthModal('login')}
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    try {
      await updateProfile({
        username: form.username,
        email: form.email,
        phone: form.phone,
      })
      toast.success('Profile updated.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update profile.'))
    }
  }

  return (
    <div className="container">
      <div className="section-header">
        <h2>Profile</h2>
      </div>
      <form className="card form-card" onSubmit={handleSave}>
        <div className="form-group">
          <label htmlFor="username">Name</label>
          <input
            id="username"
            name="username"
            className="input"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            className="input"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            className="input"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <div className="summary-row">
          <span>Role</span>
          <strong>{user.role}</strong>
        </div>
        <button className="button primary" type="submit">
          Save changes
        </button>
      </form>

    </div>
  )
}

export default ProfilePage
