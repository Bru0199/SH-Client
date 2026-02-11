import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import MenuPage from './MenuPage.jsx'

const mockAddItem = vi.fn()
const mockOpenAuthModal = vi.fn()
const defaultData = {
  menuItems: [
    {
      id: 'menu-1',
      name: 'Paneer Pizza',
      description: 'Cheesy and spicy',
      price: 349,
      category: 'cat-1',
      available: true,
      image: '',
    },
  ],
  categories: [{ id: 'cat-1', name: 'Pizza', image: '' }],
  addons: [],
  loading: { public: false },
  errors: { public: '' },
}

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { id: 'user-1' }, openAuthModal: mockOpenAuthModal }),
}))

vi.mock('../context/CartContext.jsx', () => ({
  useCart: () => ({ addItem: mockAddItem }),
}))

let mockData = { ...defaultData }

vi.mock('../context/DataContext.jsx', () => ({
  useData: () => mockData,
}))

describe('MenuPage', () => {
  beforeEach(() => {
    mockData = { ...defaultData }
  })

  it('renders menu items from data context', () => {
    render(
      <MemoryRouter>
        <MenuPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Paneer Pizza')).toBeInTheDocument()
    expect(screen.getByText('Cheesy and spicy')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeEnabled()
  })

  it('shows empty state when no menu items', () => {
    mockData = {
      menuItems: [],
      categories: [],
      addons: [],
      loading: { public: false },
      errors: { public: '' },
    }
    render(
      <MemoryRouter>
        <MenuPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/no menu items found/i)).toBeInTheDocument()
  })
})
