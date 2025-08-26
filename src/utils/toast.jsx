import React from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

// Store current toast ID to dismiss it when new toast appears
let currentToastId = null;

// Universal toast configuration
const toastConfig = {
  duration: 2000, // 2 seconds as requested
  position: 'top-center',
  style: {
    padding: '12px 16px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
};

// Close button component
const CloseButton = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
    aria-label="Close toast"
  >
    <X size={18} />
  </button>
);

// Main toast utilities
const showToast = (message, type = 'default') => {
  // Dismiss any existing toast
  if (currentToastId) {
    toast.dismiss(currentToastId);
  }

  // Create the toast content with close button
  const content = (t) => (
    <div className="flex items-center justify-between w-full">
      <span>{message}</span>
      <CloseButton onClick={() => toast.dismiss(t.id)} />
    </div>
  );

  // Show the appropriate toast type
  switch (type) {
    case 'success':
      currentToastId = toast.success(content, toastConfig);
      break;
    case 'error':
      currentToastId = toast.error(content, toastConfig);
      break;
    case 'warning':
      currentToastId = toast.custom(
        (t) => (
          <div 
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } bg-amber-100 text-amber-800 rounded-lg shadow-lg px-4 py-2`}
          >
            {content(t)}
          </div>
        ),
        toastConfig
      );
      break;
    default:
      currentToastId = toast(content, toastConfig);
  }

  return currentToastId;
};

// Helper function to format error messages
const formatErrorMessage = (message) => {
  if (!message) return message;
  
  // Check if the message contains a colon
  if (message.includes(':')) {
    // Extract the part after the colon and trim whitespace
    const formattedMessage = message.split(':')[1].trim();
    return formattedMessage;
  }
  
  return message;
};

// Expose specific toast types
export const successToast = (message) => showToast(message, 'success');
export const errorToast = (message) => showToast(formatErrorMessage(message), 'error');
export const warningToast = (message) => showToast(message, 'warning');
export const defaultToast = (message) => showToast(message, 'default');

// Export all as a single object for convenience
const toastService = {
  success: successToast,
  error: errorToast,
  warning: warningToast,
  default: defaultToast,
};

export default toastService;
