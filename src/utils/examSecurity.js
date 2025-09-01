/**
 * Exam Security Module
 * 
 * This module contains security measures to prevent cheating during online exams:
 * - Developer tools detection
 * - Tab switching detection
 * - Keyboard shortcuts blocking
 * - Right-click blocking
 * - Browser navigation prevention
 * - Print/screenshot prevention
 */

// For displaying notifications
import toastService from './toast.jsx';
import { securityModalManager } from './securityModal.jsx';

// Store security state
let securityState = {
  detected: false,
  tabSwitchViolation: false,
  isExamRunning: false,
  originalPrint: null,
  originalFunctionToString: null,
  intervalIds: [],
};

/**
 * Initialize all security measures
 * @param {Function} navigate - React Router's navigation function
 * @returns {Function} - Cleanup function
 */
export const initializeExamSecurity = (navigate) => {
  // Reset state
  securityState = {
    detected: false,
    tabSwitchViolation: false,
    isExamRunning: true,
    originalPrint: window.print,
    originalFunctionToString: Function.prototype.toString,
    intervalIds: [],
  };

  // 1. Developer tools detection
  const cleanupDevTools = setupDevToolsDetection(navigate);
  
  // 2. Tab/window visibility detection (strict mode)
  const cleanupVisibility = setupStrictVisibilityDetection(navigate);
  
  // 3. Keyboard shortcuts and click prevention
  const cleanupShortcuts = setupKeyboardShortcutsAndClickPrevention();
  
  // 4. Browser navigation prevention
  const cleanupNavigation = setupNavigationPrevention();
  
  // 5. Print and screen capture prevention
  const cleanupPrintScreen = setupPrintScreenPrevention();

  // Return a combined cleanup function
  return () => {
    securityState.isExamRunning = false;
    cleanupDevTools();
    cleanupVisibility();
    cleanupShortcuts();
    cleanupNavigation();
    cleanupPrintScreen();
    
    // Clear all intervals
    securityState.intervalIds.forEach(id => clearInterval(id));
    securityState.intervalIds = [];
  };
};

/**
 * Setup developer tools detection
 */
const setupDevToolsDetection = (navigate) => {
  const handleDevToolsOpen = () => {
    if (!securityState.detected && securityState.isExamRunning) {
      securityState.detected = true;
      
      // Show modal instead of alert
      securityModalManager.openModal(
        "Developer Tools Detected",
        "You have violated the rules by opening the developer tools. Therefore, you are not eligible to continue the examination.",
        "error",
        () => navigate("/") // Navigate after modal is closed
      );
      
      // Still show toast for additional notification
      toastService.error("Developer tools detected! Your exam session has been terminated.");
    }
  };

  // Method 1: Detect by window dimensions
  const detectByDimensions = () => {
    if (
      window.outerHeight - window.innerHeight > 150 ||
      window.outerWidth - window.innerWidth > 150
    ) {
      handleDevToolsOpen();
    }
  };

  // Method 2: Detect using console trap
  const detectByConsole = () => {
    const element = new Image();
    Object.defineProperty(element, "id", {
      get: function () {
        handleDevToolsOpen();
        return "";
      }
    });
    console.log("%c", element);
  };

  // Method 3: Detect using debugger timing
  const detectByDebugger = () => {
    try {
      const start = performance.now();
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        handleDevToolsOpen();
      }
    } catch (e) {
      // Ignore errors
    }
  };

  // Method 4: Detect using function.prototype.toString modification
  Function.prototype.toString = function() {
    handleDevToolsOpen();
    return securityState.originalFunctionToString.apply(this, arguments);
  };

  // Method 5: Detect using window resize events
  const resizeListener = () => {
    if (
      window.outerHeight - window.innerHeight > 150 ||
      window.outerWidth - window.innerWidth > 150
    ) {
      handleDevToolsOpen();
    }
  };
  window.addEventListener('resize', resizeListener);

  // Run all detection methods on interval
  const detectAll = () => {
    if (!securityState.detected) {
      detectByDimensions();
      detectByConsole();
      detectByDebugger();
    }
  };

  const intervalId = setInterval(detectAll, 500);
  securityState.intervalIds.push(intervalId);

  // Return cleanup function
  return () => {
    window.removeEventListener('resize', resizeListener);
    if (Function.prototype.toString !== securityState.originalFunctionToString) {
      Function.prototype.toString = securityState.originalFunctionToString;
    }
  };
};

/**
 * Setup strict visibility detection - ANY loss of visibility is a violation
 */
const setupStrictVisibilityDetection = (navigate) => {
  const handleVisibilityLoss = () => {
    if (securityState.isExamRunning && !securityState.tabSwitchViolation) {
      securityState.tabSwitchViolation = true;
      
      // Show modal instead of alert
      securityModalManager.openModal(
        "Exam Page Visibility Lost",
        "You have violated the rules by navigating away from the exam page. Therefore, you are not eligible to continue the examination.",
        "error",
        () => navigate("/") // Navigate after modal is closed
      );
      
      // Still show toast for additional notification
      toastService.error("Exam page visibility lost! Your exam session has been terminated.");
    }
  };

  // Primary detection method - visibilitychange event
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden" && securityState.isExamRunning) {
      handleVisibilityLoss();
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);
  
  // Secondary detection - window blur
  const handleWindowBlur = () => {
    if (securityState.isExamRunning) {
      handleVisibilityLoss();
    }
  };
  window.addEventListener("blur", handleWindowBlur);
  
  // Tertiary detection - periodically check document.hasFocus()
  const checkFocus = () => {
    if (securityState.isExamRunning && !document.hasFocus()) {
      handleVisibilityLoss();
    }
  };
  const focusCheckInterval = setInterval(checkFocus, 1000);
  securityState.intervalIds.push(focusCheckInterval);
  
  // Return cleanup function
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleWindowBlur);
  };
};

