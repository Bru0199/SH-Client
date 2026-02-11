import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AuthModal from './AuthModal.jsx'

const AppShell = () => {
  return (
    <>
      <Toaster position="top-right" />
      <AuthModal />
      <Outlet />
    </>
  )
}

export default AppShell
