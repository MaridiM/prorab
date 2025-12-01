"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name?: string
  phone?: string
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

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          query: `query Me { me { id email name phone emailVerified } }`,
        }),
      })
      
      const { data, errors } = await response.json()
      
      if (errors || !data?.me) {
        setUser(null)
      } else {
        setUser(data.me)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        query: `mutation Login($input: LoginInput!) { 
          login(input: $input) { 
            user { id email name emailVerified } 
          } 
        }`,
        variables: { input: { email, password } },
      }),
    })

    const { data, errors } = await response.json()

    if (errors) {
      throw new Error(errors[0]?.message || 'Ошибка входа')
    }

    setUser(data.login.user)
    router.push('/dashboard')
  }

  const register = async (registerData: RegisterData) => {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        query: `mutation Register($input: RegisterInput!) { 
          register(input: $input) { 
            user { id email name emailVerified }
            message
          } 
        }`,
        variables: { input: registerData },
      }),
    })

    const { data, errors } = await response.json()

    if (errors) {
      throw new Error(errors[0]?.message || 'Ошибка регистрации')
    }

    setUser(data.register.user)
    router.push('/dashboard')
  }

  const logout = async () => {
    try {
      await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          query: `mutation Logout { logout }`,
        }),
      })
    } finally {
      setUser(null)
      router.push('/auth/login')
    }
  }

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

