import { useToastStore, type ToastType } from '@/packages/libs/store'

interface ToastOptions {
  message?: string
  title?: string
  description?: string
  type?: ToastType
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const show = useToastStore((state) => state.show)

  const toast = (options: ToastOptions | string, type?: ToastType) => {
    if (typeof options === 'string') {
      return show(options, type || 'success')
    }
    const displayMessage = options.message || options.description || options.title || 'Notification'
    const toastType: ToastType = options.variant === 'destructive' ? 'error' : (options.type || 'success')
    return show(displayMessage, toastType)
  }

  return {
    toast,
    showToast: ({ message, title, description, type }: { message?: string; title?: string; description?: string; type: ToastType }) => {
      const displayMessage = message || title || description || 'Notification';
      return show(displayMessage, type);
    },
    success: (message: string) => show(message, 'success'),
    error: (message: string) => show(message, 'error'),
  }
}
