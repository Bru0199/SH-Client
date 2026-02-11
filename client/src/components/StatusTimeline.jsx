const StatusTimeline = ({ status }) => {
  if (!status) return null

  const variant = (() => {
    if (status === 'Delivered') return 'success'
    if (status === 'Cancelled') return 'danger'
    if (status === 'Out for Delivery') return 'warning'
    return 'primary'
  })()

  return (
    <div className="status-timeline">
      <span className={`badge ${variant}`}>Current status: {status}</span>
    </div>
  )
}

export default StatusTimeline
