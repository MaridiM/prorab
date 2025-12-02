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
  name?: string | null
  phone?: string | null
  emailVerified: boolean
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
  name?: string
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
          name: data.me.name,
          phone: data.me.phone,
          emailVerified: data.me.emailVerified
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

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginMutation({ 
      variables: { input: { email, password } } 
    })

    if (response.errors?.length) {
      throw new Error(response.errors[0]?.message || 'Ошибка входа')
    }

    const userData = response.data?.login?.user
    if (userData) {
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        emailVerified: userData.emailVerified
      })
      router.push('/dashboard')
    }
  }, [loginMutation, router])

  const register = useCallback(async (registerData: RegisterData) => {
    const response = await registerMutation({
      variables: { input: registerData }
    })

    if (response.errors?.length) {
      throw new Error(response.errors[0]?.message || 'Ошибка регистрации')
    }

    const userData = response.data?.register?.user
    if (userData) {
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        emailVerified: userData.emailVerified
      })
      router.push('/dashboard')
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
