import { useState } from 'react'
import Modal from '../../../components/Modal/Modal'
import Button from '../../../components/Button/Button'
import Input from '../../../components/Input/Input'
import { authLogin } from './service'

function LoginModal({ isOpen, onClose, onLogin }) {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetState = () => {
    setError('')
    setIsForgotPassword(false)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const data = await authLogin(userId, password)
      onLogin(data.user)
      handleClose()
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid user ID or password')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = (event) => {
    event.preventDefault()
    setError(`A password reset link has been sent to ${userId || 'your email'}.`)
    setIsForgotPassword(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isForgotPassword ? 'Reset Password' : 'Login'}>
      {isForgotPassword ? (
        <>
          <h2 className="mb-4 text-center font-display text-[32px] font-bold leading-tight text-black">
            Reset Password
          </h2>
          <p className="mx-auto mb-8 max-w-sm text-center text-[13px] leading-6 text-[#6b7280]">
            Enter your user ID or email address and we will send password reset instructions.
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
            <label className="sr-only" htmlFor="reset-user-id">User ID</label>
            <Input
              autoComplete="username"
              id="reset-user-id"
              onChange={(event) => setUserId(event.target.value)}
              placeholder="Enter your user ID"
              required
              type="email"
              value={userId}
            />

            <Button type="submit" variant="primary" className="mt-2 w-full min-h-14">
              Send Reset Link
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full justify-center"
              onClick={() => {
                setError('')
                setIsForgotPassword(false)
              }}
            >
              Back to Login
            </Button>
          </form>
        </>
      ) : (
        <>
          <h2 className="mb-8 text-center font-display text-[32px] font-bold leading-tight text-black">
            Login
          </h2>

          {error && (
            <p className="mb-4 rounded-lg border border-[#f3c6c6] bg-[#fff5f5] px-4 py-3 text-center text-[14px] leading-5 text-[#ba1a1a]">
              {error}
            </p>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <label className="sr-only" htmlFor="login-user-id">User ID</label>
            <Input
              autoComplete="username"
              id="login-user-id"
              onChange={(event) => setUserId(event.target.value)}
              placeholder="Enter your user ID"
              required
              type="email"
              value={userId}
            />

            <label className="sr-only" htmlFor="login-password">Password</label>
            <Input
              autoComplete="current-password"
              id="login-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              type="password"
              value={password}
            />

            <Button
              type="button"
              variant="ghost"
              className="self-end"
              onClick={() => {
                setError('')
                setIsForgotPassword(true)
              }}
            >
              Forgot Password?
            </Button>

            <Button
              type="submit"
              variant="primary"
              className="w-full min-h-14 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </>
      )}
    </Modal>
  )
}

export default LoginModal
