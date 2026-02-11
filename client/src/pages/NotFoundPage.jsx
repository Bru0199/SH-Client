import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="container">
      <div className="card empty-state">
        <h2>Page not found</h2>
        <p>The page you are looking for does not exist.</p>
        <Link className="button primary" to="/">
          Back to home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
