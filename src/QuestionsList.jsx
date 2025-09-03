import React from "react";
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

// Function to convert radical notation to exponential notation
const convertRadicalToExponential = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  let converted = text;
  
  // Convert Unicode radical symbols and math symbols to exponential form
  const conversions = [
    // Square roots: √x → x^(1/2)
    { pattern: /√(\d+)/g, replacement: '$1^{1/2}' },
    { pattern: /√([a-zA-Z]+)/g, replacement: '$1^{1/2}' },
    { pattern: /√\{([^}]+)\}/g, replacement: '($1)^{1/2}' },
    
    // Cube roots: ∛x → x^(1/3)
    { pattern: /∛(\d+)/g, replacement: '$1^{1/3}' },
    { pattern: /∛([a-zA-Z]+)/g, replacement: '$1^{1/3}' },
    
    // Fourth roots: ∜x → x^(1/4)
    { pattern: /∜(\d+)/g, replacement: '$1^{1/4}' },
    { pattern: /∜([a-zA-Z]+)/g, replacement: '$1^{1/4}' },
    
    // Keep existing superscripts but ensure consistent formatting
    { pattern: /²/g, replacement: '^2' },
    { pattern: /³/g, replacement: '^3' },
    { pattern: /⁴/g, replacement: '^4' },
    { pattern: /⁵/g, replacement: '^5' },
    
    // Keep existing subscripts
    { pattern: /₂/g, replacement: '_2' },
    { pattern: /₃/g, replacement: '_3' },
  ];
  
  conversions.forEach(({ pattern, replacement }) => {
    converted = converted.replace(pattern, replacement);
  });
  
  return converted;
};

const renderContent = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Check for math symbols
  const mathSymbols = /[√∛∜⁵²³⁴⁵₂₃π]|x²|x³|\^|\\_|log₂/;
  
  if (mathSymbols.test(text)) {
    // Convert radicals to exponential notation
    const converted = convertRadicalToExponential(text);
    
    try {
      // Try to render as math
      return <InlineMath math={converted} />;
    } catch (error) {
      // If math rendering fails, return the converted text
      return converted;
    }
  }
  
  return text;
};

const QuestionsList = ({ activeSection, examForm, removeQuestion, loadingRemoveQuestion }) => {
  const questions = Array.isArray(examForm[activeSection]?.questions)
    ? examForm[activeSection].questions
    : [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Questions
      </h2>

      {questions.length === 0 ? (
        <p className="text-gray-500 italic">No questions added yet.</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((q, index) => (
            <li
              key={q.id}
              className="p-4 border border-gray-200 rounded-lg flex justify-between items-start"
            >
              <div>
                <p className="font-medium">
                  {index + 1}. {renderContent(q.question)}
                </p>
                <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
                  {q.options.map((opt, i) => (
                    <li
                      key={i}
                      className={
                        i === q.correctAnswer ? "font-bold text-green-600" : ""
                      }
                    >
                      {String.fromCharCode(65 + i)}. {renderContent(opt)}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => removeQuestion(activeSection, q.id)}
                className="text-red-600 hover:text-red-800 flex items-center justify-center"
                disabled={loadingRemoveQuestion && loadingRemoveQuestion[q.id]}
              >
                {loadingRemoveQuestion && loadingRemoveQuestion[q.id] ? (
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Remove"
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuestionsList;
