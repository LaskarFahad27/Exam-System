import React, { useRef, useEffect } from 'react';
import 'mathlive';
import { MathfieldElement } from 'mathlive';
import PropTypes from 'prop-types';
import './MathLive.css';

// Register the custom element if it hasn't been registered yet
if (!customElements.get('math-field')) {
  customElements.define('math-field', MathfieldElement);
}

/**
 * A React component wrapper for the MathLive math-field custom element
 * This serves as a replacement for react-mathquill's EditableMathField
 */
const MathField = ({ 
  latex,
  onChange,
  className = '',
  style = {},
  config = {}
}) => {
  const mathfieldRef = useRef(null);

  useEffect(() => {
    const mathfield = mathfieldRef.current;
    
    if (mathfield) {
      // Set initial value
      mathfield.value = latex || '';
      
      // Set default config to always show virtual keyboard toggle
      mathfield.virtualKeyboardMode = 'manual';
      mathfield.virtualKeyboardToggleGlyph = '⌨';
      mathfield.virtualKeyboardTheme = 'material';
      
      // Apply custom configuration
      Object.entries(config).forEach(([key, value]) => {
        mathfield[key] = value;
      });
      
      // Add change event listener
      const handleInput = () => {
        if (onChange) {
          onChange({
            latex: () => mathfield.value,
            text: () => mathfield.getValue('ascii-math')
          });
        }
      };
      
      mathfield.addEventListener('input', handleInput);
      
      return () => {
        mathfield.removeEventListener('input', handleInput);
      };
    }
  }, [latex, onChange, config]);

  return (
    <math-field
      ref={mathfieldRef}
      className={`math-live-field ${className}`}
      style={{
        width: '100%',
        border: 'none', // No border on the math field element itself
        padding: '4px',
        boxSizing: 'border-box',
        outline: 'none', // Remove focus outline
        ...style
      }}
    />
  );
};

MathField.propTypes = {
  latex: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  config: PropTypes.object
};

export { MathField };

// No need for addStyles() with MathLive as it handles styles internally
export const addStyles = () => {
  console.warn('addStyles() is not needed with MathLive and is included for compatibility with react-mathquill');
};

// Export a compatibility wrapper for EditableMathField to minimize code changes
export const EditableMathField = MathField;

export default { MathField, EditableMathField, addStyles };
