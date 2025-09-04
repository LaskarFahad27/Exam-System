import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

/**
 * Renders mathematical content using KaTeX
 * @param {string} text - The text containing math expressions
 * @param {boolean} block - Whether to render as a block (centered) or inline
 * @returns {React.ReactNode} Rendered math content
 */
export const renderMathContent = (text, block = false) => {
  if (!text || typeof text !== 'string') return text;
  
  // Handle special cases first
  if (text.includes("What") && text.includes("is") && text.includes("the") && text.includes("value") && text.includes("of")) {
    // This is likely a question that we should not process as pure LaTeX
    return renderMixedTextWithMath(text);
  }
  
  // Pre-process text to handle specific notations in exam questions
  let processedText = text;
  
  // Special processing for derivative notation d/dx
  if (processedText.includes('d/dx')) {
    // Special case for "d/dx(sin x³·cos x²)" - handle combined trig functions
    processedText = processedText.replace(/d\/dx\(sin\s*x([²³⁴⁵])·cos\s*x([²³⁴⁵])\)/g, 
      '\\frac{d}{dx}(\\sin x^$1 \\cdot \\cos x^$2)');
      
    // General d/dx cases
    processedText = processedText.replace(/d\/dx\(([^)]+)\)/g, '\\frac{d}{dx}($1)');
    processedText = processedText.replace(/d\/dx/g, '\\frac{d}{dx}');
  }
  
  // Handle superscripts with specific characters
  processedText = processedText
    .replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (match) => {
      return match
        .replace(/⁰/g, '^0')
        .replace(/¹/g, '^1')
        .replace(/²/g, '^2')
        .replace(/³/g, '^3')
        .replace(/⁴/g, '^4')
        .replace(/⁵/g, '^5')
        .replace(/⁶/g, '^6')
        .replace(/⁷/g, '^7')
        .replace(/⁸/g, '^8')
        .replace(/⁹/g, '^9');
    });
  
  // Handle explicit superscripts in x², x³, etc.
  processedText = processedText
    .replace(/x²/g, 'x^2')
    .replace(/x³/g, 'x^3')
    .replace(/x⁴/g, 'x^4')
    .replace(/x⁵/g, 'x^5');
  
  // Handle general superscripts
  processedText = processedText
    .replace(/(\w)([²³⁴⁵])/g, '$1^$2')
    .replace(/²/g, '2')
    .replace(/³/g, '3')
    .replace(/⁴/g, '4')
    .replace(/⁵/g, '5');
  
  // Handle subscripts
  processedText = processedText
    .replace(/([₀₁₂₃₄₅₆₇₈₉]+)/g, (match) => {
      return match
        .replace(/₀/g, '_0')
        .replace(/₁/g, '_1')
        .replace(/₂/g, '_2')
        .replace(/₃/g, '_3')
        .replace(/₄/g, '_4')
        .replace(/₅/g, '_5')
        .replace(/₆/g, '_6')
        .replace(/₇/g, '_7')
        .replace(/₈/g, '_8')
        .replace(/₉/g, '_9');
    });
  
  // Handle square roots and other mathematical symbols
  processedText = processedText
    .replace(/√([^(]+)/g, '\\sqrt{$1}')
    .replace(/√\(([^)]+)\)/g, '\\sqrt{$1}')
    .replace(/π/g, '\\pi')
    .replace(/·/g, '\\cdot');
  
  // Handle exponents for e
  processedText = processedText
    .replace(/e\^([^{(])/g, 'e^{$1}')
    .replace(/e\^\(([^)]+)\)/g, 'e^{$1}');
  
  // Handle aˣ, eˣ (superscript x for variables)
  processedText = processedText
    .replace(/([a-zA-Z])ˣ/g, '$1^x');
  
  // Handle fractions like 3/x³
  processedText = processedText
    .replace(/(\d+)\/([a-zA-Z])([²³⁴⁵])/g, '\\frac{$1}{$2^$3}')
    .replace(/(\d+)\/([a-zA-Z])/g, '\\frac{$1}{$2}');
  
  // Handle common trigonometric functions
  processedText = processedText
    .replace(/sin\s/g, '\\sin ')
    .replace(/cos\s/g, '\\cos ')
    .replace(/tan\s/g, '\\tan ')
    .replace(/sin([^a-zA-Z])/g, '\\sin$1')
    .replace(/cos([^a-zA-Z])/g, '\\cos$1')
    .replace(/tan([^a-zA-Z])/g, '\\tan$1')
    // Handle specific cases like 'sin x³·cos x²'
    .replace(/sin\s*x([²³⁴⁵])/g, '\\sin x^$1')
    .replace(/cos\s*x([²³⁴⁵])/g, '\\cos x^$1')
    .replace(/tan\s*x([²³⁴⁵])/g, '\\tan x^$1');
  
  // Handle logarithms
  processedText = processedText
    .replace(/log₂/g, '\\log_2')
    .replace(/ln\(/g, '\\ln(');
    
  try {
    // Render the processed text with KaTeX
    return block ? 
      <BlockMath math={processedText} /> : 
      <InlineMath math={processedText} />;
  } catch (error) {
    console.error('Math content processing error:', error, processedText);
    
    // If processing fails, try with minimal processing
    try {
      return block ? 
        <BlockMath math={text} /> : 
        <InlineMath math={text} />;
    } catch (secondError) {
      console.error('Fallback math rendering failed:', secondError);
      return text; // Return original text if all processing fails
    }
  }
};

/**
 * Determines if a string contains math expressions that need rendering
 * @param {string} text - The text to check
 * @returns {boolean} True if the text contains math expressions
 */
export const containsMathExpressions = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  // Regex to detect math symbols and expressions
  const mathSymbols = /[√∛∜⁵²³⁴⁵₂₃π]|x²|x³|e\^|d\/dx|\^|\/|\_|\\frac|\\sqrt|tan|sin|cos|log|ln/;
  
  return mathSymbols.test(text);
};

