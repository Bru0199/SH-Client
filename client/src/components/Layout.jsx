import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import MobileBottomNav from './MobileBottomNav.jsx'

const Layout = () => {
  return (
    <>
      <Header />

      <div className="shrink-0 w-full h-[calc(var(--navbar-height)+1rem)]" aria-hidden="true" />
      <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden relative z-0">
        <main className="flex-1 min-w-0 overflow-x-hidden pt-6 pb-16 px-4 md:px-6" role="main">
          <Outlet />
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    </>
  )
}

export default Layout
