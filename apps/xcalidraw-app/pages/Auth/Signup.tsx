import {
  IconBrandAppleFilled,
  IconBrandFacebookFilled,
  IconBrandGoogleFilled,
  IconLoader2,
  IconMail,
  IconX
} from '@tabler/icons-react'
import { motion, type Variants, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Separator } from '../../components/ui/separator'

import { useLoginWithGoogle, useSignUpWithEmail } from '../../hooks/auth.hooks'
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

export default function SignupPage() {
  const [showAppleLogin, setShowAppleLogin] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  
  const isFormValid =
    name.trim() !== '' && 
    email.trim() !== '' && 
    password.trim() !== ''

  const loginWithGoogle = useLoginWithGoogle()
  const signUpWithEmail = useSignUpWithEmail()

  useEffect(() => {
    const isAppleDevice = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
    setShowAppleLogin(isAppleDevice)
  }, [])

  const handleSignup = () => {
    signUpWithEmail.mutate(
      { email, password, name },
      {
        onSuccess: () => {
          navigate(`/auth/confirm-email?email=${encodeURIComponent(email)}`, {
            state: { password }
          })
        },
        onError: (error) => {
          toast.error('Signup failed', {
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
          <h1 className="">Create Account</h1>
          <p className="">
            Join us and start your journey today.
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
            Sign up with Google
          </SocialButton>
          <SocialButton
            icon={<IconBrandFacebookFilled size={20} />}
            provider="Facebook"
          >
            Sign up with Facebook
          </SocialButton>
          {showAppleLogin && (
            <div className="full-width">
              <SocialButton
                icon={<IconBrandAppleFilled size={20} />}
                provider="Apple"
              >
                Sign up with Apple
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
            <Label htmlFor="name">Full Name</Label>
            <Input
              required
              className="custom-input-lg"
              id="name"
              placeholder="John Doe"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </motion.div>

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
            <Label htmlFor="password">Password</Label>
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
            disabled={!isFormValid || signUpWithEmail.isPending}
            size="lg"
            onClick={handleSignup}
          >
            {signUpWithEmail.isPending ? (
              <IconLoader2 className="mr-2 animate-spin" size={18} />
            ) : (
              <IconMail className="mr-2" size={18} />
            )}
            Sign up with Email
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <p className="footer-text">
            Already have an account?{' '}
            <Button
              className="btn-link"
              variant="link"
              onClick={() => navigate('/auth/login')}
            >
              Log in
            </Button>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
