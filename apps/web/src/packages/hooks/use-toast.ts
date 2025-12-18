import { useToastStore, type ToastType } from '@/packages/libs/store'

export function useToast() {
  const show = useToastStore((state) => state.show)

  return {
    toast: show,
    showToast: ({ message, title, description, type }: { message?: string; title?: string; description?: string; type: ToastType }) => {
      const displayMessage = message || title || description || 'Notification';
      return show(displayMessage, type);
    },
    success: (message: string) => show(message, 'success'),
    error: (message: string) => show(message, 'error'),
  }
}
