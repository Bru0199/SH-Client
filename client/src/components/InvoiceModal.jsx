import { useState } from 'react'
import Modal from './Modal.jsx'
import Invoice from './Invoice.jsx'

const InvoiceModal = ({ order, menuMap, triggerLabel = 'View Invoice' }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="button ghost" onClick={() => setOpen(true)}>{triggerLabel}</button>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <Invoice order={order} menuMap={menuMap} />
      </Modal>
    </>
  )
}

export default InvoiceModal
