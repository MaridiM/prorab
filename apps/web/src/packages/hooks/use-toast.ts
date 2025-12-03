import { useToastStore } from '@/packages/libs/store'

export function useToast() {
  const show = useToastStore((state) => state.show)

  return {
    toast: show,
    success: (message: string) => show(message, 'success'),
    error: (message: string) => show(message, 'error'),
  }
}
