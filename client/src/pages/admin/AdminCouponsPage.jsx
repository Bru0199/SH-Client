import { useState } from 'react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/api.js'
import { PencilLine, Trash2 } from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'
import Modal from '../../components/Modal.jsx'
import Table from '../../components/Table.jsx'

const emptyForm = {
  code: '',
  discount: '',
  minOrderAmount: '',
  expiresAt: '',
}

const formatDateInput = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return date.toISOString().split('T')[0]
}

const AdminCouponsPage = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon, loading, errors } =
    useData()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (coupon) => {
    setForm({
      code: coupon.code || '',
      discount: coupon.discount || '',
      minOrderAmount: coupon.minOrderAmount || '',
      expiresAt: formatDateInput(coupon.expiresAt),
    })
    setEditingId(coupon.id)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const payload = {
        ...form,
        minOrderAmount: Number(form.minOrderAmount || 0),
        discount: Number(form.discount || 0),
        expiresAt: form.expiresAt || undefined,
      }
      if (editingId) {
        await updateCoupon(editingId, payload)
        toast.success('Coupon updated.')
      } else {
        await addCoupon(payload)
        toast.success('Coupon created.')
      }
      closeModal()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save coupon.'))
    }
  }

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete ${coupon.code}?`)) return
    try {
      await deleteCoupon(coupon.id)
      toast.success('Coupon deleted.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete coupon.'))
    }
  }

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'discount', label: 'Discount', render: row => `${row.discount}%` },
    { key: 'minOrderAmount', label: 'Min order' },
    { key: 'expiresAt', label: 'Expires', render: row => row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : '—' },
    { key: 'status', label: 'Status', render: row => {
        const isExpired = row.expiresAt ? new Date(row.expiresAt) < new Date() : false;
        return <span className={`status-pill ${isExpired ? 'danger' : 'success'}`}>{isExpired ? 'Expired' : 'Active'}</span>;
      }
    },
    { key: 'actions', label: 'Actions', render: row => (
      <>
        <button
          className="button ghost"
          type="button"
          onClick={() => openEdit(row)}
          aria-label="Edit coupon"
        >
          <PencilLine size={16} />
        </button>
        <button
          className="button danger"
          type="button"
          onClick={() => handleDelete(row)}
          aria-label="Delete coupon"
        >
          <Trash2 size={16} />
        </button>
      </>
    ) },
  ]
  const filteredCoupons = coupons.filter((coupon) => {
    const code = coupon.code || ''
    const matchesSearch = code.toLowerCase().includes(search.toLowerCase())
    const status = coupon.expiresAt
      ? new Date(coupon.expiresAt) < new Date()
        ? 'expired'
        : 'active'
      : 'active'
    return matchesSearch && (statusFilter === 'all' || status === statusFilter)
  })

  return (
    <div className="list">
      {errors.public && <div className="alert error">{errors.public}</div>}
      {loading.public && <div className="alert">Loading coupons...</div>}
      <div className="section-header">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Coupons</h1>
          <p className="admin-page-description">Create discount codes for your customers.</p>
        </div>
        <button className="button primary btn-add" type="button" onClick={openCreate}>
          Add coupon
        </button>
      </div>
      <div className="form-grid mb-5">
        <div className="form-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            className="input"
            placeholder="Search coupons..."
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
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>
      <div className="card">
        {!loading.public && filteredCoupons.length === 0 ? (
          <div className="empty-state">
            <h3>No coupons yet</h3>
            <p>
              {coupons.length === 0
                ? 'Create a coupon to offer discounts to your customers (e.g. WELCOME10 for 10% off).'
                : 'No coupons match your search or filter. Try different criteria.'}
            </p>
          </div>
        ) : (
          <Table columns={columns} data={filteredCoupons} />
        )}
      </div>
      <Modal
        title={editingId ? 'Edit coupon' : 'Create coupon'}
        isOpen={showModal}
        onClose={closeModal}
      >
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Code</label>
            <input
              id="code"
              className="input"
              value={form.code}
              onChange={(event) => setForm({ ...form, code: event.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="discount">Discount</label>
            <input
              id="discount"
              className="input"
              type="number"
              value={form.discount}
              onChange={(event) =>
                setForm({ ...form, discount: event.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="minOrderAmount">Min order amount</label>
            <input
              id="minOrderAmount"
              className="input"
              type="number"
              value={form.minOrderAmount}
              onChange={(event) =>
                setForm({ ...form, minOrderAmount: event.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="expiresAt">Expiry date</label>
            <input
              id="expiresAt"
              className="input"
              type="date"
              value={form.expiresAt}
              onChange={(event) =>
                setForm({ ...form, expiresAt: event.target.value })
              }
            />
          </div>
          <button className="button primary" type="submit">
            {editingId ? 'Save changes' : 'Create coupon'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default AdminCouponsPage
