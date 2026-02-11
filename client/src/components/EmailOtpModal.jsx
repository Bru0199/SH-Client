import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../utils/api.js'
import { Mail } from 'lucide-react'
import Modal from './Modal.jsx'

const OTP_LENGTH = 6
const OTP_TIMEOUT = 60

const EmailOtpModal = ({ isOpen, email, onClose, onVerify, onResend }) => {
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [otpTimer, setOtpTimer] = useState(OTP_TIMEOUT)
  const otpRefs = useRef([])

  useEffect(() => {
    if (isOpen) {
      setOtpDigits(Array(OTP_LENGTH).fill(''))
      setOtpTimer(OTP_TIMEOUT)
      setTimeout(() => otpRefs.current[0]?.focus(), 0)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || otpTimer <= 0) return undefined
    const interval = setInterval(() => {
      setOtpTimer((prev) => Math.max(prev - 1, 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [isOpen, otpTimer])

  const handleOtpChange = (index, value) => {
    const sanitized = value.replace(/\D/g, '')
    if (!sanitized) {
      setOtpDigits((prev) => {
        const next = [...prev]
        next[index] = ''
        return next
      })
      return
    }

    const nextDigits = [...otpDigits]
    if (sanitized.length === 1) {
      nextDigits[index] = sanitized
      setOtpDigits(nextDigits)
      if (index < OTP_LENGTH - 1) {
        otpRefs.current[index + 1]?.focus()
      }
      return
    }

    sanitized
      .slice(0, OTP_LENGTH)
      .split('')
      .forEach((digit, idx) => {
        nextDigits[idx] = digit
      })
    setOtpDigits(nextDigits)
    const focusIndex = Math.min(sanitized.length, OTP_LENGTH) - 1
    otpRefs.current[focusIndex]?.focus()
  }

  const handleOtpKeyDown = (event, index) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (event) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '')
    if (!pasted) return
    event.preventDefault()
    handleOtpChange(0, pasted)
  }

  const handleVerify = async (event) => {
    event.preventDefault()
    const code = otpDigits.join('')
    if (code.length !== OTP_LENGTH) {
      toast.error('Please enter the 6-digit OTP.')
      return
    }
    try {
      await onVerify(code)
      onClose()
      toast.success('Email updated successfully.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Invalid OTP.'))
    }
  }

  const handleResend = () => {
    if (otpTimer > 0) return
    onResend()
    setOtpTimer(OTP_TIMEOUT)
    setOtpDigits(Array(OTP_LENGTH).fill(''))
    toast.success('OTP resent.')
  }

  return (
    <Modal title="Verify email update" isOpen={isOpen} onClose={onClose}>
      <form className="form-card" onSubmit={handleVerify}>
        <div className="otp-banner">
          <div className="otp-icon">
            <Mail size={22} />
          </div>
          <div>
            <h4>Enter the 6-digit code</h4>
            <p className="menu-description">
              We sent an OTP to <strong>{email}</strong>.
            </p>
          </div>
        </div>
        <div className="otp-inputs" onPaste={handleOtpPaste}>
          {otpDigits.map((digit, index) => (
            <input
              key={`otp-email-${index}`}
              ref={(el) => {
                otpRefs.current[index] = el
              }}
              className="otp-input"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(event) => handleOtpChange(index, event.target.value)}
              onKeyDown={(event) => handleOtpKeyDown(event, index)}
              onFocus={(event) => event.target.select()}
            />
          ))}
        </div>
        <div className="otp-timer">
          <span>
            Resend available in{' '}
            <strong>{otpTimer.toString().padStart(2, '0')}s</strong>
          </span>
          <button
            className="button ghost"
            type="button"
            onClick={handleResend}
            disabled={otpTimer > 0}
          >
            Resend OTP
          </button>
        </div>
        <button className="button primary" type="submit">
          Verify OTP
        </button>
      </form>
    </Modal>
  )
}

export default EmailOtpModal
