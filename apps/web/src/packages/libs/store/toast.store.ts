import { create } from 'zustand'
import { Toast, ToastType } from './toast.types'

interface ToastStore {
  toast: Toast | null
  show: (message: string, type?: ToastType) => void
  hide: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  show: (message, type = 'success') => {
    const id = Date.now().toString()
    set({ toast: { id, message, type } })
    setTimeout(() => set({ toast: null }), 8080)
  },
  hide: () => set({ toast: null }),
}))
