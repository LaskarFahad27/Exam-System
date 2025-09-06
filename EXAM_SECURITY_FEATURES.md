# Exam System Security Features

This documentation explains the security features implemented to prevent cheating during online exams.

## Overview

The Exam System includes robust security measures to ensure academic integrity during online examinations. These features are implemented in a centralized security module that can be easily integrated into any exam component.

## Security Features

### 1. Developer Tools Detection

Multiple methods are used to detect if a student opens browser developer tools:

- Window dimension detection (comparing inner and outer dimensions)
- Console object property traps
- Debugger timing detection
- Function.prototype.toString modification detection
- Window resize event monitoring

### 2. Strict Visibility Detection

The system enforces strict visibility rules that terminate the exam if the student navigates away from the exam page:

- Visibility change API monitoring (strict mode)
- Window blur event detection
- Document focus periodic checking
- Immediate termination if exam page loses visibility

### 3. Keyboard Shortcut Prevention

All potentially problematic keyboard shortcuts are disabled:

- Copy/Cut/Paste (Ctrl+C, Ctrl+X, Ctrl+V)
- Print and Save (Ctrl+P, Ctrl+S)
- New window/tab (Ctrl+N, Ctrl+T)
- Browser developer tools (Ctrl+U, F12)
- Alt+Tab simulation
- Windows key
- Select all (Ctrl+A)
- Function keys (F1, F3-F7, F10-F11)

### 4. Mouse Action Prevention

Various mouse actions that could enable cheating are blocked:

- Right-click context menu
- Text selection (except in input fields and textareas)
- Drag and drop (except for legitimate UI elements)

### 5. Browser Navigation Prevention

The system prevents students from navigating away from the exam:

- History API manipulation to block back/forward navigation
- Warning notifications when navigation is attempted

### 6. Print/Screen Capture Prevention

Features to prevent content duplication:

- Print function override
- PrintScreen key blocking

## Implementation

The security module is implemented in `src/utils/examSecurity.js` and provides:

- A single initialization function `initializeExamSecurity(navigate)`
- Proper cleanup functions to remove event listeners when exam is completed
- State management to avoid duplicate event handling

The modern modal component is implemented in `src/utils/securityModal.jsx`:

- Styled modal component with backdrop blur
- Modal manager for global access from any component
- Support for different severity levels (error/warning)
- Clean integration with security events

## Usage

To implement security features in an exam component:

```jsx
import { initializeExamSecurity } from './utils/examSecurity.js';
import { SecurityModalContainer } from './utils/securityModal.jsx';

// Inside your component
const MyExamComponent = () => {
  const navigate = useNavigate();
  
  // Initialize security
  useEffect(() => {
    const cleanupSecurity = initializeExamSecurity(navigate);
    return () => {
      cleanupSecurity();
    };
  }, [navigate]);
  
  return (
    <div>
      {/* Include the modal container in your component */}
      <SecurityModalContainer />
      
      {/* Rest of your component... */}
    </div>
  );
}
```

## Important Notes

1. These security measures are client-side only and should be complemented with server-side validation
2. Extreme security measures may affect accessibility for some students
3. A proper warning system should be in place to inform students about behavior that may be flagged
4. Allow exceptions for legitimate use cases (e.g., allowing text input in essay questions)

## Testing Recommendations

Test all security features across different browsers:
- Chrome
- Firefox
- Edge
- Safari

Verify that security measures do not interfere with legitimate exam functionality.

## Future Enhancements

Potential improvements to consider:
- Server-side validation of exam duration and submission times
- Webcam monitoring
- IP address verification
- Browser fingerprinting
- AI-based anomaly detection
