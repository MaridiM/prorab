/**
 * Utility functions for authentication handling
 */

// Flag to prevent multiple redirects
let isRedirecting = false

/**
 * Clears all authentication-related data (cookies, localStorage, sessionStorage)
 */
export function clearAuthCookies(): void {
  if (typeof document === 'undefined') return

  const cookiesToClear = ['session_token', 'refresh_token']
  
  // Clear cookies
  cookiesToClear.forEach(cookieName => {
    // Clear cookie by setting it to expire in the past
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    // Also try with domain variations
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
  })

  // Clear localStorage (remove auth-related keys)
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('auth') || key.includes('session') || key.includes('token') || key.includes('user'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (e) {
    // Ignore errors (may fail in private browsing mode)
  }

  // Clear sessionStorage (remove auth-related keys)
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.includes('auth') || key.includes('session') || key.includes('token') || key.includes('user'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key))
  } catch (e) {
    // Ignore errors (may fail in private browsing mode)
  }
}

/**
 * Checks if an error is an authentication error (session expired, invalid, or not found)
 */
export function isAuthError(error: any): boolean {
  if (!error) return false

  const errorMessage = error.message || String(error) || ''
  const lowerMessage = errorMessage.toLowerCase()

  // Check for explicit error codes
  if (
    error.extensions?.code === 'UNAUTHENTICATED' ||
    error.extensions?.statusCode === 401 ||
    error.statusCode === 401 ||
    error.digest?.includes('401') ||
    error.digest?.includes('UNAUTHENTICATED')
  ) {
    return true
  }

  // Check GraphQL errors array
  if (error.graphQLErrors?.length > 0) {
    const hasAuthError = error.graphQLErrors.some((err: any) =>
      err.extensions?.code === 'UNAUTHENTICATED' ||
      err.extensions?.statusCode === 401 ||
      err.message?.includes('Сессия истекла') ||
      err.message?.includes('Требуется авторизация') ||
      err.message?.includes('User not authenticated')
    )
    if (hasAuthError) return true
  }

  // Check for authentication-related messages
  const authMessages = [
    'сессия истекла',
    'сессия недействительна',
    'требуется авторизация',
    'user not authenticated',
    'unauthorized',
    'session expired',
    'session invalid',
    'session not found',
    'session deleted',
  ]

  return authMessages.some(msg => lowerMessage.includes(msg))
}

/**
 * Handles authentication error by clearing cookies and redirecting to login
 * @param redirectPath - Optional path to redirect to (defaults to '/auth/login')
 */
export function handleAuthError(redirectPath: string = '/auth/login'): void {
  if (typeof window === 'undefined') return

  // Prevent multiple redirects
  if (isRedirecting) {
    return
  }

  // Don't redirect if already on login page to avoid loops
  if (window.location.pathname.startsWith('/auth/login') || 
      window.location.pathname.startsWith('/auth/register')) {
    // Still clear cookies even if already on auth page
    clearAuthCookies()
    return
  }

  // Set flag to prevent multiple redirects
  isRedirecting = true

  // Clear all auth data (cookies, localStorage, sessionStorage)
  clearAuthCookies()

  // Clear Apollo Client cache if available
  try {
    // Dynamic import to avoid circular dependencies
    if (typeof window !== 'undefined') {
      // Clear cache by accessing the client through a global reference or module
      // This will be handled by the Apollo error link before calling this function
    }
  } catch (e) {
    // Ignore errors when clearing cache
  }

  // Use replace instead of href to avoid adding to history
  // This prevents back button from causing loops
  window.location.replace(redirectPath)
}

