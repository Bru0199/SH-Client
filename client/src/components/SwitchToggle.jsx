import React from 'react'

const SwitchToggle = ({ checked, onChange, icons = {}, ariaLabel = 'Toggle' }) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`switch-toggle relative flex h-[30px] w-[54px] cursor-pointer items-center rounded-full border-[1.5px] p-0 shadow-sm transition-colors ${checked ? 'checked' : ''}`}
    >

      <span
        className={`switch-toggle-thumb absolute left-[4px] top-[3px] z-[2] flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-[22px]' : 'translate-x-0'
        }`}
      >
        {checked ? icons.on : icons.off}
      </span>
    </button>
  )
}

export default SwitchToggle
