import React from 'react'
import logo from '../assets/logo.png'
import lightLogo from '../assets/LightLogo.png'
import darkLogo from '../assets/DarkLogo.png'
import { useTheme } from '../context/ThemeContext.jsx'

const Logo = ({ showName = true, size = 'lg', className = '', ...props }) => {
  const { theme } = useTheme()
  const sizes = {
    sm: { icon: 'h-10 w-10', name: 'h-6' },
    md: { icon: 'h-15 w-15', name: 'h-8' },
    lg: { icon: 'h-15 w-15', name: 'h-15 w-auto' },
  }
  const sizeClasses = sizes[size] || sizes.lg

  return (
    <div className={`logo brand flex items-center gap-3 ${className}`} {...props}>
      <img src={logo} alt="Logo" className={`logo-img ${sizeClasses.icon}`} />
      {showName && (
        <img
          src={theme === 'dark' ? darkLogo : lightLogo}
          alt={theme === 'dark' ? 'Logo Name Dark' : 'Logo Name Light'}
          className={`brand-name ${sizeClasses.name}`}
        />
      )}
    </div>
  )
}

export default Logo
