import { useState, useCallback } from 'react'
import Toast, { ToastProps } from './Toast'

export interface ToastMessage extends Omit<ToastProps, 'onClose'> {
  id: string
}

let toastId = 0

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((message: string, type: ToastProps['type'] = 'success', duration?: number) => {
    const id = `toast-${++toastId}`
    const newToast: ToastMessage = { id, message, type, duration }
    
    setToasts((prev) => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return { showToast, removeToast, toasts }
}

export const ToastContainer = ({ toasts, removeToast }: { toasts: ToastMessage[], removeToast: (id: string) => void }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}



