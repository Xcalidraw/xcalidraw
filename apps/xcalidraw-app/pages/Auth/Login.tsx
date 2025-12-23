import {
  IconBrandAppleFilled,
  IconBrandFacebookFilled,
  IconBrandGoogleFilled,
  IconLoader2,
  IconMail,
  IconX
} from '@tabler/icons-react'
import { motion, type Variants } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Separator } from '../../components/ui/separator'

import { useLoginWithEmail, useLoginWithGoogle } from '../../hooks/auth.hooks'
import './AuthForms.scss'

const SocialButton = ({
  icon,
  children,
  onClick
}: {
  provider: string
  icon: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
}) => (
  <Button className="btn-full" variant="outline" onClick={onClick}>
    <div>{icon}</div>
    {children}
  </Button>
)

// Animation variants
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

export default function LoginPage() {
  const [showAppleLogin, setShowAppleLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const isFormValid = email.trim() !== '' && password.trim() !== ''
  const loginWithGoogle = useLoginWithGoogle()
  const loginWithEmail = useLoginWithEmail()

  useEffect(() => {
    // Conditionally show Apple login based on user agent
    const isAppleDevice = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)

    setShowAppleLogin(isAppleDevice)
  }, [])

  const handleLogin = () => {
    loginWithEmail.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate('/')
        },
        onError: (error) => {
          toast.error('Login failed', {
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
          <h1 className="">Welcome Back</h1>
          <p className="">
            Log in to continue your journey.
          </p>
        </motion.div>

        <motion.div
          className="social-buttons-grid"
          variants={itemVariants}
        >
          <SocialButton
            icon={<IconBrandGoogleFilled size={20} />}
            provider="Google"
            onClick={() => loginWithGoogle.mutate()}
          >
            Continue with Google
          </SocialButton>
          <SocialButton
            icon={<IconBrandFacebookFilled size={20} />}
            provider="Facebook"
          >
            Continue with Facebook
          </SocialButton>
          {showAppleLogin && (
            <div className="full-width">
              <SocialButton
                icon={<IconBrandAppleFilled size={20} />}
                provider="Apple"
              >
                Continue with Apple
              </SocialButton>
            </div>
          )}
        </motion.div>

        <motion.div className="separator-container" variants={itemVariants}>
          <Separator />
          <span className="">OR</span>
          <Separator />
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
          <motion.div className="form-group" variants={itemVariants}>
            <div className="label-row">
              <Label htmlFor="password">Password</Label>
              <Button
                className="btn-link"
                variant="link"
                onClick={() => navigate('/auth/forgot-password')}
              >
                Forgot password?
              </Button>
            </div>
            <Input
              required
              className="custom-input-xl"
              id="password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            className="btn-full"
            disabled={!isFormValid || loginWithEmail.isPending}
            size="lg"
            onClick={handleLogin}
          >
            {loginWithEmail.isPending ? (
              <IconLoader2 className="mr-2 animate-spin" size={18} />
            ) : (
              <IconMail className="mr-2" size={18} />
            )}
            Log in with Email
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <p className="footer-text">
            Don't have an account?{' '}
            <Button
              className="btn-link"
              variant="link"
              onClick={() => navigate('/auth/signup')}
            >
              Sign up
            </Button>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
