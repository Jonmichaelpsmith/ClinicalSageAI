import { useState, useEffect, createContext, useContext } from "react"

const TOAST_REMOVE_DELAY = 5000

const ToastContext = createContext({})

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((toasts) => toasts.slice(1))
      }, TOAST_REMOVE_DELAY)

      return () => clearTimeout(timer)
    }
  }, [toasts])

  function addToast(toast) {
    setToasts((toasts) => [...toasts, { ...toast, id: crypto.randomUUID() }])
  }

  function removeToast(id) {
    setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return {
    ...context,
    toast: (props) => {
      context.addToast({
        ...props,
        variant: props.variant || "default"
      })
    },
  }
}