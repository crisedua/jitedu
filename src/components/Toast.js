import React, { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Toast Context
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000, action = null) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration, action };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message, duration, action) => addToast(message, 'success', duration, action);
  const error = (message, duration, action) => addToast(message, 'error', duration, action);
  const warning = (message, duration, action) => addToast(message, 'warning', duration, action);
  const info = (message, duration, action) => addToast(message, 'info', duration, action);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="toast-icon" />;
      case 'error':
        return <AlertCircle className="toast-icon" />;
      case 'warning':
        return <AlertTriangle className="toast-icon" />;
      default:
        return <Info className="toast-icon" />;
    }
  };

  return (
    <div 
      className={`toast toast-${toast.type} ${isVisible ? 'toast-visible' : ''} ${isLeaving ? 'toast-leaving' : ''}`}
    >
      <div className="toast-content">
        {getIcon()}
        <div className="toast-message">
          {toast.message}
          {toast.action && (
            <button 
              className="toast-action"
              onClick={toast.action.onClick}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      </div>
      <button className="toast-close" onClick={handleRemove}>
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;