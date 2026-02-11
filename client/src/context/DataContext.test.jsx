import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { DataProvider, useData } from './DataContext.jsx'

vi.mock('./AuthContext.jsx', () => ({
  useAuth: () => ({ user: { id: 'user-1', role: 'user' }, token: 'token' }),
}))

const apiGet = vi.fn().mockResolvedValue([])
const apiPost = vi.fn()
const apiPut = vi.fn()
const apiPatch = vi.fn()
const apiDelete = vi.fn()

vi.mock('../utils/api.js', () => ({
  API_BASE_URL: '',
  apiGet: (...args) => apiGet(...args),
  apiPost: (...args) => apiPost(...args),
  apiPut: (...args) => apiPut(...args),
  apiPatch: (...args) => apiPatch(...args),
  apiDelete: (...args) => apiDelete(...args),
  getErrorMessage: (error, fallback) => error?.message || fallback,
  resolveImageUrl: (value) => value,
}))

vi.mock('socket.io-client', () => ({
  io: () => ({
    on: vi.fn(),
    disconnect: vi.fn(),
  }),
}))

const wrapper = ({ children }) => <DataProvider>{children}</DataProvider>

describe('DataContext', () => {
  beforeEach(() => {
    apiGet.mockResolvedValue([])
    apiPost.mockReset()
    apiPut.mockReset()
    apiPatch.mockReset()
    apiDelete.mockReset()
  })

  it('validates coupon input before calling API', async () => {
    const { result } = renderHook(() => useData(), { wrapper })

    await waitFor(() => {
      expect(result.current).toBeTruthy()
    })

    await expect(result.current.validateCoupon('', 100)).rejects.toThrow(
      'Please enter a coupon code.',
    )
  })

  it('adds an order and updates state', async () => {
    apiPost.mockResolvedValueOnce({
      order: {
        id: 'order-1',
        status: 'Order Received',
        total: 450,
        items: [],
      },
    })

    const { result } = renderHook(() => useData(), { wrapper })

    await act(async () => {
      await result.current.addOrder({ items: [], total: 450 })
    })

    expect(result.current.orders[0]?.id).toBe('order-1')
  })

  it('updates order status with API response', async () => {
    apiPost.mockResolvedValueOnce({
      order: {
        id: 'order-2',
        status: 'Preparing',
        total: 300,
        items: [],
      },
    })
    apiPut.mockResolvedValueOnce({
      order: {
        id: 'order-2',
        status: 'Delivered',
        total: 300,
        items: [],
      },
    })

    const { result } = renderHook(() => useData(), { wrapper })

    await act(async () => {
      await result.current.addOrder({ items: [], total: 300 })
    })

    await act(async () => {
      await result.current.updateOrderStatus('order-2', 'Delivered')
    })

    expect(result.current.orders[0]?.status).toBe('Delivered')
  })
})
