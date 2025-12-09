"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useLazyQuery } from '@apollo/client/react'

import { 
  LoginDocument, 
  RegisterDocument, 
  LogoutDocument, 
  MeDocument,
  type User as GqlUser 
} from '@/packages/api/graphql'

interface User {
  id: string
  email: string
  fullName: string
  phone?: string | null
  emailVerified: boolean
  hasCompletedOnboarding: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  fullName: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Apollo mutations
  const [loginMutation] = useMutation(LoginDocument)
  const [registerMutation] = useMutation(RegisterDocument)
  const [logoutMutation] = useMutation(LogoutDocument)
  const [fetchMe] = useLazyQuery(MeDocument, {
    fetchPolicy: 'network-only'
  })

  const refreshUser = useCallback(async () => {
    try {
      const { data, error } = await fetchMe()

      if (error || !data?.me) {
        setUser(null)
      } else {
        setUser({
          id: data.me.id,
          email: data.me.email,
          fullName: data.me.fullName,
          phone: data.me.phone,
          emailVerified: data.me.emailVerified,
          hasCompletedOnboarding: data.me.hasCompletedOnboarding
        })
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [fetchMe])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  // Auto-redirect based on onboarding status and auth pages
  useEffect(() => {
    if (isLoading) return

    const pathname = window.location.pathname

    // If user is authenticated and on auth pages - redirect to appropriate page
    if (user) {
      // Redirect from auth pages if already authenticated
      if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
        const redirectPath = !user.hasCompletedOnboarding ? '/onboarding' : '/dashboard'
        router.push(redirectPath)
        return
      }

      // If on /onboarding and already completed - redirect to dashboard
      if (pathname.startsWith('/onboarding') && user.hasCompletedOnboarding) {
        router.push('/dashboard')
        return
      }

      // If on protected pages without onboarding - redirect to /onboarding
      if (
        (pathname.startsWith('/dashboard') || pathname.startsWith('/teams')) &&
        !user.hasCompletedOnboarding
      ) {
        router.push('/onboarding')
        return
      }
    }
  }, [user, isLoading, router])

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginMutation({
      variables: { input: { email, password } }
    })

    if (response.error) {
      throw new Error(response.error.message || 'Ошибка входа')
    }

    const userData = response.data?.login?.user
    if (userData) {
      console.log('[AuthContext] Login success, user data:', {
        hasCompletedOnboarding: userData.hasCompletedOnboarding,
        email: userData.email
      })

      setUser({
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone,
        emailVerified: userData.emailVerified,
        hasCompletedOnboarding: userData.hasCompletedOnboarding
      })

      // Redirect based on onboarding status (with small delay for state update)
      const redirectPath = !userData.hasCompletedOnboarding ? '/onboarding' : '/dashboard'
      console.log('[AuthContext] Redirecting to:', redirectPath)

      setTimeout(() => {
        console.log('[AuthContext] Executing router.push to:', redirectPath)
        router.push(redirectPath)
      }, 100)
    } else {
      console.error('[AuthContext] No user data in response')
    }
  }, [loginMutation, router])

  const register = useCallback(async (registerData: RegisterData) => {
    const response = await registerMutation({
      variables: {
        input: {
          email: registerData.email,
          password: registerData.password,
          fullName: registerData.fullName,
          phone: registerData.phone || null
        }
      }
    })

    if (response.error) {
      throw new Error(response.error.message || 'Ошибка регистрации')
    }

    const userData = response.data?.register?.user
    if (userData) {
      console.log('[AuthContext] Register success, user data:', {
        hasCompletedOnboarding: userData.hasCompletedOnboarding,
        email: userData.email
      })

      setUser({
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone,
        emailVerified: userData.emailVerified,
        hasCompletedOnboarding: userData.hasCompletedOnboarding
      })

      // Redirect based on onboarding status (with small delay for state update)
      const redirectPath = !userData.hasCompletedOnboarding ? '/onboarding' : '/dashboard'
      console.log('[AuthContext] Redirecting to:', redirectPath)

      setTimeout(() => {
        console.log('[AuthContext] Executing router.push to:', redirectPath)
        router.push(redirectPath)
      }, 100)
    } else {
      console.error('[AuthContext] No user data in response')
    }
  }, [registerMutation, router])

  const logout = useCallback(async () => {
    try {
      await logoutMutation()
    } finally {
      setUser(null)
      router.push('/auth/login')
    }
  }, [logoutMutation, router])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
