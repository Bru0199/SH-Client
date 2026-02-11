import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/api.js'
import { PencilLine, Trash2 } from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'
import Modal from '../../components/Modal.jsx'
import { formatCurrency } from '../../utils/format.js'
import Table from '../../components/Table.jsx'

const emptyForm = {
  name: '',
  price: '',
  available: true,
}

const AdminAddonsPage = () => {
  const { addons, addAddon, updateAddon, deleteAddon, loading, errors } = useData()
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

  const openEdit = (addon) => {
    setForm({
      name: addon.name || '',
      price: addon.price || '',
      available: addon.available !== false,
    })
    setEditingId(addon.id)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      if (editingId) {
        await updateAddon(editingId, { ...form, price: Number(form.price || 0) })
      } else {
        await addAddon({ ...form, price: Number(form.price || 0) })
      }
      closeModal()
      toast.success(editingId ? 'Addon updated.' : 'Addon created.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to save addon.'))
    }
  }

  const handleDelete = async (addon) => {
    if (!window.confirm(`Delete ${addon.name}?`)) return
    try {
      deleteAddon(addon.id)
      toast.success('Addon deleted.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to delete addon.'))
    }
  }

  const filteredAddons = useMemo(() => {
    return addons.filter((addon) => {
      const name = addon.name || ''
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'available' ? addon.available : !addon.available)
      return matchesSearch && matchesStatus
    })
  }, [addons, search, statusFilter])

  return (
    <div className="list">
      {errors.public && <div className="alert error">{errors.public}</div>}
      {loading.public && <div className="alert">Loading add-ons...</div>}
      <div className="section-header">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Add-ons</h1>
          <p className="admin-page-description">Extras like sides, toppings, or upgrades for menu items.</p>
        </div>
        <button className="button primary btn-add" onClick={openCreate} type="button">
          Add addon
        </button>
      </div>
      <div className="form-grid mb-5">
        <div className="form-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            className="input"
            placeholder="Search add-ons..."
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
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>
      <div className="card">
        {!loading.public && filteredAddons.length === 0 ? (
          <div className="empty-state">
            <h3>No add-ons yet</h3>
            <p>
              {addons.length === 0
                ? 'Add extras like sides, toppings, or upgrades that customers can add to menu items.'
                : 'No add-ons match your search or filter. Try different criteria.'}
            </p>
          </div>
        ) : (
        <Table
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'price', label: 'Price', render: row => formatCurrency(row.price) },
            { key: 'status', label: 'Status', render: row => (
              <span className={`status-pill ${row.available ? 'success' : 'danger'}`}>{row.available ? 'Available' : 'Unavailable'}</span>
            ) },
            { key: 'actions', label: 'Actions', render: row => (
              <>
                <button
                  className="button ghost"
                  type="button"
                  onClick={() => openEdit(row)}
                  aria-label="Edit addon"
                >
                  <PencilLine size={16} />
                </button>
                <button
                  className="button danger"
                  type="button"
                  onClick={() => handleDelete(row)}
                  aria-label="Delete addon"
                >
                  <Trash2 size={16} />
                </button>
              </>
            ) },
          ]}
          data={filteredAddons}
        />
        )}
      </div>

      <Modal
        title={editingId ? 'Edit addon' : 'Create addon'}
        isOpen={showModal}
        onClose={closeModal}
      >
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              className="input"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input
              id="price"
              className="input"
              type="number"
              value={form.price}
              onChange={(event) => setForm({ ...form, price: event.target.value })}
              required
            />
          </div>
          {editingId && (
            <label className="pill">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(event) =>
                  setForm({ ...form, available: event.target.checked })
                }
              />
              Available
            </label>
          )}
          <button className="button primary" type="submit">
            {editingId ? 'Save changes' : 'Create addon'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default AdminAddonsPage
