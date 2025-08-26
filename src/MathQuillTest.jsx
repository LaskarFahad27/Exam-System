import React, { useEffect } from 'react';
import { addStyles, EditableMathField } from 'react-mathquill';

// Test component to verify react-mathquill is working
const MathQuillTest = () => {
  useEffect(() => {
    // Initialize MathQuill styles
    try {
      addStyles();
      console.log('MathQuill styles added successfully');
    } catch (error) {
      console.error('Error adding MathQuill styles:', error);
    }
  }, []);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">MathQuill Test</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Test Math Field:
        </label>
        <div className="border p-2 rounded bg-gray-50">
          <EditableMathField
            latex="x^2 + 2x + 1 = 0"
            onChange={(mathField) => {
              console.log('Math field changed:', mathField.latex());
            }}
          />
        </div>
      </div>
      <p className="text-sm text-gray-600">
        If you can see and edit the equation above, MathQuill is working correctly.
      </p>
    </div>
  );
};

export default MathQuillTest;
