import React from 'react';
import ReactDOM from 'react-dom';
import { XCircle, AlertTriangle } from 'lucide-react';

// Modal root where modals will be rendered
const modalRoot = document.createElement('div');
modalRoot.id = 'security-modal-root';
document.body.appendChild(modalRoot);

// Modal component for security violations
export const SecurityViolationModal = ({ 
  isOpen, 
  onClose, 
  title = 'Security Violation Detected', 
  message = 'You have violated the exam rules.',
  severity = 'error' // 'error' or 'warning'
}) => {
  if (!isOpen) return null;

  // Create portal for modal
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all">
        {/* Header */}
        <div className={`p-5 ${severity === 'error' ? 'bg-red-600' : 'bg-amber-500'} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {severity === 'error' ? (
                <XCircle className="w-7 h-7" />
              ) : (
                <AlertTriangle className="w-7 h-7" />
              )}
              <h3 className="text-xl font-bold">{title}</h3>
            </div>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <div className="text-gray-700 mb-6">
            {message}
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className={`px-5 py-2 rounded-md text-white font-medium transition-colors ${
                severity === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'
              }`}
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

// Modal manager for global access
class SecurityModalManager {
  constructor() {
    this.callbacks = {};
    this.isModalOpen = false;
  }

  // Open a modal with given details
  openModal(title, message, severity = 'error', callback = null) {
    // Set modal state
    this.isModalOpen = true;
    this.title = title;
    this.message = message;
    this.severity = severity;
    this.callback = callback;
    
    // Notify listeners
    this.notifyListeners();
  }

  // Close the current modal
  closeModal() {
    this.isModalOpen = false;
    this.notifyListeners();
    
    // Execute callback if any
    if (this.callback) {
      setTimeout(this.callback, 0);
    }
  }

  // Subscribe to modal state changes
  subscribe(id, callback) {
    this.callbacks[id] = callback;
    return () => {
      delete this.callbacks[id];
    };
  }

  // Notify all listeners of state change
  notifyListeners() {
    Object.values(this.callbacks).forEach(callback => {
      callback({
        isOpen: this.isModalOpen,
        title: this.title,
        message: this.message,
        severity: this.severity
      });
    });
  }
}

// Create singleton instance
export const securityModalManager = new SecurityModalManager();

// Modal container component to be used in app
export const SecurityModalContainer = () => {
  const [modalState, setModalState] = React.useState({
    isOpen: false,
    title: '',
    message: '',
    severity: 'error'
  });

  React.useEffect(() => {
    // Subscribe to modal manager
    const unsubscribe = securityModalManager.subscribe('container', setModalState);
    return unsubscribe;
  }, []);

  const handleClose = () => {
    securityModalManager.closeModal();
  };

  return (
    <SecurityViolationModal
      isOpen={modalState.isOpen}
      onClose={handleClose}
      title={modalState.title}
      message={modalState.message}
      severity={modalState.severity}
    />
  );
};

export default {
  SecurityViolationModal,
  SecurityModalContainer,
  securityModalManager
};
