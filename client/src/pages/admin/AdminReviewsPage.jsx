import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/api.js'
import { getMenuItemDisplayName } from '../../utils/format.js'
import { Check, Trash2, X } from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'
import Table from '../../components/Table.jsx'

const AdminReviewsPage = () => {
  const {
    reviews,
    toggleReviewApproval,
    deleteReview,
    users,
    menuItems,
    lastKnownMenuNames,
    loading,
    errors,
  } = useData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const menuMap = useMemo(() => new Map(menuItems.map((item) => [item.id, item])), [menuItems]);
  const userMap = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return
    try {
      await deleteReview(reviewId)
      toast.success('Review deleted.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to delete review.'))
    }
  }
  const handleToggle = async (reviewId) => {
    try {
      await toggleReviewApproval(reviewId)
      toast.success('Review updated.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to update review.'))
    }
  }

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const menuName = getMenuItemDisplayName(menuMap, review.menu, review.menuName, lastKnownMenuNames)
      const userName = userMap.get(review.user)?.username || ''
      const matchesSearch =
        menuName.toLowerCase().includes(search.toLowerCase()) ||
        userName.toLowerCase().includes(search.toLowerCase()) ||
        review.comment?.toLowerCase().includes(search.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'approved' ? review.approved : !review.approved)
      return matchesSearch && matchesStatus
    })
  }, [reviews, search, statusFilter, menuMap, userMap, lastKnownMenuNames])

  return (
    <div className="list">
      {errors.public && <div className="alert error">{errors.public}</div>}
      {loading.public && <div className="alert">Loading reviews...</div>}
      <div className="section-header">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Reviews</h1>
          <p className="admin-page-description">See and moderate customer feedback on menu items.</p>
        </div>
      </div>
      <div className="form-grid mb-5">
        <div className="form-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            className="input"
            placeholder="Search review or user..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="statusFilter">Status</label>
          <select
            id="statusFilter"
            className="select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>
      <div className="card">
        {!loading.public && filteredReviews.length === 0 ? (
          <div className="empty-state">
            <h3>No reviews yet</h3>
            <p>
              {reviews.length === 0
                ? 'Customer reviews for menu items will appear here once customers start ordering and leaving feedback.'
                : 'No reviews match your search or filter. Try different criteria.'}
            </p>
          </div>
        ) : (
          <Table
            columns={[
              { key: 'menu', label: 'Menu item', render: row => getMenuItemDisplayName(menuMap, row.menu, row.menuName, lastKnownMenuNames) },
              { key: 'user', label: 'User', render: row => userMap.get(row.user)?.username || 'User' },
              { key: 'rating', label: 'Rating', render: row => `${row.rating} / 5` },
              { key: 'comment', label: 'Comment', render: row => row.comment || '\u2014' },
              { key: 'status', label: 'Status', render: row => (
                <span className={`status-pill ${row.approved ? 'success' : 'warning'}`}>{row.approved ? 'Approved' : 'Hidden'}</span>
              ) },
              { key: 'actions', label: 'Action', render: row => (
                <>
                  <button
                    className={`button ghost ${row.approved ? '' : 'active'}`}
                    type="button"
                    onClick={() => handleToggle(row.id)}
                    aria-label={row.approved ? 'Hide review' : 'Approve review'}
                  >
                    {row.approved ? <X size={16} /> : <Check size={16} />}
                  </button>
                  <button
                    className="button danger"
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    aria-label="Delete review"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              ) },
            ]}
            data={filteredReviews}
          />
        )}
      </div>
    </div>
  );
}

export default AdminReviewsPage
