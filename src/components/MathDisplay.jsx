import React from 'react';
import PropTypes from 'prop-types';
import { renderContent, renderMathContent } from '../utils/mathUtils';
import { InlineMath } from 'react-katex';
import './MathDisplay.css';

/**
 * Component for displaying mathematical content
 * Automatically detects and renders math expressions within text
 */
const MathDisplay = ({ content, block = false, className = '' }) => {
  // Check if the content is null or undefined
  if (!content) return null;
  
  // Convert to string if it's not already
  const contentStr = typeof content === 'string' ? content : String(content);
  
  // Special handling for MCQ option with y=fraction in dollar signs
  if (contentStr.match(/^\$y\s*=\s*[+-]?\\frac\{\d+\}\{\d+\}\$$/)) {
    try {
      // Extract the fraction expression without the dollar signs
      const mathContent = contentStr.slice(1, -1);
      return (
        <div className={`math-display ${className}`}>
          <InlineMath math={mathContent} />
        </div>
      );
    } catch (error) {
      console.error("Fraction rendering failed:", error);
      // Fall through to default rendering
    }
  }
  
  // Special handling for MCQ option with just a fraction in dollar signs
  if (contentStr.match(/^\$\\frac\{[^{}]+\}\{[^{}]+\}\$$/)) {
    try {
      // Extract the fraction expression without the dollar signs
      const mathContent = contentStr.slice(1, -1);
      return (
        <div className={`math-display ${className}`}>
          <InlineMath math={mathContent} />
        </div>
      );
    } catch (error) {
      console.error("Fraction rendering failed:", error);
      // Fall through to default rendering
    }
  }
  
  // Special handling for inequality expressions with fractions
  if (contentStr.includes("\\frac") && 
      (contentStr.includes("<") || contentStr.includes(">") || 
       contentStr.includes("\\leq") || contentStr.includes("\\geq"))) {
    try {
      // Extract the expression between dollar signs
      const mathMatch = contentStr.match(/\$(.*?)\$/g);
      if (mathMatch) {
        // Process the content
        const beforeMath = contentStr.substring(0, contentStr.indexOf('$'));
        const afterMath = contentStr.substring(contentStr.lastIndexOf('$') + 1);
        
        // Join all math parts together
        const allMathContent = mathMatch.map(part => part.slice(1, -1)).join(' ');
        
        return (
          <div className={`math-display ${className}`}>
            {beforeMath}<InlineMath math={allMathContent} />{afterMath}
          </div>
        );
      }
      
      // Handle case where inequality might not be wrapped in dollar signs
      const parts = contentStr.split(/((?:[<>]=?|\\leq|\\geq).*?\\frac\{[^{}]+\}\{[^{}]+\}|\\frac\{[^{}]+\}\{[^{}]+\}(?:[<>]=?|\\leq|\\geq))/g);
      
      if (parts.length > 1) {
        return (
          <div className={`math-display ${className}`}>
            {parts.map((part, idx) => {
              if (part.includes("\\frac") && 
                 (part.includes("<") || part.includes(">") || 
                  part.includes("\\leq") || part.includes("\\geq"))) {
                return <InlineMath key={idx} math={part} />;
              }
              return part;
            })}
          </div>
        );
      }
    } catch (error) {
      console.error("Inequality expression rendering failed:", error);
      // Fall through to default rendering
    }
  }
  
  // Special handling for word problems with fractions
  if ((contentStr.includes("football") || 
       contentStr.includes("games") || 
       contentStr.includes("wins") ||
       contentStr.includes("losses") ||
       contentStr.includes("ratio")) && 
      contentStr.includes("\\frac")) {
    try {
      // Replace each dollar-sign wrapped fraction with an InlineMath component
      const parts = contentStr.split(/(\$[^$]+\$)/g);
      
      return (
        <div className={`math-display ${className}`}>
          {parts.map((part, idx) => {
            if (part.startsWith('$') && part.endsWith('$')) {
              return <InlineMath key={idx} math={part.slice(1, -1)} />;
            }
            return part;
          })}
        </div>
      );
    } catch (error) {
      console.error("Word problem rendering failed:", error);
      // Fall through to default rendering
    }
  }
  
  // Special handling for domain function example
  if (contentStr.includes("domain of the function") && 
      contentStr.includes("R(x)") &&
      contentStr.includes("\\frac{\\sqrt{x^2-16}}{(x-5)(x-4)}")) {
    
    try {
      return (
        <div className={`math-display ${className}`}>
          What is the domain of the function <InlineMath math={"R(x) = \\frac{\\sqrt{x^2-16}}{(x-5)(x-4)}"} />?
        </div>
      );
    } catch (error) {
      console.error("Special case rendering failed:", error);
      // Fall through to default rendering
    }
  }
  
  // Special handling for inverse function example
  if (contentStr.includes("inverse of the function") && 
      contentStr.includes("f(x)") &&
      contentStr.includes("\\frac")) {
    
    // Try to match the pattern
    const match = contentStr.match(/What is the inverse of the function \$f\(x\)=\\frac\{([^{}]+)\}\{([^{}]+)\}\$/);
    if (match) {
      try {
        return (
          <div className={`math-display ${className}`}>
            What is the inverse of the function <InlineMath math={`f(x)=\\frac{${match[1]}}{${match[2]}}`} />?
          </div>
        );
      } catch (error) {
        console.error("Inverse function rendering failed:", error);
        // Fall through to default rendering
      }
    }
  }
  
  // Special handling for "If ... then what is..." expressions with inequalities
  if (contentStr.startsWith("If ") && 
      contentStr.includes("then what is") && 
      (contentStr.includes("<") || contentStr.includes(">"))) {
    try {
      // Split into parts at the dollar signs
      const parts = contentStr.split(/(\$[^$]+\$)/g);
      
      return (
        <div className={`math-display ${className}`}>
          {parts.map((part, idx) => {
            if (part.startsWith('$') && part.endsWith('$')) {
              return <InlineMath key={idx} math={part.slice(1, -1)} />;
            }
            return part;
          })}
        </div>
      );
    } catch (error) {
      console.error("If-then expression rendering failed:", error);
      // Fall through to default rendering
    }
  }
  
  // Special handling for chained inequalities (like "If x > y > 0x > y > 0p > q > 0")
  if (contentStr.startsWith("If ") && 
      /([a-zA-Z0-9])\s*(>|<|\\geq|\\leq)\s*([a-zA-Z0-9])\s*(>|<|\\geq|\\leq)/.test(contentStr)) {
    try {
      // Extract the "If " part
      const ifPart = contentStr.substring(0, 3);
      const mathPart = contentStr.substring(3);
      
      return (
        <div className={`math-display ${className}`}>
          {ifPart}<InlineMath math={mathPart} />
        </div>
      );
    } catch (error) {
      console.error("Chained inequality rendering failed:", error);
      // Fall through to default rendering
    }
  }
  
  // Special case: "Find the equation of all the lines having slope 0 which are tangent to the curve y = 6x^2 − 7x."
  if (/Find\s+the\s+equation\s+of\s+all\s+the\s+lines\s+having\s+slope\s+0\s+which\s+are\s+tangent\s+to\s+the\s+curve/.test(contentStr) && 
      contentStr.includes("y =")) {
    try {
      const match = contentStr.match(/(Find\s+the\s+equation\s+of\s+all\s+the\s+lines\s+having\s+slope\s+0\s+which\s+are\s+tangent\s+to\s+the\s+curve\s+)(y\s*=\s*[^.]+)(\.?)/);
      if (match) {
        return (
          <div className={`math-display ${className}`}>
            {match[1]}<InlineMath math={match[2]} />{match[3] || ""}
          </div>
        );
      }
    } catch (error) {
      console.error("Tangent lines case rendering failed:", error);
      // Fall through to default rendering
    }
  }
  
  // Special handling for complex mathematical expressions with variables
  if (contentStr.includes("number") && /\d+[a-zA-Z]+\d*[a-zA-Z]+\d*\([^)]+\)/.test(contentStr)) {
    try {
      // Extract the complex expression using regex
      const match = contentStr.match(/(.*?)(\d+)([a-zA-Z]+\d*)([a-zA-Z]+\d*)\(([^)]+)\)(.*)/);
      
      if (match) {
        const [_, prefix, number, var1, var2, expression, suffix] = match;
        const mathExpression = `${number}${var1}${var2}(${expression})`;
        
        return (
          <div className={`math-display ${className}`}>
            {prefix}<InlineMath math={mathExpression} />{suffix}
          </div>
        );
      }
    } catch (error) {
      console.error("Complex expression rendering failed:", error);
      // Fall through to default rendering
    }
  }
  
  // Very specific case: "If x > y > 0x > y > 0p > q > 0 and"
  if (/If\s+x\s*>\s*y\s*>\s*0x\s*>\s*y\s*>\s*0p\s*>\s*q\s*>\s*0/.test(contentStr)) {
    try {
      return (
        <div className={`math-display ${className}`}>
          If <InlineMath math={"x > y > 0 \\text{ and } x > y > 0 \\text{ and } p > q > 0"} />
        </div>
      );
    } catch (error) {
      console.error("Specific inequality case rendering failed:", error);
      // Fall through to default rendering
    }
  }
  
  // Very specific case: "number 760x93y760x93y(3x − 2y) is"
  if (/number\s+760x93y760x93y\(3x\s*[−-]\s*2y\)/.test(contentStr)) {
    try {
      const match = contentStr.match(/(.*number\s+)(760x93y760x93y\(3x\s*[−-]\s*2y\))(.*)/);
      if (match) {
        return (
          <div className={`math-display ${className}`}>
            {match[1]}<InlineMath math={"760x^{93}y^{760}x^{93}y(3x - 2y)"} />{match[3]}
          </div>
        );
      }
    } catch (error) {
      console.error("Specific complex expression rendering failed:", error);
      // Fall through to default rendering
    }
  }
  
  // Case: "x, y & z are consecutive integers. If $0<x<y<z$ and $(x+y+z)$ is an odd integer, which of the following could be the value of z?"
  if (/x,\s*y\s*[&\+]\s*z\s+are\s+consecutive\s+integers/.test(contentStr) && 
      contentStr.includes("$0<x<y<z$") && contentStr.includes("$(x+y+z)$")) {
    try {
      // Special handling for this specific format
      const parts = contentStr.split(/(\$[^$]+\$)/g);
      
      return (
        <div className={`math-display ${className}`}>
          {parts.map((part, idx) => {
            if (part.startsWith('$') && part.endsWith('$')) {
              return <InlineMath key={idx} math={part.slice(1, -1)} />;
            }
            return part;
          })}
        </div>
      );
    } catch (error) {
      console.error("Consecutive integers case rendering failed:", error);
      // Fall through to default rendering
    }
  }

  // Case: "If the coefficients of $x^7$ and $x^8$ in $(2 + \frac{x}{3})^n$ are equal, then n is"
  if (contentStr.includes("coefficients") && contentStr.includes("equal") && 
      contentStr.includes("x^") && (contentStr.includes("\\frac") || contentStr.includes("/"))) {
    try {
      // If we have dollar signs, split and render each math part
      if (contentStr.includes("$")) {
        const parts = contentStr.split(/(\$[^$]+\$)/g);
        
        return (
          <div className={`math-display ${className}`}>
            {parts.map((part, idx) => {
              if (part.startsWith('$') && part.endsWith('$')) {
                return <InlineMath key={idx} math={part.slice(1, -1)} />;
              }
              return part;
            })}
          </div>
        );
      } else {
        // If no dollar signs, manually identify the math parts
        // Assuming a pattern like: "If the coefficients of x^7 and x^8 in (2 + \frac{x}{3})^n are equal, then n is"
        const mathRegex = /(.*?)(coefficients\s+of\s+)(x\^\d+)(\s+and\s+)(x\^\d+)(\s+in\s+)(\([^)]+\)\^n)(\s+are\s+equal,\s+then\s+n\s+is)(.*)/i;
        const match = contentStr.match(mathRegex);
        
        if (match) {
          return (
            <div className={`math-display ${className}`}>
              {match[1]}{match[2]}<InlineMath math={match[3]} />{match[4]}<InlineMath math={match[5]} />
              {match[6]}<InlineMath math={match[7]} />{match[8]}{match[9]}
            </div>
          );
        }
      }
    } catch (error) {
      console.error("Coefficient expression rendering failed:", error);
      // Fall through to default rendering
    }
  }
  
  return (
    <div className={`math-display ${className}`}>
      {block ? renderMathContent(contentStr, true) : renderContent(contentStr)}
    </div>
  );
};

MathDisplay.propTypes = {
  content: PropTypes.string.isRequired,
  block: PropTypes.bool,
  className: PropTypes.string
};

export default MathDisplay;
