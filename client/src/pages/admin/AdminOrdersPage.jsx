import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useData } from '../../context/DataContext.jsx'
import { getErrorMessage } from '../../utils/api.js'
import { formatCurrency, formatDateTime } from '../../utils/format.js'
import Table from '../../components/Table.jsx'

const statusOptions = [
  { value: 'Order Received', label: 'Received' },
  { value: 'Preparing', label: 'Preparing' },
  { value: 'Ready', label: 'Ready' },
  { value: 'Out for Delivery', label: 'Delivery' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' },
]
const AdminOrdersPage = () => {
  const { orders, users, updateOrderStatus, updateOrderPaymentStatus, loading, errors } = useData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [savingId, setSavingId] = useState(null)
  const [savingPaymentId, setSavingPaymentId] = useState(null)

  const userMap = useMemo(() => {
    const map = new Map()
    users.forEach((user) => map.set(user.id, user))
    return map
  }, [users])

  const handleStatusChange = async (orderId, newStatus) => {
    setSavingId(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      toast.success('Order status updated.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update order status.'))
    } finally {
      setSavingId(null)
    }
  }

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    setSavingPaymentId(orderId)
    try {
      await updateOrderPaymentStatus(orderId, newPaymentStatus)
      toast.success('Payment status updated.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update payment status.'))
    } finally {
      setSavingPaymentId(null)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const orderUser = order.userObj || userMap.get(order.user)
    const orderId = order.id?.toString?.() || ''
    const searchValue = search.toLowerCase()
    const matchesSearch =
      orderId.toLowerCase().includes(searchValue) ||
      orderUser?.username?.toLowerCase().includes(searchValue) ||
      orderUser?.email?.toLowerCase().includes(searchValue)
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesPayment =
      paymentFilter === 'all' || order.paymentStatus === paymentFilter
    return matchesSearch && matchesStatus && matchesPayment
  })

  return (
    <div className="list">
      {errors.orders && <div className="alert error">{errors.orders}</div>}
      {loading.orders && <div className="alert">Loading orders...</div>}
      <div className="section-header">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-description">Track and update order status from here.</p>
        </div>
      </div>
      <div className="form-grid mb-5">
        <div className="form-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            className="input"
            placeholder="Search orders..."
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
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="paymentFilter">Payment</label>
          <select
            id="paymentFilter"
            className="select"
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value)}
          >
            <option value="all">All</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>
      <div className="card">
        {!loading.orders && filteredOrders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>
              {orders.length === 0
                ? 'Orders from customers will appear here. Share your menu to start receiving orders!'
                : 'No orders match your search or filters. Try different criteria.'}
            </p>
          </div>
        ) : (
        <Table
          columns={[
            {
              key: 'order',
              label: 'Order',
              render: row => `#${row.id?.toString?.().slice(-6) || '—'}`,
            },
            {
              key: 'user',
              label: 'User',
              render: row => {
                const orderUser = row.userObj || userMap.get(row.user)
                return orderUser?.username || orderUser?.email || 'User'
              },
            },
            { key: 'placed', label: 'Placed', render: row => formatDateTime(row.createdAt) },
            {
              key: 'total',
              label: 'Total',
              headerClassName: 'table-cell--num',
              cellClassName: 'table-cell--num',
              render: row => formatCurrency(row.total),
            },
            {
              key: 'status',
              label: 'Status',
              render: row => (
                <select
                  className="select table-select"
                  value={row.status}
                  onChange={e => handleStatusChange(row.id, e.target.value)}
                  disabled={savingId === row.id}
                  title={row.status}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ),
            },
            {
              key: 'payment',
              label: 'Payment',
              render: row => (
                <select
                  className="select table-select table-select--payment"
                  value={row.paymentStatus || 'Pending'}
                  onChange={e => handlePaymentStatusChange(row.id, e.target.value)}
                  disabled={savingPaymentId === row.id}
                  title={row.paymentStatus || 'Pending'}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              ),
            },
          ]}
          data={filteredOrders}
        />
        )}
      </div>
    </div>
  )
}

export default AdminOrdersPage
