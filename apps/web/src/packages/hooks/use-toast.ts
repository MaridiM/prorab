import { useToastStore, type ToastType } from '@/packages/libs/store'

export function useToast() {
  const show = useToastStore((state) => state.show)

  return {
    toast: show,
    showToast: ({ message, type }: { message: string; type: ToastType }) => show(message, type),
    success: (message: string) => show(message, 'success'),
    error: (message: string) => show(message, 'error'),
  }
}
