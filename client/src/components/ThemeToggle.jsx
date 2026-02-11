import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      className="button ghost"
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
}

export default ThemeToggle
