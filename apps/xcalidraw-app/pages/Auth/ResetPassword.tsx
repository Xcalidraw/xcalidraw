import { IconLoader2, IconLock, IconX, IconRefresh } from '@tabler/icons-react'
import { motion, type Variants } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

import { useConfirmResetPassword, useResetPassword } from '../../hooks/auth.hooks'
import './AuthForms.scss'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

export default function ResetPasswordPage() {
  const location = useLocation()
  const email = location.state?.email || ''
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [timeLeft, setTimeLeft] = useState(60)
  const navigate = useNavigate()
  const confirmReset = useConfirmResetPassword()
  const resendCode = useResetPassword()

  useEffect(() => {
    if (timeLeft === 0) return

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [timeLeft])

  const isFormValid = 
    code.trim() !== '' && 
    password.trim() !== '' && 
    password === confirmPassword

  const handleReset = () => {
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    confirmReset.mutate(
      { email, code, password },
      {
        onSuccess: () => {
          toast.success('Password reset successfully')
          navigate('/auth/login')
        },
        onError: (error) => {
          toast.error('Failed to reset password', {
            description: error.message,
            duration: 4000,
            icon: <IconX className="text-red-500" size={20} />
          })
        }
      }
    )
  }

  const handleResendCode = () => {
    if (timeLeft > 0) return

    resendCode.mutate(
      { email },
      {
        onSuccess: () => {
          toast.success('Reset code resent')
          setTimeLeft(60)
        },
        onError: (error) => {
          toast.error('Failed to resend code', {
            description: error.message,
            duration: 4000,
            icon: <IconX className="text-red-500" size={20} />
          })
        }
      }
    )
  }

  return (
    <motion.div
      animate="visible"
      className="auth-page-container"
      initial="hidden"
      variants={containerVariants}
    >
      <motion.div className="auth-form-container" variants={itemVariants}>
        <motion.div className="header" variants={itemVariants}>
          <h1 className="">Reset Password</h1>
          <p className="">
            Enter the code sent to {email} and your new password.
          </p>
        </motion.div>

        <motion.div className="form-fields" variants={itemVariants}>
          <motion.div className="form-group" variants={itemVariants}>
            <div className="label-row">
              <Label htmlFor="code">Verification Code</Label>
              <Button
                variant="link"
                className="btn-link h-auto p-0 text-xs font-normal"
                disabled={timeLeft > 0 || resendCode.isPending}
                onClick={handleResendCode}
                type="button"
              >
                {resendCode.isPending ? (
                  <IconLoader2 className="mr-1 animate-spin" size={12} />
                ) : timeLeft > 0 ? (
                  `Resend in ${timeLeft}s`
                ) : (
                  <>
                    <IconRefresh className="mr-1" size={12} />
                    Resend Code
                  </>
                )}
              </Button>
            </div>
            <Input
              required
              autoComplete="one-time-code"
              className="custom-input-code"
              id="code"
              placeholder="123456"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <Label htmlFor="password">New Password</Label>
            <Input
              required
              autoComplete="new-password"
              className="custom-input-xl"
              id="password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              required
              autoComplete="new-password"
              className="custom-input-xl"
              id="confirmPassword"
              placeholder="••••••••"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            className="btn-full"
            disabled={!isFormValid || confirmReset.isPending}
            size="lg"
            onClick={handleReset}
          >
            {confirmReset.isPending ? (
              <IconLoader2 className="mr-2 animate-spin" size={18} />
            ) : (
              <IconLock className="mr-2" size={18} />
            )}
            Reset Password
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            className="btn-full"
            variant="ghost"
            onClick={() => navigate('/auth/login')}
          >
            Back to Login
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
