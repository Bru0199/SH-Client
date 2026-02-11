import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'

const MultiSelect = ({ label, options, values, onChange, placeholder }) => {
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

  const filtered = options.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase()),
  )

  const selectedLabels = options
    .filter((option) => values.includes(option.value))
    .map((option) => option.label)

  return (
    <div className="searchable-select" ref={containerRef}>
      {label && <label className="select-label">{label}</label>}
      <button
        ref={triggerRef}
        type="button"
        className="select-trigger"
        onClick={handleTriggerClick}
      >
        <span>
          {selectedLabels.length > 0
            ? selectedLabels.join(', ')
            : placeholder || 'Select'}
        </span>
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
                <label key={option.value} className="select-option checkbox-option">
                  <input
                    type="checkbox"
                    checked={values.includes(option.value)}
                    onChange={() => {
                      if (values.includes(option.value)) {
                        onChange(values.filter((v) => v !== option.value))
                      } else {
                        onChange([...values, option.value])
                      }
                    }}
                  />
                  {option.label}
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiSelect
