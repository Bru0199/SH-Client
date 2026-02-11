import React from 'react'

const RoundToggle = ({ checked, onChange, icons = {}, ariaLabel = 'Toggle' }) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`round-toggle flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 p-0 shadow-sm transition-colors focus:outline-none ${checked ? 'checked' : ''}`}
    >
      {checked ? icons.on : icons.off}
    </button>
  )
}

export default RoundToggle
