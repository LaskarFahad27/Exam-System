import React, { useState } from "react";
import { addStyles, EditableMathField } from "./components/MathLiveWrapper";

// MathLive styles are loaded automatically
addStyles();

// Math symbols organized by category
const mathSymbols = {
  Basic: [
    { symbol: '+', latex: '+', label: 'Plus' },
    { symbol: '−', latex: '-', label: 'Minus' },
    { symbol: '×', latex: '\\times', label: 'Multiply' },
    { symbol: '÷', latex: '\\div', label: 'Divide' },
    { symbol: '=', latex: '=', label: 'Equals' },
    { symbol: '≠', latex: '\\neq', label: 'Not equal' },
    { symbol: '±', latex: '\\pm', label: 'Plus minus' },
    { symbol: '∞', latex: '\\infty', label: 'Infinity' },
  ],
  Fractions: [
    { symbol: '½', latex: '\\frac{1}{2}', label: 'One half' },
    { symbol: '¼', latex: '\\frac{1}{4}', label: 'One quarter' },
    { symbol: '¾', latex: '\\frac{3}{4}', label: 'Three quarters' },
    { symbol: 'a/b', latex: '\\frac{a}{b}', label: 'Fraction' },
    { symbol: 'a/b+c', latex: '\\frac{a}{b+c}', label: 'Complex fraction' },
  ],
  Powers: [
    { symbol: 'x²', latex: 'x^2', label: 'Square' },
    { symbol: 'x³', latex: 'x^3', label: 'Cube' },
    { symbol: 'xⁿ', latex: 'x^n', label: 'Power' },
    { symbol: 'e^x', latex: 'e^x', label: 'Exponential' },
    { symbol: 'a^b', latex: 'a^b', label: 'General power' },
    { symbol: '2^x', latex: '2^x', label: 'Power of 2' },
    { symbol: '10^x', latex: '10^x', label: 'Power of 10' },
    { symbol: 'log', latex: '\\log(x)', label: 'Logarithm' },
    { symbol: 'ln', latex: '\\ln(x)', label: 'Natural log' },
  ],
  Roots: [
    { symbol: '√', latex: '\\sqrt{x}', label: 'Square root' },
    { symbol: '∛', latex: '\\sqrt[3]{x}', label: 'Cube root' },
    { symbol: 'ⁿ√', latex: '\\sqrt[n]{x}', label: 'Nth root' },
    { symbol: '√a', latex: '\\sqrt{a}', label: 'Square root of a' },
    { symbol: '√ab', latex: '\\sqrt{ab}', label: 'Square root of product' },
    { symbol: '√(a+b)', latex: '\\sqrt{a+b}', label: 'Square root of sum' },
    { symbol: '√(a²+b²)', latex: '\\sqrt{a^2+b^2}', label: 'Pythagorean' },
    { symbol: '∜', latex: '\\sqrt[4]{x}', label: 'Fourth root' },
    { symbol: '⁵√', latex: '\\sqrt[5]{x}', label: 'Fifth root' },
  ],
  Calculus: [
    { symbol: '∫', latex: '\\int', label: 'Integral' },
    { symbol: '∮', latex: '\\oint', label: 'Contour integral' },
    { symbol: '∂', latex: '\\partial', label: 'Partial derivative' },
    { symbol: 'd/dx', latex: '\\frac{d}{dx}', label: 'Derivative' },
    { symbol: '∇', latex: '\\nabla', label: 'Nabla' },
    { symbol: '∆', latex: '\\Delta', label: 'Delta' },
    { symbol: '∑', latex: '\\sum', label: 'Sum' },
    { symbol: '∏', latex: '\\prod', label: 'Product' },
    { symbol: 'lim', latex: '\\lim', label: 'Limit' },
  ],
  Geometry: [
    { symbol: '°', latex: '^\\circ', label: 'Degree' },
    { symbol: '∠', latex: '\\angle', label: 'Angle' },
    { symbol: '⊥', latex: '\\perp', label: 'Perpendicular' },
    { symbol: '∥', latex: '\\parallel', label: 'Parallel' },
    { symbol: '△', latex: '\\triangle', label: 'Triangle' },
    { symbol: '□', latex: '\\square', label: 'Square' },
    { symbol: '○', latex: '\\circ', label: 'Circle' },
    { symbol: '≅', latex: '\\cong', label: 'Congruent' },
    { symbol: '∼', latex: '\\sim', label: 'Similar' },
  ],
  Trigonometry: [
    { symbol: 'sin', latex: '\\sin', label: 'Sine' },
    { symbol: 'cos', latex: '\\cos', label: 'Cosine' },
    { symbol: 'tan', latex: '\\tan', label: 'Tangent' },
    { symbol: 'csc', latex: '\\csc', label: 'Cosecant' },
    { symbol: 'sec', latex: '\\sec', label: 'Secant' },
    { symbol: 'cot', latex: '\\cot', label: 'Cotangent' },
    { symbol: 'arcsin', latex: '\\arcsin', label: 'Arc sine' },
    { symbol: 'arccos', latex: '\\arccos', label: 'Arc cosine' },
    { symbol: 'arctan', latex: '\\arctan', label: 'Arc tangent' },
  ],
  Greek: [
    { symbol: 'α', latex: '\\alpha', label: 'Alpha' },
    { symbol: 'β', latex: '\\beta', label: 'Beta' },
    { symbol: 'γ', latex: '\\gamma', label: 'Gamma' },
    { symbol: 'δ', latex: '\\delta', label: 'Delta' },
    { symbol: 'ε', latex: '\\epsilon', label: 'Epsilon' },
    { symbol: 'θ', latex: '\\theta', label: 'Theta' },
    { symbol: 'λ', latex: '\\lambda', label: 'Lambda' },
    { symbol: 'μ', latex: '\\mu', label: 'Mu' },
    { symbol: 'π', latex: '\\pi', label: 'Pi' },
    { symbol: 'σ', latex: '\\sigma', label: 'Sigma' },
    { symbol: 'φ', latex: '\\phi', label: 'Phi' },
    { symbol: 'ω', latex: '\\omega', label: 'Omega' },
  ],
  Sets: [
    { symbol: '∈', latex: '\\in', label: 'Element of' },
    { symbol: '∉', latex: '\\notin', label: 'Not element of' },
    { symbol: '⊂', latex: '\\subset', label: 'Subset' },
    { symbol: '⊃', latex: '\\supset', label: 'Superset' },
    { symbol: '⊆', latex: '\\subseteq', label: 'Subset or equal' },
    { symbol: '⊇', latex: '\\supseteq', label: 'Superset or equal' },
    { symbol: '∪', latex: '\\cup', label: 'Union' },
    { symbol: '∩', latex: '\\cap', label: 'Intersection' },
    { symbol: '∅', latex: '\\emptyset', label: 'Empty set' },
    { symbol: 'ℕ', latex: '\\mathbb{N}', label: 'Natural numbers' },
    { symbol: 'ℤ', latex: '\\mathbb{Z}', label: 'Integers' },
    { symbol: 'ℚ', latex: '\\mathbb{Q}', label: 'Rationals' },
    { symbol: 'ℝ', latex: '\\mathbb{R}', label: 'Real numbers' },
  ],
  Comparison: [
    { symbol: '<', latex: '<', label: 'Less than' },
    { symbol: '>', latex: '>', label: 'Greater than' },
    { symbol: '≤', latex: '\\leq', label: 'Less than or equal' },
    { symbol: '≥', latex: '\\geq', label: 'Greater than or equal' },
    { symbol: '≈', latex: '\\approx', label: 'Approximately' },
    { symbol: '≡', latex: '\\equiv', label: 'Identical to' },
    { symbol: '∝', latex: '\\propto', label: 'Proportional to' },
    { symbol: '≺', latex: '\\prec', label: 'Precedes' },
    { symbol: '≻', latex: '\\succ', label: 'Succeeds' },
  ],
};

