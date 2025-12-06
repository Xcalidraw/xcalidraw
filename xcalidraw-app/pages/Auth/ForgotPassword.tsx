import { IconLoader2, IconMail, IconX } from '@tabler/icons-react'
import { motion, type Variants } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

import { useResetPassword } from '../../hooks/auth.hooks'
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()
  const resetPassword = useResetPassword()

  const handleReset = () => {
    resetPassword.mutate(
      { email },
      {
        onSuccess: () => {
          toast.success('Reset code sent')
          // Navigate to a reset password confirmation page (not implemented yet, or reuse confirm email logic)
          // For now, just go back to login
          navigate('/auth/login') 
        },
        onError: (error) => {
          toast.error('Failed to send reset code', {
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
          <h1 className="">Forgot Password</h1>
          <p className="">
            Enter your email to receive a reset code.
          </p>
        </motion.div>

        <motion.div className="form-fields" variants={itemVariants}>
          <motion.div className="form-group" variants={itemVariants}>
            <Label htmlFor="email">Email</Label>
            <Input
              required
              className="custom-input-lg"
              id="email"
              placeholder="name@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            className="btn-full"
            disabled={!email || resetPassword.isPending}
            size="lg"
            onClick={handleReset}
          >
            {resetPassword.isPending ? (
              <IconLoader2 className="mr-2 animate-spin" size={18} />
            ) : (
              <IconMail className="mr-2" size={18} />
            )}
            Send Reset Code
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
