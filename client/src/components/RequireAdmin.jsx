import { useAuth } from '../context/AuthContext.jsx'

const RequireAdmin = ({ children }) => {
  const { user, openAuthModal, isLoading, token } = useAuth()

  if (!user && isLoading && token) {
    return (
      <div className="container pt-10">
        <div className="card empty-state">
          <h2>Loading your account</h2>
          <p>Please wait while we verify your admin access.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container pt-10">
        <div className="card empty-state">
          <h2>Admin access only</h2>
          <p>Please login with an admin account to continue.</p>
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

  if (user.role !== 'admin') {
    return (
      <div className="container pt-10">
        <div className="card empty-state">
          <h2>Admin access only</h2>
          <p>Please sign in with an admin account to access this page.</p>
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

  return children
}

export default RequireAdmin
