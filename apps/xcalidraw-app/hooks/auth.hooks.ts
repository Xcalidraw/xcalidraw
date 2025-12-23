import { useMutation, useQuery } from '@tanstack/react-query'
import {
  confirmResetPassword,
  confirmSignUp,
  fetchAuthSession,
  getCurrentUser,
  resendSignUpCode,
  resetPassword,
  signIn,
  signInWithRedirect,
  signOut,
  signUp
} from 'aws-amplify/auth'

export const useLoginWithGoogle = () => {
  const mutation = useMutation({
    mutationFn: () =>
      signInWithRedirect({
        provider: 'Google'
      })
  })

  return mutation
}

export const useLogout = () => {
  const mutation = useMutation({
    mutationFn: () => signOut()
  })

  return mutation
}

export const useUserLoggedIn = () => {
  const mutation = useMutation({
    mutationFn: () => getCurrentUser()
  })

  return mutation
}

interface UserProfile {
  username: string
  email: string
  name: string
  picture: string
  given_name: string
  family_name: string
}
export const useGetUser = (): {
  user: UserProfile
  isLoading: boolean
  isError: boolean
  error: Error | null
} => {
  const query = useQuery({
    queryKey: ['USER'],
    queryFn: async (): Promise<UserProfile> => {
      const user = await getCurrentUser()
      const session = await fetchAuthSession()

      // Decode the ID token to get Google profile info
      const idToken = session.tokens?.idToken?.toString()
      let userProfile = null

      if (idToken) {
        const payload = JSON.parse(atob(idToken.split('.')[1])) as {
          email?: string
          name?: string
          picture?: string
          given_name?: string
          family_name?: string
        }

        userProfile = {
          email: payload.email || '',
          name: payload.name || '',
          picture: payload.picture || '',
          given_name: payload.given_name || '',
          family_name: payload.family_name || ''
        }
      }

      return {
        username: user?.username || '',
        email: userProfile?.email || '',
        name: userProfile?.name || '',
        picture: userProfile?.picture || '',
        given_name: userProfile?.given_name || '',
        family_name: userProfile?.family_name || ''
      }
    }
  })

  return {
    user: query.data as UserProfile,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error
  }
}

export const useLoginWithEmail = () => {
  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signIn({
        username: email,
        password
      })
  })

  return mutation
}

export const useSignUpWithEmail = () => {
  const mutation = useMutation({
    mutationFn: ({
      email,
      password,
      name
    }: {
      email: string
      password: string
      name: string
    }) =>
      signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            name: name
          }
        }
      })
  })

  return mutation
}

export const useResetPassword = () => {
  const mutation = useMutation({
    mutationFn: ({ email }: { email: string }) =>
      resetPassword({
        username: email
      })
  })

  return mutation
}

export const useConfirmResetPassword = () => {
  const mutation = useMutation({
    mutationFn: ({
      email,
      code,
      password
    }: {
      email: string
      code: string
      password: string
    }) =>
      confirmResetPassword({
        username: email,
        newPassword: password,
        confirmationCode: code
      })
  })

  return mutation
}

export const useConfirmSignUp = () => {
  const mutation = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      confirmSignUp({
        username: email,
        confirmationCode: code
      })
  })

  return mutation
}

export const useResendSignUpCode = () => {
  const mutation = useMutation({
    mutationFn: ({ email }: { email: string }) =>
      resendSignUpCode({
        username: email
      })
  })

  return mutation
}
