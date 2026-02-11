import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'

const SearchableSelect = ({ label, options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const openRef = useRef(false)
  const dropdownId = useId()

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    const handler = (event) => {
      if (!openRef.current) return
      const el = containerRef.current
      if (el && el.contains(event.target)) return
      requestAnimationFrame(() => setOpen(false))
    }
    const dropdownHandler = (event) => {
      if (event.detail !== dropdownId) setOpen(false)
    }
    document.addEventListener('mousedown', handler, true)
    window.addEventListener('dropdown-open', dropdownHandler)
    return () => {
      document.removeEventListener('mousedown', handler, true)
      window.removeEventListener('dropdown-open', dropdownHandler)
    }
  }, [dropdownId])

  const handleTriggerClick = () => {
    const next = !open
    if (next && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setOpenUp(spaceBelow < 260)
    }
    setOpen(next)
    if (next) {
      window.dispatchEvent(new CustomEvent('dropdown-open', { detail: dropdownId }))
    }
  }

  const activeLabel =
    options.find((option) => option.value === value)?.label || placeholder

  const filtered = options.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="searchable-select" ref={containerRef}>
      {label && <label className="select-label">{label}</label>}
      <button
        ref={triggerRef}
        type="button"
        className="select-trigger"
        onClick={handleTriggerClick}
      >
        <span>{activeLabel}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div
          className={`select-dropdown ${openUp ? 'select-dropdown-open-up' : ''}`}
          role="listbox"
        >
          <div className="select-search">
            <input
              className="input select-search-input"
              type="search"
              placeholder="Search..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search options"
            />
            <span className="select-search-icon" aria-hidden>
              <Search size={16} />
            </span>
          </div>
          <div className="select-options">
            {filtered.length === 0 ? (
              <span className="menu-description">No results found.</span>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="select-option"
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchableSelect
