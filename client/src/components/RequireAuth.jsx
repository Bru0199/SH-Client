import { useAuth } from '../context/AuthContext.jsx'

const RequireAuth = ({ children }) => {
  const { user, openAuthModal, isLoading, token } = useAuth()

  if (!user && isLoading && token) {
    return (
      <div className="container">
        <div className="card empty-state">
          <h2>Loading your account</h2>
          <p>Please wait while we verify your session.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container">
        <div className="card empty-state">
          <h2>Please login to continue</h2>
          <p>Create an account or login to view this page.</p>
          <button
            className="button primary"
            type="button"
            onClick={() => openAuthModal('login')}
          >
            Open login
          </button>
        </div>
      </div>
    )
  }

  return children
}

export default RequireAuth
