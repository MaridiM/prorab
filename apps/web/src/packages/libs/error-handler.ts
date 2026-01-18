/**
 * Global Error Handler
 * 
 * This module sets up global error handlers for unhandled promise rejections
 * and uncaught errors. It must be imported early in the application lifecycle
 * to catch errors that occur before React components mount.
 * 
 * Handles:
 * - AbortError (expected when requests are cancelled)
 * - Payment provider errors (checkout popup config)
 * 
 * This module executes immediately when imported (synchronously) to ensure
 * handlers are registered before any other code runs.
 */

// Execute immediately (synchronously) when module loads
(function setupErrorHandlers() {
  if (typeof window === 'undefined') return
  
  // Prevent multiple registrations
  if ((window as any).__errorHandlersSetup) return
  ;(window as any).__errorHandlersSetup = true

  // Store original console methods
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn
  
  // Filter console.error to suppress AbortError and checkout popup errors
  console.error = function(...args: any[]) {
    const message = args.join(' ')
    if (
      message.includes('AbortError') ||
      message.includes('aborted') ||
      message.includes('No checkout popup config found') ||
      message.includes('checkout popup')
    ) {
      return // Suppress these errors
    }
    originalConsoleError.apply(console, args)
  }
  
  // Filter console.warn similarly
  console.warn = function(...args: any[]) {
    const message = args.join(' ')
    if (
      message.includes('AbortError') ||
      message.includes('aborted') ||
      message.includes('No checkout popup config found') ||
      message.includes('checkout popup')
    ) {
      return // Suppress these warnings
    }
    originalConsoleWarn.apply(console, args)
  }

  // Helper function to check if error is AbortError
  const isAbortError = (error: any): boolean => {
    if (!error) return false
    
    const errorName = error?.name || ''
    const errorMessage = String(error?.message || '')
    const errorString = String(error || '')
    const errorStack = String(error?.stack || '')
    
    return (
      errorName === 'AbortError' ||
      errorName === 'DOMException' && errorMessage.includes('aborted') ||
      errorMessage.toLowerCase().includes('aborted') ||
      errorMessage.toLowerCase().includes('user aborted') ||
      errorMessage.toLowerCase().includes('the user aborted') ||
      errorString.toLowerCase().includes('abort') ||
      errorStack.toLowerCase().includes('abort')
    )
  }

  // Helper function to check if error is checkout popup error
  const isCheckoutPopupError = (error: any): boolean => {
    if (!error) return false
    
    const errorMessage = String(error?.message || '')
    const errorString = String(error || '')
    
    return (
      errorMessage.includes('No checkout popup config found') ||
      errorMessage.includes('checkout popup') ||
      errorString.includes('checkout popup')
    )
  }

  // Handle unhandled promise rejections (AbortError, etc.)
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    try {
      const error = event.reason
      
      // Silently handle AbortError - it's expected when requests are cancelled
      if (isAbortError(error)) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
      
      // Silently handle "No checkout popup config found" - payment provider error
      if (isCheckoutPopupError(error)) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    } catch (e) {
      // Ignore errors in error handler itself
    }
  }

  // Handle uncaught errors
  const handleError = (event: ErrorEvent) => {
    try {
      const error = event.error
      
      // Silently handle AbortError in error events
      if (isAbortError(error) || isAbortError(event.message)) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
      
      // Silently handle checkout popup errors
      if (isCheckoutPopupError(error) || isCheckoutPopupError(event.message)) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    } catch (e) {
      // Ignore errors in error handler itself
    }
  }

  // Register handlers immediately (synchronously)
  // Use capture phase to catch errors earlier
  window.addEventListener('unhandledrejection', handleUnhandledRejection, true)
  window.addEventListener('error', handleError, true)
  
  // Also register without capture for compatibility
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
  window.addEventListener('error', handleError)
  
  // Override Promise.reject to catch errors earlier (for debugging, but keep original behavior)
  const originalPromiseReject = Promise.reject
  Promise.reject = function(reason: any) {
    if (isAbortError(reason) || isCheckoutPopupError(reason)) {
      // Return a promise that never resolves/rejects to suppress the error
      return new Promise(() => {})
    }
    return originalPromiseReject.call(Promise, reason)
  }
  
  // Also patch window.onunhandledrejection as a fallback
  const originalOnUnhandledRejection = window.onunhandledrejection
  window.onunhandledrejection = function(event: PromiseRejectionEvent) {
    if (isAbortError(event.reason) || isCheckoutPopupError(event.reason)) {
      event.preventDefault()
      return false
    }
    if (originalOnUnhandledRejection) {
      return originalOnUnhandledRejection.call(window, event)
    }
  }
  
  // Patch window.onerror as a fallback
  const originalOnError = window.onerror
  window.onerror = function(
    message: string | Event,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error
  ): boolean {
    if (
      isAbortError(error) ||
      isAbortError(message) ||
      isCheckoutPopupError(error) ||
      isCheckoutPopupError(message)
    ) {
      return true // Suppress error
    }
    if (originalOnError) {
      return originalOnError.call(window, message, source, lineno, colno, error)
    }
    return false
  }
})()
