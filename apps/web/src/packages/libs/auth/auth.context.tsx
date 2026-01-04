"use client"

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useLazyQuery } from '@apollo/client/react'

import {
  LoginDocument,
  RegisterDocument,
  LogoutDocument,
  MeDocument,
  type User as GqlUser,
  BusinessRole
} from '@/packages/api/graphql'
import { isAuthError as checkAuthError, clearAuthCookies } from '@/packages/utils'

interface User {
  id: string
  email: string
  fullName: string
  phone?: string | null
  emailVerified: boolean
  hasCompletedOnboarding: boolean
  businessRole?: BusinessRole | null
  businessRoleAssignedAt?: string | null
  adminRole?: {
    id: string
    role: string
    permissions: string[]
  } | null
}

interface LoginResult {
  requiresTwoFactor?: boolean
  twoFactorToken?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<LoginResult | void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  refetchUser: () => Promise<void>
  hasPermission: (permission: string) => boolean
  isForeman: boolean
  isWorker: boolean
  canCreateTeam: boolean
  canJoinTeam: boolean
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
  const isRedirectingRef = useRef(false)
  const isRefreshingRef = useRef(false)
  const router = useRouter()

  // Apollo mutations
  const [loginMutation] = useMutation(LoginDocument)
  const [registerMutation] = useMutation(RegisterDocument)
  const [logoutMutation] = useMutation(LogoutDocument)
  const [fetchMe] = useLazyQuery(MeDocument, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: false
  })

  // Check if session token exists (quick check before loading user)
  const hasSessionToken = useCallback(() => {
    if (typeof document === 'undefined') return false
    return document.cookie.split(';').some(c => c.trim().startsWith('session_token='))
  }, [])

  const refreshUser = useCallback(async () => {
    // Prevent multiple calls if already redirecting or refreshing
    if (isRedirectingRef.current || isRefreshingRef.current) {
      return
    }

    // Don't fetch if already on auth pages or landing page and no session token
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      if (((pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) || pathname === '/') && !hasSessionToken()) {
        setUser(null)
        setIsLoading(false)
        return
      }
    }

    isRefreshingRef.current = true

    try {
      const { data, error } = await fetchMe({
        fetchPolicy: 'network-only'
      })

      if (error || !data?.me) {
        // Check if it's a network error (API server not available)
        const errorMessage = error?.message || ''
        const isNetworkError = errorMessage.includes('Failed to fetch') || 
                               errorMessage.includes('NetworkError') ||
                               errorMessage.includes('fetch') ||
                               (error && !checkAuthError(error))
        
        // Check if it's an authentication error (session not found, expired, or deleted)
        if (error && checkAuthError(error)) {
          // Prevent multiple redirects
          if (!isRedirectingRef.current && typeof document !== 'undefined') {
            isRedirectingRef.current = true
            clearAuthCookies();
            setUser(null)
            setIsLoading(false)
            // Only redirect if not already on auth pages or public pages (like landing page)
            const pathname = window.location.pathname
            if (!pathname.startsWith('/auth') && pathname !== '/') {
              router.replace('/auth/login');
            }
            return
          }
        } else if (isNetworkError) {
          // Network error - don't redirect, just set user to null
          // This allows the page to show an error message instead of infinite redirect
          console.warn('[AuthContext] Network error fetching user:', error)
          setUser(null)
          setIsLoading(false)
          // Don't redirect on network errors - let the page handle it
          return
        } else {
          // Other error - set user to null but don't redirect
          setUser(null)
          setIsLoading(false)
        }
      } else {
        // Reset redirecting flag on successful fetch
        isRedirectingRef.current = false
        setUser({
          id: data.me.id,
          email: data.me.email,
          fullName: data.me.fullName,
          phone: data.me.phone,
          emailVerified: data.me.emailVerified,
          hasCompletedOnboarding: data.me.hasCompletedOnboarding,
          businessRole: data.me.businessRole,
          businessRoleAssignedAt: data.me.businessRoleAssignedAt,
          adminRole: data.me.adminRole ? {
            id: data.me.adminRole.id,
            role: data.me.adminRole.role,
            permissions: data.me.adminRole.permissions
          } : null
        })
      }
    } catch (err: any) {
      // Check if it's a network error
      const errorMessage = err?.message || ''
      const isNetworkError = errorMessage.includes('Failed to fetch') || 
                            errorMessage.includes('NetworkError') ||
                            errorMessage.includes('fetch')
      
      // Check if it's an authentication error (session not found, expired, or deleted)
      if (checkAuthError(err) && typeof document !== 'undefined' && !isRedirectingRef.current) {
        isRedirectingRef.current = true
        // Clear cookies and redirect to login
        clearAuthCookies();
        const pathname = window.location.pathname
        // Only redirect if not already on auth pages or public pages (like landing page)
        if (!pathname.startsWith('/auth') && pathname !== '/') {
          router.replace('/auth/login');
        }
      } else if (isNetworkError) {
        // Network error - don't redirect, just log and set user to null
        console.warn('[AuthContext] Network error in refreshUser:', err)
        setUser(null)
        // Don't redirect on network errors
        return
      } else {
        // Other error
        console.error('[AuthContext] Error refreshing user:', err)
        setUser(null)
      }
    } finally {
      setIsLoading(false)
      isRefreshingRef.current = false
    }
  }, [router, hasSessionToken])

  // Reset redirecting flag on mount
  useEffect(() => {
    isRedirectingRef.current = false
  }, [])

  // Initial user fetch on mount
  useEffect(() => {
    // Only fetch once on mount, not on every refreshUser change
    if (isLoading && !isRefreshingRef.current) {
      refreshUser()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Quick redirect for authenticated users on auth pages (before user loads)
  // BUT only if we're not already redirecting to avoid loops
  useEffect(() => {
    if (isLoading && hasSessionToken() && !isRedirectingRef.current && !isRefreshingRef.current) {
      const pathname = window.location.pathname
      // If we have a session token but user is still loading, and we're on auth pages
      // redirect immediately to prevent showing login page
      if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
        isRedirectingRef.current = true
        router.replace('/dashboard')
      }
    }
  }, [isLoading, hasSessionToken, router])

  // Auto-redirect based on onboarding status and auth pages
  useEffect(() => {
    if (isLoading || isRedirectingRef.current) return

    const pathname = window.location.pathname

    // If user is authenticated and on auth pages - redirect to appropriate page
    if (user) {
      // Redirect from auth pages if already authenticated
      if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
        const redirectPath = !user.hasCompletedOnboarding ? '/onboarding' : '/dashboard'
        // Use replace to avoid adding to history and prevent loops
        router.replace(redirectPath)
        return
      }

      // If on /onboarding and already completed - redirect to dashboard
      if (pathname.startsWith('/onboarding') && user.hasCompletedOnboarding) {
        router.replace('/dashboard')
        return
      }

      // If on protected pages without onboarding - redirect to /onboarding
      if (
        (pathname.startsWith('/dashboard') || pathname.startsWith('/teams')) &&
        !user.hasCompletedOnboarding
      ) {
        router.replace('/onboarding')
        return
      }
    } else {
      // If user is not authenticated and on protected pages - redirect to login
      // But don't redirect if already on auth pages or public pages
      const isProtectedRoute = 
        pathname.startsWith('/dashboard') || 
        pathname.startsWith('/teams') || 
        pathname.startsWith('/onboarding') ||
        pathname.startsWith('/settings') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/payment')
      
      if (
        !pathname.startsWith('/auth') &&
        !pathname.startsWith('/api') &&
        pathname !== '/' &&
        isProtectedRoute
      ) {
        // Only redirect if not already redirecting
        if (!isRedirectingRef.current) {
          isRedirectingRef.current = true
          clearAuthCookies()
          router.replace('/auth/login')
        }
        return
      }
    }
  }, [user, isLoading, router])

  const login = useCallback(async (email: string, password: string): Promise<LoginResult | void> => {
    // Reset redirecting flag on login attempt
    isRedirectingRef.current = false

    const response = await loginMutation({
      variables: { input: { email, password } }
    })

    if (response.error) {
      throw new Error(response.error.message || 'Ошибка входа')
    }

    const loginData = response.data?.login

    // Check if 2FA is required
    if (loginData?.requiresTwoFactor && loginData?.twoFactorToken) {
      return {
        requiresTwoFactor: true,
        twoFactorToken: loginData.twoFactorToken
      }
    }

    const userData = loginData?.user
    if (userData) {
      console.log('[AuthContext] Login success, user data:', {
        hasCompletedOnboarding: userData.hasCompletedOnboarding,
        email: userData.email
      })

      // Reset redirecting flag on successful login
      isRedirectingRef.current = false

      setUser({
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone,
        emailVerified: userData.emailVerified,
        hasCompletedOnboarding: userData.hasCompletedOnboarding,
        businessRole: userData.businessRole,
        businessRoleAssignedAt: userData.businessRoleAssignedAt
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
    // Reset redirecting flag on register attempt
    isRedirectingRef.current = false

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

      // Reset redirecting flag on successful register
      isRedirectingRef.current = false

      setUser({
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone,
        emailVerified: userData.emailVerified,
        hasCompletedOnboarding: userData.hasCompletedOnboarding,
        businessRole: userData.businessRole,
        businessRoleAssignedAt: userData.businessRoleAssignedAt
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

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user?.adminRole) return false
    return user.adminRole.permissions.includes(permission)
  }, [user])

  // Business role helpers
  const isForeman = user?.businessRole === BusinessRole.Foreman
  const isWorker = user?.businessRole === BusinessRole.Worker
  const canCreateTeam = !user?.businessRole || isForeman
  const canJoinTeam = !user?.businessRole || isWorker

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
        refetchUser: refreshUser,
        hasPermission,
        isForeman,
        isWorker,
        canCreateTeam,
        canJoinTeam,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
