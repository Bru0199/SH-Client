import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../utils/api.js'
import { PencilLine, Trash2 } from 'lucide-react'
import { useData } from '../../context/DataContext.jsx'
import ImagePicker from '../../components/ImagePicker.jsx'
import MultiSelect from '../../components/MultiSelect.jsx'
import SearchableSelect from '../../components/SearchableSelect.jsx'
import { formatCurrency } from '../../utils/format.js'
import Modal from '../../components/Modal.jsx'
import Table from '../../components/Table.jsx'
import placeholderImage from '../../assets/placeholder-food.svg'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  image: '',
  imageFile: null,
  category: '',
  addons: [],
  available: true,
  veg: true,
}

const AdminMenuPage = () => {
  const {
    menuItems,
    categories,
    addons,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    loading,
    errors,
  } = useData()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [vegFilter, setVegFilter] = useState('all')

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (item) => {
    const imageUrl = item.image || ''
    setForm({
      name: item.name || '',
      description: item.description || '',
      price: item.price ?? '',
      image: imageUrl,
      imageFile: null,
      category: item.category || '',
      addons: (item.addons || []).map((addon) => addon.id || addon._id || addon),
      available: item.available !== false,
      veg: item.veg !== false,
    })
    setEditingId(item.id)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }))

  const addonOptions = addons.map((addon) => ({
    value: addon.id,
    label: `${addon.name} (${formatCurrency(addon.price)})`,
  }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const payload = {
        name: form.name?.trim() ?? '',
        description: form.description?.trim() ?? '',
        price: Number(form.price || 0),
        image: form.image || '',
        category: form.category || '',
        addons: Array.isArray(form.addons) ? form.addons : [],
        available: form.available !== false,
        veg: form.veg !== false,
        type: form.veg !== false ? 'veg' : 'non-veg',
      }
      if (form.imageFile) {
        payload.imageFile = form.imageFile
      }
      if (editingId) {
        await updateMenuItem(editingId, payload)
      } else {
        await addMenuItem(payload)
      }
      closeModal()
      toast.success(editingId ? 'Menu item updated.' : 'Menu item created.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to save menu item.'))
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete ${item.name}?`)) return
    try {
      await deleteMenuItem(item.id)
      toast.success('Menu item deleted.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to delete item.'))
    }
  }

  const categoryLabel = useMemo(() => {
    const map = new Map(categories.map((category) => [category.id, category.name]))
    return (categoryId) => map.get(categoryId) || 'Unassigned'
  }, [categories])

  const filteredMenu = useMemo(() => {
    return menuItems.filter((item) => {
      const name = item.name || ''
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        categoryFilter === 'all' || item.category === categoryFilter
      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' ? item.available : !item.available)
      const matchesVeg =
        vegFilter === 'all' ||
        (vegFilter === 'veg' ? item.veg !== false : item.veg === false)
      return matchesSearch && matchesCategory && matchesAvailability && matchesVeg
    })
  }, [menuItems, search, categoryFilter, availabilityFilter, vegFilter])

  return (
    <div className="list">
      {errors.public && <div className="alert error">{errors.public}</div>}
      {loading.public && <div className="alert">Loading menu...</div>}
      <div className="section-header">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Menu items</h1>
          <p className="admin-page-description">Manage dishes, prices, and availability.</p>
        </div>
        <button className="button primary btn-add" onClick={openCreate} type="button">
          Add menu item
        </button>
      </div>

      <div className="form-grid mb-5">
        <div className="form-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            className="input"
            placeholder="Search menu items..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="categoryFilter">Category</label>
          <select
            id="categoryFilter"
            className="select"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="availabilityFilter">Availability</label>
          <select
            id="availabilityFilter"
            className="select"
            value={availabilityFilter}
            onChange={(event) => setAvailabilityFilter(event.target.value)}
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="vegFilter">Type</label>
          <select
            id="vegFilter"
            className="select"
            value={vegFilter}
            onChange={(event) => setVegFilter(event.target.value)}
          >
            <option value="all">All</option>
            <option value="veg">Veg</option>
            <option value="non-veg">Non-veg</option>
          </select>
        </div>
      </div>

      {!loading.public && filteredMenu.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <h3>No menu items yet</h3>
            <p>
              {menuItems.length === 0
                ? 'Add your first dish to get started. You can add categories and add-ons from their sections.'
                : 'No menu items match your search or filters. Try different criteria.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <Table
            columns={[
              {
                key: 'image',
                label: 'Image',
                headerClassName: 'table-cell-center',
                cellClassName: 'table-cell-center',
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
                key: 'price',
                label: 'Price',
                headerClassName: 'table-cell-right',
                cellClassName: 'table-cell-right',
                render: (row) => formatCurrency(row.price),
              },
              {
                key: 'category',
                label: 'Category',
                render: (row) => categoryLabel(row.category),
              },
              {
                key: 'veg',
                label: 'Type',
                headerClassName: 'table-header-nowrap table-cell-center',
                cellClassName: 'table-cell-center',
                render: (row) => (
                  <span className={`status-pill ${row.veg !== false ? 'success' : 'danger'}`}>
                    {row.veg !== false ? 'Veg' : 'Non-veg'}
                  </span>
                ),
              },
              {
                key: 'availability',
                label: 'Availability',
                headerClassName: 'table-cell-center',
                cellClassName: 'table-cell-center',
                render: (row) => (
                  <span className={`status-pill ${row.available ? 'success' : 'danger'}`}>
                    {row.available ? 'Available' : 'Unavailable'}
                  </span>
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
                      aria-label="Edit menu item"
                    >
                      <PencilLine size={16} />
                    </button>
                    <button
                      className="button danger"
                      type="button"
                      onClick={() => handleDelete(row)}
                      aria-label="Delete menu item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ),
              },
            ]}
            data={filteredMenu}
          />
        </div>
      )}

      <Modal
        title={editingId ? 'Edit menu item' : 'Create menu item'}
        isOpen={showModal}
        onClose={closeModal}
      >
        <form className="form-card form-card-menu" onSubmit={handleSubmit}>
          <div className="form-group form-group-full">
            <label htmlFor="menu-name">Name</label>
            <input
              id="menu-name"
              className="input"
              placeholder="e.g. Pasta Alfredo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="menu-price">Price</label>
            <input
              id="menu-price"
              className="input"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <SearchableSelect
              label="Category"
              options={categoryOptions}
              value={form.category}
              onChange={(value) => setForm({ ...form, category: value })}
              placeholder="Select category"
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <div className="flex gap-3 mt-1">
              <label className="pill">
                <input
                  type="radio"
                  name="menu-veg"
                  checked={form.veg === true}
                  onChange={() => setForm({ ...form, veg: true })}
                />
                Veg
              </label>
              <label className="pill">
                <input
                  type="radio"
                  name="menu-veg"
                  checked={form.veg === false}
                  onChange={() => setForm({ ...form, veg: false })}
                />
                Non-veg
              </label>
            </div>
          </div>
          <div className="form-group">
            <MultiSelect
              label="Add-ons"
              options={addonOptions}
              values={form.addons}
              onChange={(values) => setForm({ ...form, addons: values })}
              placeholder="Select add-ons"
            />
          </div>
          <div className="form-group form-group-image">
            <ImagePicker
              key={`menu-img-${editingId ?? 'new'}`}
              label="Image"
              value={form.image}
              file={form.imageFile}
              onChange={({ url, file }) =>
                setForm((prev) => ({ ...prev, image: url, imageFile: file }))
              }
            />
          </div>
          <div className="form-group form-group-description">
            <label htmlFor="menu-description">Description</label>
            <textarea
              id="menu-description"
              className="textarea"
              rows={3}
              placeholder="Short description (optional)"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="form-card-menu-actions">
            <div className="flex items-center gap-4">
              {editingId && (
                <label className="pill">
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) =>
                      setForm({ ...form, available: e.target.checked })
                    }
                  />
                  Available
                </label>
              )}
            </div>
            <button className="button primary" type="submit">
              {editingId ? 'Save changes' : 'Create menu item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminMenuPage
