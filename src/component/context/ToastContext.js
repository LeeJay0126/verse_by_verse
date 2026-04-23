import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, variant = "info", duration = 3000) => {
    if (!message) return;
    setToast({ message, variant });

    // auto-hide
    if (duration > 0) {
      setTimeout(() => {
        setToast(null);
      }, duration);
    }
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <div
          className={`Toast Toast--${toast.variant}`}
          role="status"
          aria-live="polite"
        >
          <span className="ToastAccent" aria-hidden="true" />
          <span className="ToastMessage">{toast.message}</span>
          <button
            type="button"
            className="ToastClose"
            onClick={hideToast}
            aria-label="Dismiss notification"
          >
            x
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};