const MathMCQMaker = ({ activeSection, addQuestion }) => {
  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    questionLatex: "",
    options: Array(4).fill({ text: "", latex: "" }),
    correctAnswer: null,
  });
  
  const [activeCategory, setActiveCategory] = useState('Basic');
  const [showSymbolPalette, setShowSymbolPalette] = useState(false);
  const [activeMathField, setActiveMathField] = useState(null);
  const [mathFieldRefs, setMathFieldRefs] = useState({
    question: null,
    options: [null, null, null, null]
  });

  const handleQuestionChange = (mathField) => {
    setQuestionForm({
      ...questionForm,
      questionLatex: mathField.latex(),
      questionText: mathField.text(),
    });
  };

  const handleOptionTextChange = (index, value) => {
    const updatedOptions = [...questionForm.options];
    updatedOptions[index] = { ...updatedOptions[index], text: value };
    setQuestionForm({ ...questionForm, options: updatedOptions });
  };

  const handleOptionLatexChange = (index, mathField) => {
    const updatedOptions = [...questionForm.options];
    updatedOptions[index] = { 
      ...updatedOptions[index], 
      latex: mathField.latex(),
      text: mathField.text()
    };
    setQuestionForm({ ...questionForm, options: updatedOptions });
  };

  // Function to insert symbol into active math field and close modal
  const insertSymbol = (latex) => {
    console.log('Inserting symbol:', latex, 'into field:', activeMathField);
    console.log('Math field refs:', mathFieldRefs);
    
    if (activeMathField === 'question' && mathFieldRefs.question) {
      console.log('Question field ref exists, inserting symbol');
      mathFieldRefs.question.write(latex);
      console.log('Symbol inserted into question field');
    } else if (activeMathField && activeMathField.startsWith('option-')) {
      const optionIndex = parseInt(activeMathField.split('-')[1]);
      console.log('Inserting into option index:', optionIndex);
      if (mathFieldRefs.options[optionIndex]) {
        mathFieldRefs.options[optionIndex].write(latex);
        console.log('Symbol inserted into option', optionIndex, 'field');
      } else {
        console.log('Option field ref not found for index:', optionIndex);
      }
    } else {
      console.log('No active field or field ref not found');
    }
    
    // Close the modal after inserting symbol
    setShowSymbolPalette(false);
  };

  // Function to focus on math field and set as active
  const focusMathField = (fieldType, index = null) => {
    if (fieldType === 'question') {
      setActiveMathField('question');
      if (mathFieldRefs.question) {
        mathFieldRefs.question.focus();
      }
    } else if (fieldType === 'option' && index !== null) {
      setActiveMathField(`option-${index}`);
      if (mathFieldRefs.options[index]) {
        mathFieldRefs.options[index].focus();
      }
    }
  };

  // Function to set active math field and show modal
  const openSymbolPalette = (fieldType, index = null) => {
    if (fieldType === 'question') {
      setActiveMathField('question');
    } else if (fieldType === 'option' && index !== null) {
      setActiveMathField(`option-${index}`);
    }
    setShowSymbolPalette(true);
  };

  // Function to set math field reference
  const setMathFieldRef = (fieldType, index, mathField) => {
    if (fieldType === 'question') {
      setMathFieldRefs(prev => ({
        ...prev,
        question: mathField
      }));
    } else if (fieldType === 'option') {
      setMathFieldRefs(prev => {
        const newOptions = [...prev.options];
        newOptions[index] = mathField;
        return {
          ...prev,
          options: newOptions
        };
      });
    }
  };

  const handleAddQuestion = () => {
    if (!questionForm.questionLatex.trim() && !questionForm.questionText.trim()) {
      alert("Please enter a question!");
      return;
    }

    // Format question with LaTeX if present
    const questionText = questionForm.questionLatex 
      ? `${questionForm.questionText} [math]${questionForm.questionLatex}[/math]`
      : questionForm.questionText;

    // Format options with LaTeX if present
    const formattedOptions = questionForm.options.map(option => {
      return option.latex 
        ? `${option.text} [math]${option.latex}[/math]`
        : option.text;
    });

    const newQuestion = {
      id: Date.now(),
      question: questionText,
      options: formattedOptions,
      correctAnswer: questionForm.correctAnswer,
      hasMath: true,
    };

    addQuestion(activeSection, newQuestion);

    // Reset form
    setQuestionForm({
      questionText: "",
      questionLatex: "",
      options: Array(4).fill({ text: "", latex: "" }),
      correctAnswer: null,
    });
    setActiveMathField(null);
    setShowSymbolPalette(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">
        Add Math Question with Equations
      </h2>

      {/* Math Symbol Palette Modal */}
      {showSymbolPalette && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Math Symbols</h3>
                <button
                  onClick={() => setShowSymbolPalette(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.keys(mathSymbols).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeCategory === category
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              {/* Symbol Grid */}
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3 mb-4">
                {mathSymbols[activeCategory].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => insertSymbol(item.latex)}
                    className="p-3 border-2 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-center min-h-[50px] flex items-center justify-center group"
                    title={item.label}
                  >
                    <span className="text-xl font-mono group-hover:scale-110 transition-transform">{item.symbol}</span>
                  </button>
                ))}
              </div>
              
              {activeMathField && (
                <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                  <strong>Inserting into:</strong> {activeMathField === 'question' ? 'Question Field' : `Option ${parseInt(activeMathField.split('-')[1]) + 1} Field`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text
        </label>
        <input
          type="text"
          placeholder="Enter question text"
          value={questionForm.questionText}
          onChange={(e) =>
            setQuestionForm({ ...questionForm, questionText: e.target.value })
          }
          className="w-full border p-2 mb-2 rounded"
        />
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Math Equation - Supports keyboard input and symbols
          </label>
        </div>
        <div 
          className="math-field-container p-2 bg-white min-h-[45px] transition-colors"
        >
          <EditableMathField
            latex={questionForm.questionLatex}
            onChange={handleQuestionChange}
            mathquillDidMount={(mathField) => {
              console.log('Question math field mounted:', mathField);
              setMathFieldRef('question', null, mathField);
            }}
            onFocus={() => {
              console.log('Question field focused');
              setActiveMathField('question');
            }}
          />
        </div>
      </div>

      <div className="mt-4 mb-2">
        <h3 className="font-medium text-gray-800">Options</h3>
      </div>

      {questionForm.options.map((opt, index) => (
        <div key={index} className="mb-4">
          <div className="flex items-center mb-1">
            <span className="mr-2 text-sm font-medium text-gray-700">Option {index + 1}</span>
            <input
              type="radio"
              name="correctAnswer"
              checked={questionForm.correctAnswer === index}
              onChange={() =>
                setQuestionForm({ ...questionForm, correctAnswer: index })
              }
              className="ml-auto"
            />
          </div>
          <input
            type="text"
            placeholder={`Option ${index + 1} text`}
            value={opt.text}
            onChange={(e) => handleOptionTextChange(index, e.target.value)}
            className="w-full border p-2 mb-1 rounded"
          />
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Math equation - Supports keyboard & symbols</span>
          </div>
          <div 
            className="math-field-container p-1 bg-white min-h-[35px] transition-colors"
          >
            <EditableMathField
              latex={opt.latex}
              onChange={(mathField) => handleOptionLatexChange(index, mathField)}
              mathquillDidMount={(mathField) => {
                console.log(`Option ${index} math field mounted:`, mathField);
                setMathFieldRef('option', index, mathField);
              }}
              onFocus={() => {
                console.log(`Option ${index} field focused`);
                setActiveMathField(`option-${index}`);
              }}
            />
          </div>
        </div>
      ))}

      <div className="flex justify-end mt-4">
        <button
          onClick={handleAddQuestion}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Add Math Question
        </button>
      </div>
    </div>
  );
};

export default MathMCQMaker;