/**
 * Setup keyboard shortcuts and click prevention
 */
const setupKeyboardShortcutsAndClickPrevention = () => {
  // Disable right click
  const disableRightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Show a warning modal instead of just a toast
    securityModalManager.openModal(
      "Action Not Allowed",
      "Right-clicking is disabled during the exam!",
      "warning"
    );
    
    return false;
  };

  // Disable keyboard shortcuts
  const disableKeyShortcuts = (e) => {
    // Only apply to document or window elements, not inputs or textareas
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return true;
    }
    
    // Prevent common keyboard shortcuts
    if (
      // Copy, Cut, Paste
      (e.ctrlKey && (e.key === "c" || e.key === "C" || e.keyCode === 67)) || 
      (e.ctrlKey && (e.key === "x" || e.key === "X" || e.keyCode === 88)) || 
      (e.ctrlKey && (e.key === "v" || e.key === "V" || e.keyCode === 86)) ||
      
      // Print and Save
      (e.ctrlKey && (e.key === "p" || e.key === "P" || e.keyCode === 80)) || 
      (e.ctrlKey && (e.key === "s" || e.key === "S" || e.keyCode === 83)) ||
      
      // New window/tab
      (e.ctrlKey && (e.key === "n" || e.key === "N" || e.keyCode === 78)) || 
      (e.ctrlKey && (e.key === "t" || e.key === "T" || e.keyCode === 84)) ||
      
      // Browser dev tools
      (e.ctrlKey && (e.key === "u" || e.key === "U" || e.keyCode === 85)) || 
      (e.keyCode === 123 || e.key === "F12") ||
      
      // Alt+Tab simulation
      (e.altKey && (e.key === "Tab" || e.keyCode === 9)) ||
      
      // Windows key
      (e.key === "Meta" || e.keyCode === 91 || e.keyCode === 92) ||
      
      // Select all
      (e.ctrlKey && (e.key === "a" || e.key === "A" || e.keyCode === 65)) ||
      
      // Function keys
      (e.key === "F1" || e.key === "F3" || e.key === "F4" || e.key === "F5" || e.key === "F6" || 
       e.key === "F7" || e.key === "F10" || e.key === "F11")
    ) {
      e.preventDefault();
      e.stopPropagation();
      
      // Show a warning modal instead of just a toast
      securityModalManager.openModal(
        "Action Not Allowed",
        "Keyboard shortcuts are disabled during the exam!",
        "warning"
      );
      
      return false;
    }
  };

  // Disable selecting text
  const disableSelect = (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      return false;
    }
  };

  // Disable dragging
  const disableDrag = (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  // Apply all event listeners with capture phase
  document.addEventListener("contextmenu", disableRightClick, true);
  document.addEventListener("keydown", disableKeyShortcuts, true);
  document.addEventListener("selectstart", disableSelect, true);
  document.addEventListener("dragstart", disableDrag, true);

  // Additional prevention for copy/paste events
  document.addEventListener("copy", (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  }, true);
  
  document.addEventListener("cut", (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  }, true);
  
  document.addEventListener("paste", (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  }, true);

  // Handle escape key and alt key separately to prevent ALT+TAB effectively
  const handleKeyUp = (e) => {
    if (e.key === "Escape" || e.key === "Alt") {
      e.preventDefault();
      return false;
    }
  };
  document.addEventListener("keyup", handleKeyUp, true);

  // Return cleanup function
  return () => {
    document.removeEventListener("contextmenu", disableRightClick, true);
    document.removeEventListener("keydown", disableKeyShortcuts, true);
    document.removeEventListener("selectstart", disableSelect, true);
    document.removeEventListener("dragstart", disableDrag, true);
    document.removeEventListener("copy", (e) => e.preventDefault(), true);
    document.removeEventListener("cut", (e) => e.preventDefault(), true);
    document.removeEventListener("paste", (e) => e.preventDefault(), true);
    document.removeEventListener("keyup", handleKeyUp, true);
  };
};

/**
 * Setup browser navigation prevention
 */
const setupNavigationPrevention = () => {
  const blockNavigation = (e) => {
    // Block browser back/forward navigation
    if (e.type === 'popstate') {
      // Push another state to prevent going back
      window.history.pushState(null, document.title, window.location.href);
      
      // Show a warning modal instead of just a toast
      securityModalManager.openModal(
        "Action Not Allowed",
        "Navigation is disabled during the exam!",
        "warning"
      );
      
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  // Initially push a state to ensure we can block navigation
  window.history.pushState(null, document.title, window.location.href);
  
  // Listen for popstate (back/forward button)
  window.addEventListener('popstate', blockNavigation);

  // Return cleanup function
  return () => {
    window.removeEventListener('popstate', blockNavigation);
  };
};

/**
 * Setup print and screen capture prevention
 */
const setupPrintScreenPrevention = () => {
  // Block printing by overriding the print function
  window.print = function() {
    // Show a warning modal instead of just a toast
    securityModalManager.openModal(
      "Action Not Allowed",
      "Printing is disabled during the exam!",
      "warning"
    );
    
    return false;
  };

  // Block the PrintScreen key
  const blockPrintScreen = (e) => {
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      
      // Show a warning modal instead of just a toast
      securityModalManager.openModal(
        "Action Not Allowed",
        "Screen capture is disabled during the exam!",
        "warning"
      );
      
      return false;
    }
  };

  document.addEventListener('keydown', blockPrintScreen, true);

  // Return cleanup function
  return () => {
    window.print = securityState.originalPrint;
    document.removeEventListener('keydown', blockPrintScreen, true);
  };
};

export default { initializeExamSecurity };
