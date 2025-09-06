import React from "react";
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

// Function to convert ALL radical notation to exponential notation (no radicals allowed)
const convertRadicalToExponential = (latex) => {
  if (!latex || typeof latex !== 'string') return latex;
  
  let converted = latex;
  
  // First, convert Unicode radical symbols to LaTeX format
  const unicodeConversions = [
    // Unicode radical symbols to LaTeX
    { pattern: /√/g, replacement: '\\sqrt{}' },
    { pattern: /∛/g, replacement: '\\sqrt[3]{}' },
    { pattern: /∜/g, replacement: '\\sqrt[4]{}' },
    { pattern: /⁵√/g, replacement: '\\sqrt[5]{}' },
    { pattern: /ⁿ√/g, replacement: '\\sqrt[n]{}' },
  ];
  
  // Apply Unicode conversions
  unicodeConversions.forEach(({ pattern, replacement }) => {
    converted = converted.replace(pattern, replacement);
  });
  
  // Handle cases where content follows immediately after the radical symbol
  // √144 → \\sqrt{144}
  converted = converted.replace(/\\sqrt\{\}(\d+)/g, '\\sqrt{$1}');
  converted = converted.replace(/\\sqrt\{\}([a-zA-Z]+)/g, '\\sqrt{$1}');
  converted = converted.replace(/\\sqrt\{\}([a-zA-Z0-9]+)/g, '\\sqrt{$1}');
  
  // Convert ALL radical patterns to exponential form (strict exponential-only policy)
  const conversions = [
    // Simple square roots: √x → x^(1/2), \\sqrt{x} → x^(1/2)
    { pattern: /\\sqrt\{([^{}]+)\}/g, replacement: '($1)^{1/2}' },
    { pattern: /\\sqrt\{([^{}]*)\}([a-zA-Z0-9]+)/g, replacement: '($2)^{1/2}' },
    
    // Cube roots: ∛x → x^(1/3), \\sqrt[3]{x} → x^(1/3)
    { pattern: /\\sqrt\[3\]\{([^{}]+)\}/g, replacement: '($1)^{1/3}' },
    { pattern: /\\sqrt\[3\]\{([^{}]*)\}([a-zA-Z0-9]+)/g, replacement: '($2)^{1/3}' },
    
    // Fourth roots: ∜x → x^(1/4), \\sqrt[4]{x} → x^(1/4)
    { pattern: /\\sqrt\[4\]\{([^{}]+)\}/g, replacement: '($1)^{1/4}' },
    { pattern: /\\sqrt\[4\]\{([^{}]*)\}([a-zA-Z0-9]+)/g, replacement: '($2)^{1/4}' },
    
    // Fifth roots: ⁵√x → x^(1/5), \\sqrt[5]{x} → x^(1/5)
    { pattern: /\\sqrt\[5\]\{([^{}]+)\}/g, replacement: '($1)^{1/5}' },
    { pattern: /\\sqrt\[5\]\{([^{}]*)\}([a-zA-Z0-9]+)/g, replacement: '($2)^{1/5}' },
    
    // General nth roots: ⁿ√x → x^(1/n), \\sqrt[n]{x} → x^(1/n)
    { pattern: /\\sqrt\[([^[\]]+)\]\{([^{}]+)\}/g, replacement: '($2)^{1/$1}' },
    { pattern: /\\sqrt\[([^[\]]+)\]\{([^{}]*)\}([a-zA-Z0-9]+)/g, replacement: '($3)^{1/$1}' },
    
    // Handle any remaining \\sqrt commands (fallback to square root)
    { pattern: /\\sqrt\{([^{}]+)\}/g, replacement: '($1)^{1/2}' },
    { pattern: /\\sqrt([a-zA-Z0-9]+)/g, replacement: '$1^{1/2}' },
    
    // Clean up double parentheses for simple variables and numbers
    { pattern: /\(([a-zA-Z])\)\^/g, replacement: '$1^' },
    { pattern: /\(([0-9]+)\)\^/g, replacement: '$1^' },
    { pattern: /\(([a-zA-Z][0-9]*)\)\^/g, replacement: '$1^' },
    
    // Clean up unnecessary parentheses in simple fractions
    { pattern: /\^{1\/([0-9]+)}/g, replacement: '^{1/$1}' },
  ];
  
  // Apply conversions sequentially
  conversions.forEach(({ pattern, replacement }) => {
    converted = converted.replace(pattern, replacement);
  });
  
  return converted;
};

const renderMathContent = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Pre-process the entire text to convert any radical symbols to exponential notation
  let processedText = convertRadicalToExponential(text);
  
  // Check if text contains math content wrapped in [math] tags
  if (processedText.includes('[math]')) {
    // Split the text by [math] and [/math] tags
    const parts = processedText.split(/(\[math\].*?\[\/math\])/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('[math]') && part.endsWith('[/math]')) {
        // Extract the LaTeX content
        let latex = part.replace('[math]', '').replace('[/math]', '');
        
        // Apply additional exponential conversion (in case there are nested radicals)
        latex = convertRadicalToExponential(latex);
        
        try {
          return (
            <InlineMath key={index} math={latex} />
          );
        } catch (error) {
          console.error('KaTeX rendering error:', error);
          // Fallback to plain text if KaTeX fails
          return <span key={index} className="text-red-500 text-sm">Math: {latex}</span>;
        }
      }
      return part;
    });
  } else {
    // Check if there are any math symbols that need rendering (outside of [math] tags)
    const mathSymbols = /[√∛∜⁵²³⁴⁵₂₃π]|x²|x³|\^|\\_|log₂|\\\w+/;
    
    if (mathSymbols.test(processedText)) {
      try {
        // Render the entire processed text as math
        return <InlineMath math={processedText} />;
      } catch (error) {
        console.error('KaTeX rendering error for full text:', error);
        // Return the processed text (with exponential notation) as plain text
        return processedText;
      }
    }
    
    // Return processed text (with any radical symbols converted to exponential)
    return processedText;
  }
};

const MathQuestionsList = ({ activeSection, examForm, removeQuestion, loadingRemoveQuestion }) => {
  const questions = Array.isArray(examForm[activeSection]?.questions)
    ? examForm[activeSection].questions
    : [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Questions
        <span className="text-sm text-gray-500 ml-2">(Exponential Notation)</span>
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
              <div className="w-full pr-8">
                <p className="font-medium">
                  {index + 1}. {renderMathContent(q.question)}
                </p>
                <ul className="list-disc list-inside ml-4 text-sm text-gray-600 mt-2">
                  {q.options.map((opt, i) => (
                    <li
                      key={i}
                      className={
                        q.correctAnswer === i || q.correctAnswer === opt 
                          ? "font-bold text-green-600" 
                          : ""
                      }
                    >
                      {String.fromCharCode(65 + i)}. {renderMathContent(opt)}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => removeQuestion(activeSection, q.id)}
                className="text-red-600 hover:text-red-800 flex-shrink-0 flex items-center justify-center"
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

export default MathQuestionsList;
