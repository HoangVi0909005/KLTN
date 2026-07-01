import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-800',
      Icon: CheckCircle
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-800',
      Icon: AlertCircle
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-800',
      Icon: Info
    }
  };

  const style = styles[type] || styles.success;
  const Icon = style.Icon;

  return (
    <div className={`fixed top-4 right-4 ${style.bg} border ${style.border} rounded-lg p-4 flex items-center gap-3 shadow-lg max-w-md z-50 animate-fadeIn`}>
      <Icon className={`${style.icon} flex-shrink-0`} size={24} />
      <p className={`${style.text} font-medium flex-1`}>{message}</p>
      <button
        onClick={() => setIsVisible(false)}
        className={`${style.text} hover:opacity-70 transition`}
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default Toast;