/**
 * Renders question text with embedded math expressions by separating text and math parts
 * @param {string} text - Question text that contains math expressions
 * @returns {React.ReactNode} Rendered content with properly formatted text and math
 */
const renderMixedTextWithMath = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // First, try to identify common question patterns
  const questionPatterns = [
    // "What is the value of d/dx(...)" pattern
    {
      regex: /(What\s+is\s+the\s+value\s+of\s+)(d\/dx\([^)]+\))/i,
      process: (match, textPart, mathPart) => {
        return (
          <>
            {textPart} <InlineMath math={mathPart} />
          </>
        );
      }
    },
    // "Find the derivative of..." pattern
    {
      regex: /(Find\s+the\s+derivative\s+of\s+)([^?.]+)/i,
      process: (match, textPart, mathPart) => {
        return (
          <>
            {textPart} <InlineMath math={mathPart} />
          </>
        );
      }
    },
    // General pattern for sentences ending with math expressions
    {
      regex: /([^.?!]+)(\s+)([^.?!]+\S*\^.+|\S*√.+|d\/dx.+)([.?!]*)$/,
      process: (match, textPart, space, mathPart, punctuation) => {
        return (
          <>
            {textPart}{space}<InlineMath math={mathPart} />{punctuation}
          </>
        );
      }
    }
  ];

  // Try each pattern
  for (const pattern of questionPatterns) {
    const match = text.match(pattern.regex);
    if (match) {
      return pattern.process(...match);
    }
  }
  
  // If no pattern matched, we'll try to identify math segments in the text
  // Identify common math expressions that need special rendering
  const mathPatterns = [
    /d\/dx\([^)]+\)/g,        // Derivatives
    /sin\s*x[²³⁴⁵]/g,         // sin with superscripts
    /cos\s*x[²³⁴⁵]/g,         // cos with superscripts
    /e\^\([^)]+\)/g,          // e^(...)
    /e\^x/g,                  // e^x
    /\\sqrt\{[^}]+\}/g,       // Square roots
    /\b[a-z]\^[0-9]+\b/g      // Simple powers like x^2
  ];
  
  // Create an array of text and math segments
  let segments = [text];
  
  // Split by each pattern
  mathPatterns.forEach(pattern => {
    let newSegments = [];
    
    segments.forEach(segment => {
      if (typeof segment === 'string') {
        const parts = segment.split(pattern);
        const matches = segment.match(pattern) || [];
        
        for (let i = 0; i < parts.length; i++) {
          if (parts[i]) newSegments.push(parts[i]);
          if (i < matches.length) newSegments.push(<InlineMath key={`math-${i}`} math={matches[i]} />);
        }
      } else {
        newSegments.push(segment);
      }
    });
    
    segments = newSegments;
  });
  
  return <>{segments}</>;
};

/**
 * Renders content with math expressions if needed
 * @param {string} text - The text that may contain math expressions
 * @returns {React.ReactNode} Rendered content
 */
export const renderContent = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // For explicit LaTeX notation, render it directly
  if (text.includes('\\frac') || text.includes('\\sqrt') || text.includes('\\cdot')) {
    try {
      return <InlineMath math={text} />;
    } catch (error) {
      console.error('Error rendering explicit LaTeX:', error);
      // Continue with normal processing if direct rendering fails
    }
  }
  
  // If text has [math] tags, extract and render only the math part
  if (text.includes('[math]') && text.includes('[/math]')) {
    const mathRegex = /\[math\](.*?)\[\/math\]/;
    const matches = text.match(mathRegex);
    
    if (matches && matches[1]) {
      return renderMathContent(matches[1]);
    }
  }
  
  // If the text looks like a sentence with math (contains spaces and math expressions)
  if (containsMathExpressions(text) && text.includes(' ')) {
    return renderMixedTextWithMath(text);
  }
  
  // For pure math expressions without spaces
  if (containsMathExpressions(text) && !text.includes(' ')) {
    return renderMathContent(text);
  }
  
  // If no math expressions found, return the original text
  return text;
};
