import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost, apiPut, getErrorMessage } from '../utils/api.js'
import {
  STORAGE_KEYS,
  clearToken,
  readStorage,
  readToken,
  writeStorage,
  writeToken,
} from '../utils/storage.js'

const AuthContext = createContext(null)

const normalizeUser = (user) => {
  if (!user) return null
  const id = user.id || user._id
  const username =
    user.username || user.name || user.fullName || user.full_name || ''
  return { ...user, id, username }
}

const extractUser = (payload) => {
  if (!payload) return null
  if (payload.user) return payload.user
  if (payload.data?.user) return payload.data.user
  if (payload.profile) return payload.profile
  if (
    payload.data &&
    typeof payload.data === 'object' &&
    (payload.data.email || payload.data.username || payload.data.name)
  ) {
    return payload.data
  }
  if (payload.email || payload.username || payload.name) return payload
  return null
}

const extractToken = (payload) => {
  if (!payload) return null
  return (
    payload.token ||
    payload.accessToken ||
    payload.data?.token ||
    payload.data?.accessToken
  )
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() =>
    normalizeUser(readStorage(STORAGE_KEYS.user)),
  )
  const [token, setToken] = useState(() => readToken())
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [isAuthModalOpen, setAuthModalOpen] = useState(false)
  const [authView, setAuthView] = useState('login')
  const [pendingRegistration, setPendingRegistration] = useState(null)
  const [pendingResetEmail, setPendingResetEmail] = useState('')
  const [pendingResetOtp, setPendingResetOtp] = useState('')

  useEffect(() => {
    if (!token) return
    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const response = await apiGet('/api/auth/me')
        const nextUser = normalizeUser(extractUser(response))
        setUser(nextUser)
        writeStorage(STORAGE_KEYS.user, nextUser)
      } catch {
        clearToken()
        setToken(null)
        setUser(null)
        localStorage.removeItem(STORAGE_KEYS.user)
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [token])

  const login = async ({ email, password }) => {
    setIsLoading(true)
    setAuthError('')
    try {
      const response = await apiPost(
        '/api/auth/login',
        { email, password },
        { auth: false },
      )
      const resolvedToken = extractToken(response)
      const resolvedUser = normalizeUser(extractUser(response))

      if (resolvedToken) {
        writeToken(resolvedToken)
        setToken(resolvedToken)
      }
      if (resolvedUser) {
        setUser(resolvedUser)
        writeStorage(STORAGE_KEYS.user, resolvedUser)
      } else {
        const profile = await apiGet('/api/auth/me')
        const nextUser = normalizeUser(extractUser(profile))
        setUser(nextUser)
        writeStorage(STORAGE_KEYS.user, nextUser)
      }

      return resolvedUser
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to login.')
      setAuthError(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    if (!user) {
      throw new Error('Please login to update profile.')
    }
    setIsLoading(true)
    try {
      const response = await apiPut('/api/users/profile', updates)
      const nextUser = normalizeUser(extractUser(response)) || {
        ...user,
        ...updates,
      }
      setUser(nextUser)
      writeStorage(STORAGE_KEYS.user, nextUser)
      return nextUser
    } finally {
      setIsLoading(false)
    }
  }

  const requestRegistrationOtp = async (payload) => {
    setIsLoading(true)
    setAuthError('')
    try {
      const registration = payload || pendingRegistration
      if (!registration?.email) {
        throw new Error('Please provide registration details.')
      }
      await apiPost('/api/auth/register', registration, { auth: false })
      setPendingRegistration(registration)
      return true
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to register.')
      setAuthError(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const completeRegistration = async (code) => {
    if (!pendingRegistration) {
      throw new Error('Registration session expired.')
    }
    setIsLoading(true)
    try {
      await apiPost(
        '/api/auth/verify-otp',
        {
          email: pendingRegistration.email,
          otp: code,
          purpose: 'register',
        },
        { auth: false },
      )
      setPendingRegistration(null)
      return true
    } finally {
      setIsLoading(false)
    }
  }

  const requestPasswordResetOtp = async (email) => {
    setIsLoading(true)
    setAuthError('')
    try {
      const targetEmail = email || pendingResetEmail
      if (!targetEmail) {
        throw new Error('Please enter your email address.')
      }
      await apiPost(
        '/api/auth/forgot-password',
        { email: targetEmail },
        { auth: false },
      )
      setPendingResetEmail(targetEmail)
      return true
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to send OTP.')
      setAuthError(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verifyResetOtp = async (code) => {
    if (!pendingResetEmail) {
      throw new Error('Reset session expired.')
    }
    setIsLoading(true)
    try {
      await apiPost(
        '/api/auth/verify-otp',
        { email: pendingResetEmail, otp: code, purpose: 'reset' },
        { auth: false },
      )
      setPendingResetOtp(code)
      return true
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email, newPassword) => {
    const targetEmail = email || pendingResetEmail
    if (!targetEmail) {
      throw new Error('Reset session expired.')
    }
    if (!newPassword || newPassword.length < 4) {
      throw new Error('Password must be at least 4 characters.')
    }
    setIsLoading(true)
    try {
      await apiPost(
        '/api/auth/reset-password',
        {
          email: targetEmail,
          otp: pendingResetOtp || undefined,
          password: newPassword,
          newPassword,
        },
        { auth: false },
      )
      setPendingResetEmail('')
      setPendingResetOtp('')
      return true
    } finally {
      setIsLoading(false)
    }
  }

  const sendOtp = async (email, purpose) => {
    if (purpose === 'register') {
      return requestRegistrationOtp()
    }
    if (purpose === 'reset') {
      return requestPasswordResetOtp(email)
    }
    return true
  }

  const logout = async () => {
    try {
      await apiPost('/api/auth/logout', null)
    } catch {

    } finally {
      clearToken()
      setToken(null)
      localStorage.removeItem(STORAGE_KEYS.user)
      setUser(null)
      setPendingRegistration(null)
      setPendingResetEmail('')
      setPendingResetOtp('')
    }
  }

  const openAuthModal = (view = 'login') => {
    setAuthError('')
    setAuthView(view)
    setAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setAuthModalOpen(false)
    setAuthView('login')
    setAuthError('')
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      authError,
      isAuthModalOpen,
      authView,
      pendingResetEmail,
      login,
      updateProfile,
      requestRegistrationOtp,
      completeRegistration,
      requestPasswordResetOtp,
      verifyResetOtp,
      resetPassword,
      sendOtp,
      logout,
      openAuthModal,
      closeAuthModal,
      setAuthView,
    }),
    [
      user,
      token,
      isLoading,
      authError,
      isAuthModalOpen,
      authView,
      pendingResetEmail,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
