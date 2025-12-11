import { IconCheck, IconLoader2, IconX } from '@tabler/icons-react'
import { motion, type Variants } from 'framer-motion'
import { useState } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

import { useConfirmSignUp, useResendSignUpCode, useLoginWithEmail } from '../../hooks/auth.hooks'
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

export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const email = searchParams.get('email') || ''
  const password = location.state?.password
  const [code, setCode] = useState('')
  const navigate = useNavigate()
  const confirmSignUp = useConfirmSignUp()
  const resendCode = useResendSignUpCode()
  const loginWithEmail = useLoginWithEmail()

  const handleConfirm = () => {
    confirmSignUp.mutate(
      { email, code },
      {
        onSuccess: () => {
          toast.success('Email confirmed successfully')
          
          if (password) {
            loginWithEmail.mutate(
              { email, password },
              {
                onSuccess: () => {
                  toast.success('Logged in successfully')
                  navigate('/onboarding')
                },
                onError: (error) => {
                  console.error('Auto-login failed:', error)
                  navigate('/auth/login')
                }
              }
            )
          } else {
            navigate('/auth/login')
          }
        },
        onError: (error) => {
          toast.error('Confirmation failed', {
            description: error.message,
            duration: 4000,
            icon: <IconX className="text-red-500" size={20} />
          })
        }
      }
    )
  }

  const handleResendCode = () => {
    resendCode.mutate(
      { email },
      {
        onSuccess: () => {
          toast.success('Verification code resent')
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

  if (!email) {
    return (
      <div className="auth-page-container">
        <p className="text-red-500">Invalid request. Email is missing.</p>
      </div>
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
          <h1 className="">Confirm Email</h1>
          <p className="">
            We sent a verification code to <strong>{email}</strong>.
          </p>
        </motion.div>

        <motion.div className="form-fields" variants={itemVariants}>
          <motion.div className="form-group" variants={itemVariants}>
            <Label htmlFor="code">Verification Code</Label>
            <Input
              required
              className="custom-input-code"
              id="code"
              maxLength={6}
              placeholder="000000"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            className="btn-full"
            disabled={code.length !== 6 || confirmSignUp.isPending || loginWithEmail.isPending}
            size="lg"
            onClick={handleConfirm}
          >
            {confirmSignUp.isPending || loginWithEmail.isPending ? (
              <IconLoader2 className="mr-2 animate-spin" size={18} />
            ) : (
              <IconCheck className="mr-2" size={18} />
            )}
            Confirm Email
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <p className="footer-text">
            Didn't receive the code?{' '}
            <Button
              className="btn-link"
              disabled={resendCode.isPending}
              variant="link"
              onClick={handleResendCode}
            >
              Resend Code
            </Button>
          </p>
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
