import React from 'react';
import { EditableMathField } from '../src/components/MathLiveWrapper';

// Test component to verify MathLive is working
const MathQuillTest = () => {

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
        If you can see and edit the equation above, MathLive is working correctly.
      </p>
    </div>
  );
};

export default MathQuillTest;
