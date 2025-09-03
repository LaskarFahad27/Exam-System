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
    maxWidth: '90vw', // Limit width on small screens
    width: 'auto',    // Allow it to adapt to content
    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', // Responsive font size
  },
};

// Close button component
const CloseButton = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="ml-1 p-1 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
    aria-label="Close toast"
  >
    <X size={16} className="h-[14px] w-[14px] sm:h-[18px] sm:w-[18px]" />
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
      <span className="pr-2 break-words flex-1 text-sm sm:text-base">{message}</span>
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
            } bg-amber-100 text-amber-800 rounded-lg shadow-lg px-3 py-2 sm:px-4 sm:py-2 max-w-[90vw] w-auto`}
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

// Special timer warning toast for exam countdowns
export const timerWarningToast = (message) => {
  // Dismiss any existing toast
  if (currentToastId) {
    toast.dismiss(currentToastId);
  }

  // Create the toast content with close button and timer icon
  const content = (t) => (
    <div className="flex items-center justify-between w-full gap-2">
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <span className="font-medium text-sm sm:text-base flex-1">{message}</span>
      </div>
      <CloseButton onClick={() => toast.dismiss(t.id)} />
    </div>
  );

  // Use a custom toast for timer warnings
  currentToastId = toast.custom(
    (t) => (
      <div 
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } bg-amber-100 border-l-4 border-amber-500 text-amber-800 rounded-lg shadow-lg px-3 py-2 sm:px-4 sm:py-2 max-w-[90vw] w-auto`}
      >
        {content(t)}
      </div>
    ),
    {
      duration: 3000, // Slightly longer duration for timer alerts
      position: 'bottom-center',
      style: {
        padding: '0',
        zIndex: 9999,
      }
    }
  );

  return currentToastId;
};

// Export all as a single object for convenience
const toastService = {
  success: successToast,
  error: errorToast,
  warning: warningToast,
  default: defaultToast,
  timerWarning: timerWarningToast,
};

export default toastService;
