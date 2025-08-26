// Example usage of MathMCQMaker component
// This file demonstrates how to integrate the enhanced math question creator

import React, { useState } from 'react';
import MathMCQMaker from './MathMCQMaker';

const ExampleMathQuestionCreator = () => {
  const [questions, setQuestions] = useState([]);
  const activeSection = 'math';

  // Function to handle adding new questions
  const addQuestion = (section, question) => {
    setQuestions(prev => [...prev, question]);
    console.log('New math question added:', question);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Math Question Creator Example</h1>
      
      <div className="mb-8">
        <MathMCQMaker 
          activeSection={activeSection}
          addQuestion={addQuestion}
        />
      </div>

      {/* Display created questions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Created Questions:</h2>
        {questions.length === 0 ? (
          <p className="text-gray-500">No questions created yet.</p>
        ) : (
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={q.id} className="border p-4 rounded-lg bg-gray-50">
                <h3 className="font-medium mb-2">Question {index + 1}:</h3>
                <p className="mb-2">{q.question}</p>
                <div className="ml-4">
                  {q.options.map((option, optIndex) => (
                    <div 
                      key={optIndex}
                      className={`mb-1 ${q.correctAnswer === optIndex ? 'font-bold text-green-600' : ''}`}
                    >
                      {String.fromCharCode(65 + optIndex)}. {option}
                      {q.correctAnswer === optIndex && ' ✓ (Correct)'}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExampleMathQuestionCreator;

/* 
Example of questions you can create with the enhanced MathMCQMaker:

1. Algebra Question:
   Question: "Solve for x: 2x² + 5x - 3 = 0"
   Options: 
   A. x = (-5 ± √49)/4
   B. x = (-5 ± √7)/4  
   C. x = (5 ± √49)/4
   D. x = (-5 ± √25)/4

2. Calculus Question:
   Question: "Find the derivative of f(x) = sin(x²)"
   Options:
   A. 2x cos(x²)
   B. cos(x²)
   C. 2x sin(x²)
   D. x cos(x²)

3. Geometry Question:
   Question: "In a right triangle, if one angle is 30°, what is the other acute angle?"
   Options:
   A. 30°
   B. 45°
   C. 60°
   D. 90°

4. Set Theory Question:
   Question: "If A = {1, 2, 3} and B = {2, 3, 4}, what is A ∩ B?"
   Options:
   A. {1, 2, 3, 4}
   B. {2, 3}
   C. {1, 4}
   D. ∅

The symbol palette makes it easy to create these types of questions with proper mathematical notation.
*/
