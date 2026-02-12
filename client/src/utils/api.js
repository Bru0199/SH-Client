import { readToken } from './storage.js'


const DEV_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const API_URL_1 = (import.meta.env.VITE_API_URL_1 || '').replace(/\/$/, '')
const API_URL_2 = (import.meta.env.VITE_API_URL_2 || '').replace(/\/$/, '')

/**
 * joinUrl(path, opts)
 * In development, uses VITE_API_BASE_URL. In production, uses VITE_API_URL_1 or VITE_API_URL_2.
 * @param {string} path - API path
 * @param {object} opts - { useSecond: boolean } to use API_URL_2 in prod
 */
export const joinUrl = (path = '', opts = {}) => {
  const isDev = import.meta.env.DEV
  const base = isDev ? DEV_BASE_URL : (opts.useSecond ? API_URL_2 : API_URL_1)
  if (!base) return path
  if (!path) return base
  if (path.startsWith('http')) return path
  if (path.startsWith('/')) return `${base}${path}`
  return `${base}/${path}`
}

export const resolveImageUrl = (value) => {
  if (!value) return ''
  const trimmed = value.toString()
  if (
    trimmed.startsWith('http') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed
  }
  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return joinUrl(normalized)
}

const toErrorMessage = (data, fallback) => {
  if (!data) return fallback
  if (typeof data === 'string') return data
  if (data.message) return data.message
  if (data.error) return data.error
  if (Array.isArray(data.errors) && data.errors[0]?.message) {
    return data.errors[0].message
  }
  return fallback
}

const createApiError = (response, data) => {
  const fallback = response.statusText || 'Request failed'
  const error = new Error(toErrorMessage(data, fallback))
  error.status = response.status
  error.code = data?.code
  error.data = data
  return error
}

const ROUTE_NOT_FOUND_PATTERNS = /route not found|endpoint not found|404 not found/i

export const isRouteNotFound = (error) => {
  if (!error) return false
  const msg = typeof error === 'string' ? error : error?.message
  return error?.status === 404 || (!!msg && ROUTE_NOT_FOUND_PATTERNS.test(msg))
}

export const isAlreadyReviewedError = (error) => {
  if (!error) return false
  if (error?.status !== 400) return false
  const msg = typeof error === 'string' ? error : error?.message
  return !!msg && /already reviewed this order/i.test(msg)
}

export const getErrorMessage = (error, fallback = 'Something went wrong.') => {
  if (!error) return fallback
  const msg = typeof error === 'string' ? error : error?.message
  if (!msg) return fallback
  if (error?.status === 404 || ROUTE_NOT_FOUND_PATTERNS.test(msg)) {
    return 'This action isn’t available. Make sure the backend server is running and implements this API route.'
  }
  return msg
}

export const apiRequest = async (
  path,
  { method = 'GET', body, headers = {}, auth = true, isFormData = false, signal } = {},
) => {
  const requestHeaders = new Headers(headers)
  const token = auth ? readToken() : null
  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  let requestBody = body
  if (body && !isFormData && !(body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json')
    requestBody = JSON.stringify(body)
  }

  const response = await fetch(joinUrl(path), {
    method,
    headers: requestHeaders,
    body: requestBody,
    credentials: 'include',
    signal,
  })

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    throw createApiError(response, data)
  }

  return data
}

export const apiGet = (path, options) =>
  apiRequest(path, { method: 'GET', ...options })

export const apiPost = (path, body, options) =>
  apiRequest(path, { method: 'POST', body, ...options })

export const apiPut = (path, body, options) =>
  apiRequest(path, { method: 'PUT', body, ...options })

export const apiPatch = (path, body, options) =>
  apiRequest(path, { method: 'PATCH', body, ...options })

export const apiDelete = (path, body, options) =>
  apiRequest(path, { method: 'DELETE', body, ...options })
