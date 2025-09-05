import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

/**
 * Ensures braces in LaTeX expressions are properly balanced
 * @param {string} text - LaTeX expression to process
 * @returns {string} Processed LaTeX with balanced braces
 */
const balanceBraces = (text) => {
  if (!text) return text;
  
  // Count opening and closing braces
  let openBraces = 0;
  let closeBraces = 0;
  
  for (const char of text) {
    if (char === '{') openBraces++;
    if (char === '}') closeBraces++;
  }
  
  // Add missing closing braces
  let result = text;
  for (let i = 0; i < (openBraces - closeBraces); i++) {
    result += '}';
  }
  
  // Add missing opening braces (at the beginning)
  if (closeBraces > openBraces) {
    let prefix = '';
    for (let i = 0; i < (closeBraces - openBraces); i++) {
      prefix += '{';
    }
    result = prefix + result;
  }
  
  return result;
};

/**
 * Renders mathematical content using KaTeX
 * @param {string} text - The text containing math expressions
 * @param {boolean} block - Whether to render as a block (centered) or inline
 * @returns {React.ReactNode} Rendered math content
 */
export const renderMathContent = (text, block = false) => {
  if (!text || typeof text !== 'string') return text;
  
  // Handle special domain of function cases
  if (text.includes("domain of the function") && text.includes("$")) {
    return renderMixedTextWithMath(text);
  }
  
  // Handle special question cases 
  if ((text.includes("What") && text.includes("is") && text.includes("the") && 
       (text.includes("value") || text.includes("domain"))) || 
      text.includes("Find the")) {
    // This is likely a question that we should not process as pure LaTeX
    return renderMixedTextWithMath(text);
  }
  
  // Special case for complex fractions with square roots like in the example
  if (text.includes("\\frac") && text.includes("\\sqrt")) {
    // Render directly if it's pure LaTeX
    try {
      // Ensure proper formatting of the LaTeX expression
      const cleanedText = text
        .replace(/\\frac([^{])/g, '\\frac{$1}') // Add braces for single character numerators
        .replace(/\\frac\{([^}]+)\}([^{])/g, '\\frac{$1}{$2}') // Add braces for single character denominators
        .replace(/\\sqrt([^{])/g, '\\sqrt{$1}'); // Add braces for single character sqrt arguments
      
      return block ? <BlockMath math={cleanedText} /> : <InlineMath math={cleanedText} />;
    } catch (error) {
      console.error('Complex fraction rendering failed:', error);
      // Continue with regular processing
    }
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
  
  // Check for dollar sign LaTeX notation
  if (text.includes('$') && text.split('$').length > 2) {
    return true;
  }
  
  // Check for [math] tags
  if (text.includes('[math]') && text.includes('[/math]')) {
    return true;
  }
  
  // Check for common LaTeX commands
  if (text.includes('\\frac') || 
      text.includes('\\sqrt') || 
      text.includes('\\cdot') ||
      text.includes('\\pi') ||
      text.includes('\\sin') ||
      text.includes('\\cos') ||
      text.includes('\\tan')) {
    return true;
  }
  
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
  
  // Special handling for function inverse problems
  if (text.includes("inverse of the function") && text.includes("\\frac")) {
    // Try to match the pattern for inverse function questions with fractions
    const inversePattern = /What\s+is\s+the\s+inverse\s+of\s+the\s+function\s+(?:\$)?f\(x\)\s*=\s*\\frac\{([^{}]+)\}\{([^{}]+)\}(?:\$)?/i;
    const match = text.match(inversePattern);
    
    if (match) {
      try {
        return (
          <>
            What is the inverse of the function <InlineMath math={"f(x)=\\frac{" + match[1] + "}{" + match[2] + "}"} />?
          </>
        );
      } catch (error) {
        console.error('Inverse function rendering failed:', error);
        // Continue with regular pattern matching
      }
    }
  }
  
  // Special handling for domain of function with R(x)
  if (text.includes("domain of the function") && text.includes("R(x)")) {
    // Try to match the specific pattern from your example
    const domainPattern = /What\s+is\s+the\s+domain\s+of\s+the\s+function\s+(?:\$)?R\(x\)\s*=\s*\\frac\{\\sqrt\{([^}]+)\}\}\{([^}]+)\}(?:\$)?/i;
    const match = text.match(domainPattern);
    
    if (match) {
      try {
        return (
          <>
            What is the domain of the function <InlineMath math={"R(x) = \\frac{\\sqrt{" + match[1] + "}}{" + match[2] + "}"} />?
          </>
        );
      } catch (error) {
        console.error('Special domain function rendering failed:', error);
        // Continue with regular pattern matching
      }
    }
  }
  
  // First, try to identify common question patterns
  const questionPatterns = [
    // "What is the inverse of the function..." pattern (for fraction expressions)
    {
      regex: /(What\s+is\s+the\s+inverse\s+of\s+the\s+function\s+)(\$f\(x\)\s*=\s*\\frac\{[^{}]+\}\{[^{}]+\}\$)/i,
      process: (match, textPart, mathPart) => {
        // Extract the math content from within the dollar signs
        const mathContent = mathPart.slice(1, -1);
        return (
          <>
            {textPart} <InlineMath math={mathContent} />?
          </>
        );
      }
    },
    // "What is the domain of the function..." pattern (for complex fraction expressions)
    {
      regex: /(What\s+is\s+the\s+domain\s+of\s+the\s+function\s+)(\$[^$]+\$)/i,
      process: (match, textPart, mathPart) => {
        // Extract the math content from within the dollar signs
        const mathContent = mathPart.slice(1, -1);
        return (
          <>
            {textPart} <InlineMath math={mathContent} />
          </>
        );
      }
    },
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
    /\\frac\{[^{}]+\}\{[^{}]+\}/g, // Fractions
    /\b[a-z]\^[0-9]+\b/g,      // Simple powers like x^2
    /[<>]=?/g                // Inequality signs
  ];
  
  // Special handling for domain of function questions like the example you provided
  if (text.toLowerCase().includes("domain of the function") && text.includes("$")) {
    // Try to extract and render the LaTeX part directly
    const dollarSignMatch = text.match(/\$(.*?)\$/);
    if (dollarSignMatch && dollarSignMatch[1]) {
      const beforeMath = text.substring(0, text.indexOf('$'));
      const mathPart = dollarSignMatch[1];
      const afterMath = text.substring(text.indexOf('$', text.indexOf('$') + 1) + 1);
      
      try {
        return (
          <>
            {beforeMath}
            <InlineMath math={mathPart} />
            {afterMath}
          </>
        );
      } catch (error) {
        console.error('Special domain question rendering failed:', error);
        // Fall through to regular processing
      }
    }
  }
  
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
 * Helper function to debug complex math expressions
 * @param {string} text - The original text
 * @param {string} operation - The operation being performed
 * @param {string} processedText - The processed text
 */
const debugMathExpression = (text, operation, processedText) => {
  // Only log for certain complex expressions to avoid console spam
  if (text.includes('\\frac') && text.includes('\\sqrt')) {
    console.log(`Math Rendering (${operation}):`, {
      original: text,
      processed: processedText
    });
  }
};

/**
 * Processes text with potential inequality expressions
 * @param {string} text - The text to process
 * @returns {React.ReactNode} Processed content with rendered inequalities
 */
export const processInequalities = (text) => {
  if (!text) return text;
  
  // Check if the text contains both inequalities and math expressions
  if ((text.includes('<') || text.includes('>') || 
       text.includes('\\leq') || text.includes('\\geq')) && 
      (text.includes('\\frac') || text.includes('^') || text.includes('\\sqrt'))) {
    
    // For expressions like $x < \frac{5}{2}$
    const dollarWrappedPattern = /\$(.*?)\$/g;
    const matches = text.match(dollarWrappedPattern);
    
    if (matches) {
      // Split the text into parts
      const parts = text.split(dollarWrappedPattern);
      
      // Create an array to hold the processed parts
      const processedParts = [];
      
      // Add the first text part
      if (parts[0]) processedParts.push(parts[0]);
      
      // Process each matched math expression and text part
      for (let i = 0; i < matches.length; i++) {
        // Add the math expression (remove the dollar signs)
        const mathExpr = matches[i].slice(1, -1);
        processedParts.push({ type: 'math', content: mathExpr });
        
        // Add the next text part if it exists
        if (parts[i + 1]) processedParts.push(parts[i + 1]);
      }
      
      return processedParts;
    }
  }
  
  return text;
};

/**
 * Process word problems containing fractions
 * @param {string} text - The text to process
 * @returns {React.ReactNode} Processed content with fractions properly rendered
 */
export const processWordProblemWithFractions = (text) => {
  if (!text) return text;
  
  // Check if it's a word problem with fractions
  if ((text.includes('football') || text.includes('basketball') || 
       text.includes('game') || text.includes('wins') ||
       text.includes('ratio') || text.includes('fraction') ||
       text.includes('percentage') || text.includes('probability')) && 
      (text.includes('\\frac') || text.includes('/'))) {
    
    // For dollar-sign wrapped fractions
    const dollarWrappedPattern = /\$(.*?)\$/g;
    const matches = text.match(dollarWrappedPattern);
    
    if (matches) {
      // Split the text into parts
      const parts = text.split(dollarWrappedPattern);
      
      // Create an array to hold the processed parts
      const processedParts = [];
      
      // Add the first text part
      if (parts[0]) processedParts.push(parts[0]);
      
      // Process each matched math expression and text part
      for (let i = 0; i < matches.length; i++) {
        // Add the math expression (remove the dollar signs)
        const mathExpr = matches[i].slice(1, -1);
        processedParts.push({ type: 'math', content: mathExpr });
        
        // Add the next text part if it exists
        if (parts[i + 1]) processedParts.push(parts[i + 1]);
      }
      
      return processedParts;
    }
    
    // For expressions with simple fractions not in dollar signs (like 3/4)
    const simplePattern = /(\d+)\/(\d+)/g;
    if (text.match(simplePattern)) {
      // Split by the simple fraction pattern
      const parts = text.split(simplePattern);
      const matches = text.match(simplePattern) || [];
      
      if (matches.length > 0) {
        const processedParts = [];
        
        // Add the first part
        if (parts[0]) processedParts.push(parts[0]);
        
        // Add alternating fractions and text parts
        let matchIndex = 0;
        for (let i = 1; i < parts.length; i += 3) { // Skip groups of 3 for regex capture groups
          // Add the fraction
          const fraction = matches[matchIndex];
          if (fraction) {
            const [numerator, denominator] = fraction.split('/');
            processedParts.push({ type: 'math', content: `\\frac{${numerator}}{${denominator}}` });
            matchIndex++;
          }
          
          // Add the next text part
          if (i + 2 < parts.length && parts[i + 2]) {
            processedParts.push(parts[i + 2]);
          }
        }
        
        return processedParts;
      }
    }
  }
  
  return text;
};

/**
 * Process mixed mathematical expressions (equations, inequalities, etc.)
 * @param {string} text - The text to process
 * @returns {React.ReactNode} Processed content with mixed expressions properly rendered
 */
export const processMixedExpressions = (text) => {
  if (!text) return text;
  
  // Check for conditional expressions like "If... then..."
  if ((text.includes('If ') || text.includes('if ')) && 
      (text.includes('then ') || text.includes('what is '))) {
    
    // For dollar-sign wrapped expressions
    const dollarWrappedPattern = /\$(.*?)\$/g;
    const matches = text.match(dollarWrappedPattern);
    
    if (matches) {
      // Split the text into parts
      const parts = text.split(dollarWrappedPattern);
      
      // Create an array to hold the processed parts
      const processedParts = [];
      
      // Add the first text part
      if (parts[0]) processedParts.push(parts[0]);
      
      // Process each matched math expression and text part
      for (let i = 0; i < matches.length; i++) {
        // Add the math expression (remove the dollar signs)
        const mathExpr = matches[i].slice(1, -1);
        processedParts.push({ type: 'math', content: mathExpr });
        
        // Add the next text part if it exists
        if (parts[i + 1]) processedParts.push(parts[i + 1]);
      }
      
      return processedParts;
    }
  }
  
  // Check for combined expressions (equations + inequalities)
  if ((text.includes('=') && 
      (text.includes('<') || text.includes('>') || 
       text.includes('\\leq') || text.includes('\\geq'))) ||
       text.includes('\\equiv')) {
    
    // For dollar-sign wrapped expressions
    const dollarWrappedPattern = /\$(.*?)\$/g;
    const matches = text.match(dollarWrappedPattern);
    
    if (matches) {
      // Similar processing as above
      const parts = text.split(dollarWrappedPattern);
      const processedParts = [];
      
      if (parts[0]) processedParts.push(parts[0]);
      
      for (let i = 0; i < matches.length; i++) {
        const mathExpr = matches[i].slice(1, -1);
        processedParts.push({ type: 'math', content: mathExpr });
        
        if (parts[i + 1]) processedParts.push(parts[i + 1]);
      }
      
      return processedParts;
    }
  }
  
  return text;
};

/**
 * Renders content with math expressions if needed
 * @param {string} text - The text that may contain math expressions
 * @returns {React.ReactNode} Rendered content
 */
export const renderContent = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Process inequalities first
  const processedInequalities = processInequalities(text);
  
  // If the text was processed as an inequality, render it accordingly
  if (Array.isArray(processedInequalities)) {
    return (
      <React.Fragment>
        {processedInequalities.map((part, index) => {
          if (typeof part === 'string') {
            return <React.Fragment key={index}>{part}</React.Fragment>;
          } else if (part.type === 'math') {
            return <InlineMath key={index} math={part.content} />;
          }
          return null;
        })}
      </React.Fragment>
    );
  }
  
  // Process word problems with fractions
  const processedWordProblem = processWordProblemWithFractions(text);
  
  // If the text was processed as a word problem, render it accordingly
  if (Array.isArray(processedWordProblem)) {
    return (
      <React.Fragment>
        {processedWordProblem.map((part, index) => {
          if (typeof part === 'string') {
            return <React.Fragment key={index}>{part}</React.Fragment>;
          } else if (part.type === 'math') {
            return <InlineMath key={index} math={part.content} />;
          }
          return null;
        })}
      </React.Fragment>
    );
  }
  
  // Process mixed expressions (equations, inequalities, etc.)
  const processedMixedExpr = processMixedExpressions(text);
  
  // If the text was processed as a mixed expression, render it accordingly
  if (Array.isArray(processedMixedExpr)) {
    return (
      <React.Fragment>
        {processedMixedExpr.map((part, index) => {
          if (typeof part === 'string') {
            return <React.Fragment key={index}>{part}</React.Fragment>;
          } else if (part.type === 'math') {
            return <InlineMath key={index} math={part.content} />;
          }
          return null;
        })}
      </React.Fragment>
    );
  }
  
  // For explicit LaTeX notation, render it directly
  if (text.includes('\\frac') || text.includes('\\sqrt') || text.includes('\\cdot')) {
    try {
      return <InlineMath math={text} />;
    } catch (error) {
      console.error('Error rendering explicit LaTeX:', error);
      // Continue with normal processing if direct rendering fails
    }
  }
  
  // Special case for MCQ options with just a fraction in dollar signs
  if (text.match(/^\$\\frac\{[^{}]+\}\{[^{}]+\}\$$/)) {
    try {
      const mathContent = text.slice(1, -1); // Remove the dollar signs
      return <InlineMath math={mathContent} />;
    } catch (error) {
      console.error('Error rendering pure fraction:', error);
      // Continue with normal processing
    }
  }

  // Check for dollar sign LaTeX notation: $...$ for inline math
  if (text.includes('$') && text.split('$').length > 2) {
    try {
      // Special case for fractions inside dollar signs
      if (text.includes('\\frac')) {
        // Try to extract just the fraction part for better rendering
        const fracPattern = /\$([^$]*\\frac\{[^{}]+\}\{[^{}]+\}[^$]*)\$/;
        const fracMatch = text.match(fracPattern);
        
        if (fracMatch) {
          // If we have text before or after the dollar signs
          const beforeDollar = text.substring(0, text.indexOf('$'));
          const afterDollar = text.substring(text.lastIndexOf('$') + 1);
          
          // Return the text with the properly rendered fraction
          return (
            <>
              {beforeDollar}<InlineMath math={fracMatch[1]} />{afterDollar}
            </>
          );
        }
      }
      
      // Split the text by $ delimiter to separate math and regular text
      const parts = text.split(/(\$[^$]*?[^\\]\$|\$\$)/g).filter(Boolean);
      
      // Map each part to either text or math component
      return (
        <>
          {parts.map((part, idx) => {
            if (part.startsWith('$') && part.endsWith('$')) {
              // Handle the math content inside dollar signs
              let mathContent = part.slice(1, -1); // Remove $ symbols
              
              // Pre-process specific LaTeX patterns for better rendering
              if (mathContent.includes('\\frac') || mathContent.includes('/')) {
                mathContent = mathContent
                  // Convert simple fractions like a/b to \frac{a}{b}
                  .replace(/([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)/g, '\\frac{$1}{$2}');
                
                // Fix common issues with fractions
                mathContent = mathContent
                  .replace(/\\frac([^{])/g, '\\frac{$1}') // Add braces for single character numerators
                  .replace(/\\frac\{([^}]+)\}([^{])/g, '\\frac{$1}{$2}'); // Add braces for single character denominators
              }
              
              // Handle square roots with \sqrt command
              if (mathContent.includes('\\sqrt')) {
                mathContent = mathContent
                  // Ensure proper bracing for sqrt arguments
                  .replace(/\\sqrt\s*([a-zA-Z0-9]+)/g, '\\sqrt{$1}');
              }

              // Handle nested expressions in fractions and square roots
              if (mathContent.includes('{') && mathContent.includes('}')) {
                // Make sure nested expressions have proper LaTeX formatting
                mathContent = balanceBraces(mathContent);
              }
              
              return <InlineMath key={idx} math={mathContent} />;
            }
            return part;
          })}
        </>
      );
    } catch (error) {
      console.error('Error rendering dollar sign LaTeX:', error, text);
      // If complex processing fails, try a simpler approach
      try {
        // Simpler approach for dollar sign notation
        const parts = text.split('$');
        if (parts.length >= 3) {
          return (
            <>
              {parts[0]}
              <InlineMath math={parts[1]} />
              {parts.slice(2).join('$')}
            </>
          );
        }
      } catch (secondError) {
        console.error('Fallback dollar sign rendering failed:', secondError);
      }
      // Continue with normal processing if dollar notation rendering fails
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
