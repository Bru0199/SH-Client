import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorMessage } from "../utils/api.js";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import Modal from "./Modal.jsx";

const initialForm = {
  username: "",
  email: "",
  phone: "",
  password: "",
};

const initialReset = {
  password: "",
  confirm: "",
};

const OTP_LENGTH = 6;
const OTP_TIMEOUT = 60;

const AuthModal = () => {
  const navigate = useNavigate();
  const {
    isAuthModalOpen,
    authView,
    setAuthView,
    closeAuthModal,
    login,
    requestRegistrationOtp,
    completeRegistration,
    requestPasswordResetOtp,
    verifyResetOtp,
    resetPassword,
    sendOtp,
    isLoading,
  } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [resetForm, setResetForm] = useState(initialReset);
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [otpTimer, setOtpTimer] = useState(OTP_TIMEOUT);
  const [otpPurpose, setOtpPurpose] = useState("register");
  const [activeEmail, setActiveEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const otpRefs = useRef([]);

  useEffect(() => {
    if (isAuthModalOpen) {
      setForm(initialForm);
      setResetForm(initialReset);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setOtpTimer(OTP_TIMEOUT);
    }
  }, [isAuthModalOpen, authView]);

  useEffect(() => {
    if (authView === "otp") {
      setTimeout(() => otpRefs.current[0]?.focus(), 0);
    }
  }, [authView]);

  useEffect(() => {
    if (authView !== "otp") return undefined;
    if (otpTimer <= 0) return undefined;
    const interval = setInterval(() => {
      setOtpTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [authView, otpTimer]);

  const title = useMemo(() => {
    if (authView === "register") return "Create account";
    if (authView === "forgot") return "Reset password";
    if (authView === "otp") return "Verify OTP";
    if (authView === "reset") return "Set new password";
    return "Welcome back";
  }, [authView]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetChange = (event) => {
    const { name, value } = event.target;
    setResetForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const loggedInUser = await login({
        email: form.email,
        password: form.password,
      });
      toast.success("Logged in successfully.");
      closeAuthModal();
      if (loggedInUser?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Something went wrong."));
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setEmailError("");
    try {
      await requestRegistrationOtp(form);
      setActiveEmail(form.email);
      setOtpPurpose("register");
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setOtpTimer(OTP_TIMEOUT);
      toast.success("OTP sent to your email.");
      setAuthView("otp");
    } catch (error) {
      const msg = getErrorMessage(error, "Unable to send OTP.");
      setEmailError(msg);
      toast.error(msg);
    }
  };

  const handleForgot = async (event) => {
    event.preventDefault();
    setEmailError("");
    try {
      await requestPasswordResetOtp(form.email);
      setActiveEmail(form.email);
      setOtpPurpose("reset");
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setOtpTimer(OTP_TIMEOUT);
      toast.success("OTP sent to your email.");
      setAuthView("otp");
    } catch (error) {
      const msg = getErrorMessage(error, "Unable to send OTP.");
      setEmailError(msg);
      toast.error(msg);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    const code = otpDigits.join("");
    if (code.length !== OTP_LENGTH) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }
    try {
      if (otpPurpose === "register") {
        await completeRegistration(code);
        toast.success("OTP verified. Please login.");
        setAuthView("login");
      } else {
        await verifyResetOtp(code);
        toast.success("OTP verified. Set a new password.");
        setAuthView("reset");
      }
      setOtpDigits(Array(OTP_LENGTH).fill(""));
    } catch (error) {
      toast.error(getErrorMessage(error, "Invalid OTP."));
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (!resetForm.password || resetForm.password !== resetForm.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      await resetPassword(activeEmail, resetForm.password);
      toast.success("Password updated. Please login.");
      setAuthView("login");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to reset password."));
    }
  };

  const handleOtpChange = (index, value) => {
    const sanitized = value.replace(/\D/g, "");
    if (!sanitized) {
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    const nextDigits = [...otpDigits];
    if (sanitized.length === 1) {
      nextDigits[index] = sanitized;
      setOtpDigits(nextDigits);
      if (index < OTP_LENGTH - 1) {
        otpRefs.current[index + 1]?.focus();
      }
      return;
    }

    sanitized
      .slice(0, OTP_LENGTH)
      .split("")
      .forEach((digit, idx) => {
        nextDigits[idx] = digit;
      });
    setOtpDigits(nextDigits);
    const focusIndex = Math.min(sanitized.length, OTP_LENGTH) - 1;
    otpRefs.current[focusIndex]?.focus();
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    event.preventDefault();
    handleOtpChange(0, pasted);
  };

  const handleResend = async () => {
    try {
      await sendOtp(activeEmail, otpPurpose);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setOtpTimer(OTP_TIMEOUT);
      toast.success("OTP resent.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to resend OTP."));
    }
  };

  const handleBack = () => {
    if (authView === "otp") {
      setAuthView(otpPurpose === "register" ? "register" : "forgot");
      return;
    }
    if (
      authView === "register" ||
      authView === "forgot" ||
      authView === "reset"
    ) {
      setAuthView("login");
      return;
    }
  };

  return (
    <Modal title={title} isOpen={isAuthModalOpen} onClose={closeAuthModal}>
      {authView !== "login" && (
        <button
          className="button ghost back-button"
          type="button"
          onClick={handleBack}
        >
          <ArrowLeft size={18} />
          Back
        </button>
      )}

      {authView === "login" && (
        <form className="form-card" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              className="input"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              className="input"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            className="button ghost"
            type="button"
            onClick={() => setAuthView("forgot")}
          >
            Forgot password?
          </button>
          <button className="button primary" type="submit" disabled={isLoading}>
            {isLoading ? "Please wait..." : "Login"}
          </button>
          <div className="auth-footer">
            <span>
              New here?{" "}
              <button
                className="button-link"
                type="button"
                onClick={() => setAuthView("register")}
              >
                Create an account
              </button>
            </span>
          </div>
        </form>
      )}

      {authView === "register" && (
        <form className="form-card" onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="username">Full name</label>
            <input
              id="username"
              name="username"
              className="input"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              className="input"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              className="input"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              className="input"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button className="button primary" type="submit" disabled={isLoading}>
            {isLoading ? "Please wait..." : "Sign Up"}
          </button>
        </form>
      )}

      {authView === "forgot" && (
        <form className="form-card" onSubmit={handleForgot}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              className="input"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <button className="button primary" type="submit" disabled={isLoading}>
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      )}

      {authView === "otp" && (
        <form className="form-card" onSubmit={handleVerifyOtp}>
          <div className="otp-banner">
            <div className="otp-icon">
              {otpPurpose === "register" ? (
                <ShieldCheck size={22} />
              ) : (
                <Mail size={22} />
              )}
            </div>
            <div>
              <h4>Enter the 6-digit code</h4>
              <p className="menu-description">
                We sent an OTP to <strong>{activeEmail}</strong>.
              </p>
            </div>
          </div>
          <div className="otp-inputs" onPaste={handleOtpPaste}>
            {otpDigits.map((digit, index) => (
              <input
                key={`otp-${index}`}
                ref={(el) => {
                  otpRefs.current[index] = el;
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
              Resend available in{" "}
              <strong>{otpTimer.toString().padStart(2, "0")}s</strong>
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
          <button className="button primary" type="submit" disabled={isLoading}>
            Verify OTP
          </button>
        </form>
      )}

      {authView === "reset" && (
        <form className="form-card" onSubmit={handleResetPassword}>
          <div className="form-group">
            <label htmlFor="password">New password</label>
            <input
              id="password"
              name="password"
              className="input"
              type="password"
              value={resetForm.password}
              onChange={handleResetChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              name="confirm"
              className="input"
              type="password"
              value={resetForm.confirm}
              onChange={handleResetChange}
              required
            />
          </div>
          <button className="button primary" type="submit" disabled={isLoading}>
            Update password
          </button>
          <button
            className="button ghost"
            type="button"
            onClick={() => setAuthView("login")}
          >
            Back to login
          </button>
        </form>
      )}
    </Modal>
  );
};

export default AuthModal;
