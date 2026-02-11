import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/api.js'
import { PencilLine, Trash2 } from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'
import ImagePicker from '../../components/ImagePicker.jsx'
import Modal from '../../components/Modal.jsx'
import Table from '../../components/Table.jsx'
import placeholderImage from '../../assets/placeholder-food.svg'

const emptyForm = {
  name: '',
  description: '',
  image: '',
  imageFile: null,
  status: 'active',
}

const AdminCategoriesPage = () => {
  const { categories, addCategory, updateCategory, deleteCategory, loading, errors } =
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

  const openEdit = (category) => {
    setForm({
      name: category.name || '',
      description: category.description || '',
      image: category.image || '',
      imageFile: null,
      status: category.status || 'active',
    })
    setEditingId(category.id)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      if (editingId) {
        await updateCategory(editingId, form)
      } else {
        await addCategory(form)
      }
      closeModal()
      toast.success(editingId ? 'Category updated.' : 'Category created.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to save category.'))
    }
  }

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete ${category.name}?`)) return
    try {
      await deleteCategory(category.id)
      toast.success('Category deleted.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to delete category.'))
    }
  }

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const name = category.name || ''
      const matchesSearch = name
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' || category.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [categories, search, statusFilter])

  return (
    <div className="flex flex-col gap-3 sm:gap-4 min-w-0 w-full">
      {errors.public && <div className="alert error shrink-0">{errors.public}</div>}
      {loading.public && <div className="alert shrink-0">Loading categories...</div>}
      <header className="section-header shrink-0">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Categories</h1>
          <p className="admin-page-description">Organize your menu into sections like Appetizers, Mains & Desserts.</p>
        </div>
        <button className="button primary btn-add" onClick={openCreate} type="button">
          Add category
        </button>
      </header>
      <div className="form-grid shrink-0">
        <div className="form-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            className="input min-w-0"
            placeholder="Search categories..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="statusFilter">Status</label>
          <select
            id="statusFilter"
            className="select min-w-0"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="card min-w-0 flex-1">
        {!loading.public && filteredCategories.length === 0 ? (
          <div className="empty-state">
            <h3>No categories yet</h3>
            <p>
              {categories.length === 0
                ? 'Add your first category to organize your menu (e.g. Appetizers, Mains, Desserts).'
                : 'No categories match your search or filter. Try different criteria.'}
            </p>
          </div>
        ) : (
        <Table
          columns={[
            {
              key: 'image',
              label: 'Image',
              render: (row) => (
                <img
                  src={row.image || placeholderImage}
                  alt={row.name || ''}
                  className="table-thumb"
                />
              ),
            },
            { key: 'name', label: 'Name', render: (row) => row.name || '—' },
            {
              key: 'status',
              label: 'Status',
              render: (row) => (
                <span className={`status-pill ${row.status === 'active' ? 'success' : 'warning'}`}>{row.status || '—'}</span>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <>
                  <button
                    className="button ghost"
                    type="button"
                    onClick={() => openEdit(row)}
                    aria-label="Edit category"
                  >
                    <PencilLine size={16} />
                  </button>
                  <button
                    className="button danger"
                    type="button"
                    onClick={() => handleDelete(row)}
                    aria-label="Delete category"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              ),
            },
          ]}
          data={filteredCategories}
        />
        )}
      </div>

      <Modal
        title={editingId ? 'Edit category' : 'Create category'}
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
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className="textarea"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </div>
          <ImagePicker
            label="Image URL or upload"
            value={form.image}
            file={form.imageFile}
            onChange={({ url, file }) =>
              setForm((prev) => ({
                ...prev,
                image: url,
                imageFile: file,
              }))
            }
          />
          {editingId && (
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                className="select"
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
          <button className="button primary" type="submit">
            {editingId ? 'Save changes' : 'Create category'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default AdminCategoriesPage
