"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Check, AlertCircle } from "lucide-react"
import { useToastStore } from "@/packages/libs/store"

export function Toast() {
  const toast = useToastStore((state) => state.toast)

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-success text-success-foreground shadow-success/25"
              : "bg-destructive text-destructive-foreground shadow-destructive/25"
          }`}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {toast.type === "success" ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm font-medium whitespace-nowrap">
            {toast.message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
