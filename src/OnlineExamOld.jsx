import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle, ArrowRight, User, Shield, BookOpen, Calculator, Edit, Menu } from 'lucide-react';
import logo from "../src/assets/logo.png";
import { Upload } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import toastService from './utils/toast.jsx';

// Function to convert radical notation to exponential notation
const convertRadicalToExponential = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  let converted = text;
  
  // Convert common math symbols to LaTeX format first, then to exponential
  const preConversions = [
    // Unicode symbols to LaTeX
    { pattern: /√/g, replacement: '\\sqrt{}' },
    { pattern: /∛/g, replacement: '\\sqrt[3]{}' },
    { pattern: /∜/g, replacement: '\\sqrt[4]{}' },
    { pattern: /⁵√/g, replacement: '\\sqrt[5]{}' },
    { pattern: /ⁿ√/g, replacement: '\\sqrt[n]{}' },
    { pattern: /²/g, replacement: '^2' },
    { pattern: /³/g, replacement: '^3' },
    { pattern: /⁴/g, replacement: '^4' },
    { pattern: /⁵/g, replacement: '^5' },
    { pattern: /₂/g, replacement: '_2' },
    { pattern: /₃/g, replacement: '_3' },
    { pattern: /π/g, replacement: '\\pi' },
  ];
  
  preConversions.forEach(({ pattern, replacement }) => {
    converted = converted.replace(pattern, replacement);
  });
  
  // Handle cases where content follows immediately after the radical symbol
  converted = converted.replace(/\\sqrt\{\}(\d+)/g, '\\sqrt{$1}');
  converted = converted.replace(/\\sqrt\{\}([a-zA-Z]+)/g, '\\sqrt{$1}');
  converted = converted.replace(/\\sqrt\{\}([a-zA-Z0-9]+)/g, '\\sqrt{$1}');
  
  // Convert ALL radical patterns to exponential form (strict exponential-only policy)
  const conversions = [
    // Square roots with content: √144 → 144^(1/2)
    { pattern: /\\sqrt\{([^{}]*)\}([a-zA-Z0-9]+)/g, replacement: '($2)^{1/2}' },
    { pattern: /\\sqrt\{([^{}]+)\}/g, replacement: '($1)^{1/2}' },
    { pattern: /√([a-zA-Z0-9]+)/g, replacement: '$1^{1/2}' },
    
    // Cube roots
    { pattern: /\\sqrt\[3\]\{([^{}]+)\}/g, replacement: '($1)^{1/3}' },
    { pattern: /\\sqrt\[3\]\{([^{}]*)\}([a-zA-Z0-9]+)/g, replacement: '($2)^{1/3}' },
    
    // Fourth roots  
    { pattern: /\\sqrt\[4\]\{([^{}]+)\}/g, replacement: '($1)^{1/4}' },
    { pattern: /\\sqrt\[4\]\{([^{}]*)\}([a-zA-Z0-9]+)/g, replacement: '($2)^{1/4}' },
    
    // Fifth roots
    { pattern: /\\sqrt\[5\]\{([^{}]+)\}/g, replacement: '($1)^{1/5}' },
    { pattern: /\\sqrt\[5\]\{([^{}]*)\}([a-zA-Z0-9]+)/g, replacement: '($2)^{1/5}' },
    
    // General nth roots
    { pattern: /\\sqrt\[([^[\]]+)\]\{([^{}]+)\}/g, replacement: '($2)^{1/$1}' },
    { pattern: /\\sqrt\[([^[\]]+)\]\{([^{}]*)\}([a-zA-Z0-9]+)/g, replacement: '($3)^{1/$1}' },
    
    // Handle any remaining \\sqrt commands (fallback to square root)
    { pattern: /\\sqrt\{([^{}]+)\}/g, replacement: '($1)^{1/2}' },
    { pattern: /\\sqrt([a-zA-Z0-9]+)/g, replacement: '$1^{1/2}' },
    
    // Clean up double parentheses for simple variables/numbers
    { pattern: /\(([a-zA-Z])\)\^/g, replacement: '$1^' },
    { pattern: /\(([0-9]+)\)\^/g, replacement: '$1^' },
    { pattern: /\(([a-zA-Z][0-9]*)\)\^/g, replacement: '$1^' },
  ];
  
  conversions.forEach(({ pattern, replacement }) => {
    converted = converted.replace(pattern, replacement);
  });
  
  return converted;
};

const renderMathContent = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Check for math symbols that need rendering
  const mathSymbols = /[√∛∜⁵²³⁴⁵₂₃π]|x²|x³|\^|\\_|log₂|\[math\]|\[\/math\]/;
  
  if (!mathSymbols.test(text)) return text;
  
  try {
    // Remove any [math] and [/math] tags
    let cleanText = text.replace(/\[math\]/g, '').replace(/\[\/math\]/g, '');
    
    // For math content, render it with KaTeX
    return <InlineMath math={cleanText} />;
  } catch (error) {
    console.error('Math content processing error:', error);
    return text; // Return original text if processing fails
  }
};

const OnlineExam = () => {
  const [timeLeft, setTimeLeft] = useState(2400); // 40 minutes for English
  const [currentSection, setCurrentSection] = useState('English');
  const [answers, setAnswers] = useState({});
  const [examSubmitted, setExamSubmitted] = useState(false);
   const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // English Questions
  const englishQuestions = [
    { id: 1, question: "Choose the correct form of the verb: 'She _____ to the market every Sunday.'", options: ["go", "goes", "going", "gone"] },
    { id: 2, question: "Identify the correct sentence:", options: ["The book whom I read was interesting.", "The book which I read was interesting.", "The book what I read was interesting.", "The book where I read was interesting."] },
    { id: 3, question: "Choose the appropriate preposition: 'He is interested _____ learning English.'", options: ["on", "at", "in", "for"] },
    { id: 4, question: "Select the correct passive voice: 'They are building a new school.'", options: ["A new school is being built by them.", "A new school was being built by them.", "A new school has been built by them.", "A new school will be built by them."] },
    { id: 5, question: "Choose the correct article: 'I saw _____ elephant at the zoo yesterday.'", options: ["a", "an", "the", "no article needed"] },
    { id: 6, question: "Identify the correct comparative form: 'This book is _____ than that one.'", options: ["more interesting", "most interesting", "interestinger", "much interesting"] },
    { id: 7, question: "Choose the correct conditional: 'If I _____ rich, I would travel the world.'", options: ["am", "was", "were", "will be"] },
    { id: 8, question: "Select the appropriate conjunction: 'He studied hard, _____ he failed the exam.'", options: ["and", "but", "so", "because"] },
    { id: 9, question: "Choose the correct form: 'By next year, I _____ my degree.'", options: ["will complete", "will have completed", "would complete", "am completing"] },
    { id: 10, question: "Identify the correct sentence structure: 'Neither John nor his friends _____ coming to the party.'", options: ["is", "are", "was", "were"] }
  ];

  // Math Questions
  const mathQuestions = [
    { id: 11, question: "Solve: 2x + 5 = 15. What is the value of x?", options: ["5", "7", "10", "3"] },
    { id: 12, question: "What is the value of √144?", options: ["12", "14", "16", "10"] },
    { id: 13, question: "If the area of a circle is 78.5 square units, what is its radius? (π = 3.14)", options: ["5 units", "4 units", "6 units", "7 units"] },
    { id: 14, question: "Simplify: (3x² + 2x - 1) - (x² - 3x + 2)", options: ["2x² + 5x - 3", "2x² - x + 1", "4x² - x - 3", "2x² + 5x + 1"] },
    { id: 15, question: "What is 15% of 240?", options: ["36", "30", "40", "32"] },
    { id: 16, question: "If log₂(x) = 4, then x equals:", options: ["8", "16", "32", "4"] },
    { id: 17, question: "Find the slope of the line passing through points (2, 3) and (6, 11):", options: ["2", "3", "4", "1"] },
    { id: 18, question: "What is the sum of interior angles of a hexagon?", options: ["720°", "900°", "1080°", "540°"] },
    { id: 19, question: "If sin θ = 3/5, what is cos θ? (assuming θ is acute)", options: ["4/5", "3/4", "5/3", "5/4"] },
    { id: 20, question: "Solve the equation: x² - 7x + 12 = 0", options: ["x = 3, 4", "x = 2, 6", "x = 1, 12", "x = 3, 5"] }
  ];

  // Reading Comprehension Questions
  const readingQuestions = [
    { id: 21, question: "Read the passage and answer: What is the main idea of the text?", options: ["Option A", "Option B", "Option C", "Option D"] },
    { id: 22, question: `According to the passage, what is the meaning of sustainable?`, options: ["Option A", "Option B", "Option C", "Option D"] },
    { id: 23, question: "Which statement is true based on the passage?", options: ["Option A", "Option B", "Option C", "Option D"] }
  ];

  // Essay Writing Questions
  const essayQuestions = [
    { id: 31, question: "Write an essay on 'The Impact of Technology on Education'.", options: [] },
  ];

  const currentQuestions = (() => {
    switch (currentSection) {
      case 'English': return englishQuestions;
      case 'Math': return mathQuestions;
      case 'Reading': return readingQuestions;
      case 'Essay': return essayQuestions;
      default: return [];
    }
  })();

  useEffect(() => {
    if (timeLeft > 0 && !examSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !examSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, examSubmitted]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    if (answers[questionId] === undefined) {
      setAnswers({ ...answers, [questionId]: optionIndex });
    }
  };

  const handleEssayChange = (questionId, text) => {
    setAnswers({ ...answers, [questionId]: text });
  };

  const getAnsweredCount = () => {
    if (!Array.isArray(currentQuestions)) return 0;
    
    if (currentSection === 'Essay') {
      return currentQuestions.filter(q => answers[q.id] && answers[q.id].trim() !== '').length;
    }
    return currentQuestions.filter(q => answers[q.id] !== undefined).length;
  };

  const handleSubmit = () => {
    setExamSubmitted(true);
    setTimeout(() => {
      switch(currentSection) {
        case 'English': setCurrentSection('Math'); setTimeLeft(3600); break;
        case 'Math': setCurrentSection('Reading'); setTimeLeft(1200); break;
        case 'Reading': setCurrentSection('Essay'); setTimeLeft(1200); break;
        case 'Essay': toastService.success('Exam completed successfully!'); break;
      }
      setExamSubmitted(false);
    }, 2000);
  };

  const sectionColors = {
  English: 'bg-blue-600',
  Math: 'bg-green-600',
  Reading: 'bg-purple-600',
  Essay: 'bg-pink-600'
};

  //Detect Developer Tool
   
  // useEffect(() => {
  //   let detected = false;

  //   const detectByDimensions = () => {
  //     if (
  //       window.outerHeight - window.innerHeight > 200 ||
  //       window.outerWidth - window.innerWidth > 200
  //     ) {
  //       detected = true;
  //       setOpen(true);
  //       alert("You have violated the rules by opening the developer tools. Therefore, you are not eligible to continue the examination");
  //       navigate("/"); 
  //     }
  //   };

  //   const detectByConsole = () => {
  //     const element = new Image();
  //     Object.defineProperty(element, "id", {
  //       get: function () {
  //         detected = true;
  //         setOpen(true);
  //         alert("You have violated the rules by opening the developer tools. Therefore, you are not eligible to continue the examination");
  //         navigate("/"); 
  //       }
  //     });
  //     console.log(element);
  //   };

  //   const detectByDebugger = () => {
  //     const start = performance.now();
  //     debugger;
  //     const end = performance.now();
  //     if (end - start > 100) {
  //       detected = true;
  //       setOpen(true);
  //       alert("You have violated the rules by opening the developer tools. Therefore, you are not eligible to continue the examination");
  //       navigate("/"); 
  //     }
  //   };

  //   const detectAll = () => {
  //     if (!detected) {
  //       detectByDimensions();
  //       detectByConsole();
  //       detectByDebugger();
  //     }
  //   };

  //   const interval = setInterval(detectAll, 1000);

  //   return () => clearInterval(interval);
  // }, []);
   
  // //Detect Tab Switch

  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === "visible") {
  //       alert("You have violated the rules by switching tab. Therefore, you are not eligible to continue the examination");
  //       navigate("/");
  //     }
  //   };

  //   document.addEventListener("visibilitychange", handleVisibilityChange);
    
  //   return () => {
  //     document.removeEventListener("visibilitychange", handleVisibilityChange);
  //   };
  // }, [navigate]);

  //Prevent Click Events

  useEffect(() => {
    // Disable right click
    const disableRightClick = (e) => {
      e.preventDefault();
      toastService.error("You are not able to click 'Right' !");
    };

    // Disable keyboard shortcuts
    const disableKeyShortcuts = (e) => {
      if (
        (e.ctrlKey && e.key === "c") || // Ctrl + C
        (e.ctrlKey && e.key === "x") || // Ctrl + X
        (e.ctrlKey && e.key === "v")    // Ctrl + V
      ) {
        e.preventDefault();
        toastService.error("You are not able to Copy, Cut, and Paste!");
      }
    };

    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("keydown", disableKeyShortcuts);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", disableKeyShortcuts);
    };
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      console.log('Files dropped:', e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files?.[0]) {
      console.log('Files selected:', e.target.files);
    }
  };

  // Section Completed Screen
  if (examSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          {currentSection !== 'Essay' ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentSection} Section Completed!</h2>
              <p className="text-gray-600 mb-4">Redirecting to next section...</p>
              <div className="text-sm text-gray-500">
                Questions Answered: {getAnsweredCount()}/{Array.isArray(currentQuestions) ? currentQuestions.length : 0}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Completed!</h2>
              <p className="text-gray-600 mb-4">Thank you for taking the examination.</p>
              <div className="text-sm text-gray-500">
                <div>English: {englishQuestions.filter(q => answers[q.id] !== undefined).length}/{englishQuestions.length}</div>
                <div>Mathematics: {mathQuestions.filter(q => answers[q.id] !== undefined).length}/{mathQuestions.length}</div>
                <div>Reading: {readingQuestions.filter(q => answers[q.id] !== undefined).length}/{readingQuestions.length}</div>
                <div>Essay: {essayQuestions.filter(q => answers[q.id] && answers[q.id].trim() !== '').length}/{essayQuestions.length}</div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                   <img src={logo} alt="CampusPro" className="w-25 h-6" />
                </div>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Features</a>
                <a href="#pricing" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Pricing</a>
                <a href="#testimonials" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Testimonials</a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Contact</a>
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 p-2"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
              <a href="#features" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">Pricing</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">Testimonials</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">Contact</a>
            </div>
          </div>
        )}
      </nav>
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">Online Examination System</span>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" /> <span>Student ID: 2025001</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className={`w-5 h-5 ${timeLeft < 300 ? 'text-red-500' : 'text-blue-600'}`} />
            <span className={`text-xl font-mono font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-gray-900'}`}>
              {formatTime(timeLeft)}
            </span>
            {timeLeft < 300 && <AlertCircle className="w-5 h-5 text-red-500" />}
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className={`${sectionColors[currentSection] || 'bg-black'} text-white`}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3 mb-2">
            {currentSection === 'English' && <BookOpen className="w-8 h-8" />}
            {currentSection === 'Math' && <Calculator className="w-8 h-8" />}
            {currentSection === 'Reading' && <BookOpen className="w-8 h-8" />}
            {currentSection === 'Essay' && <Edit className="w-8 h-8" />}
            <h1 className="text-2xl font-bold">
              {currentSection === 'English' && 'English Grammar Section'}
              {currentSection === 'Math' && 'Mathematics Section'}
              {currentSection === 'Reading' && 'Reading Comprehension Section'}
              {currentSection === 'Essay' && 'Essay Writing Section'}
            </h1>
          </div>
          <div className="flex items-center justify-between">
            <span>Total Questions: {Array.isArray(currentQuestions) ? currentQuestions.length : 0}</span>
            <div>Answered: {getAnsweredCount()}/{Array.isArray(currentQuestions) ? currentQuestions.length : 0}</div>
          </div>
          <div className="mt-4">
            <div className="rounded-full h-2 bg-white">
              <div
                className="rounded-full h-2 bg-gray-800 transition-all duration-300"
                style={{ width: `${Array.isArray(currentQuestions) && currentQuestions.length > 0 ? (getAnsweredCount()/currentQuestions.length)*100 : 0}%` }}
              ></div>
            </div>
          </div>
          {timeLeft < 300 && (
            <div className="mt-3 flex items-center space-x-2 text-yellow-200">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Warning: Less than 5 minutes remaining!</span>
            </div>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {currentSection === 'Reading' && (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <p>Climate change is one of the most pressing issues facing the world today. Over the past century, human activities such as burning fossil fuels, deforestation, and industrial production have significantly increased greenhouse gas emissions. 
                    These gases trap heat in the atmosphere, leading to rising global temperatures. As a result, glaciers are melting, sea levels are rising, and extreme weather events are becoming more frequent. 
                    Climate change not only affects the environment but also human health, agriculture, and economies.
                     Governments and organizations worldwide are trying to address the problem through policies, renewable energy initiatives, and public awareness campaigns. Individual actions, like reducing waste, conserving energy, and using sustainable transportation, can also contribute to mitigating the effects.
                     Addressing climate change requires cooperation, innovation, and long-term commitment from all sectors of society to ensure a sustainable future for generations to come.</p>
    </div>
  )}

        {Array.isArray(currentQuestions) && currentQuestions.map((question, index) => {
          const isAnswered = answers[question.id] !== undefined && (currentSection !== 'Essay' ? true : answers[question.id]?.trim() !== '');
          return (
            <div key={question.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start space-x-4 mb-2">
                <div className={`text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm flex-shrink-0 ${currentSection === 'English' ? 'bg-blue-600' : currentSection === 'Math' ? 'bg-green-600' : currentSection === 'Reading' ? 'bg-purple-600' : 'bg-orange-600'}`}>
                  {index+1}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-medium text-gray-900">{renderMathContent(question.question)}</h2>
                </div>
              </div>

              {/* Options or Essay */}
              {currentSection !== 'Essay' ? (
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = answers[question.id] === optionIndex;
                    const isDisabled = answers[question.id] !== undefined;
                    return (
                      <label key={optionIndex} className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50' : isDisabled ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}>
                        <input type="radio" checked={isSelected} onChange={() => handleAnswerSelect(question.id, optionIndex)} disabled={isDisabled} className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"/>
                        <div className="ml-2">
                          <span className={`${isSelected ? 'text-blue-900 font-medium' : 'text-gray-900'}`}>{String.fromCharCode(65+optionIndex)}. {renderMathContent(option)}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <>
                <div className="w-full max-w-lg mx-auto p-6">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
          dragActive
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full transition-all duration-300 ${
            dragActive ? 'bg-blue-100' : 'bg-white'
          }`}>
            <Upload className={`w-12 h-12 transition-colors duration-300 ${
              dragActive ? 'text-blue-600' : 'text-gray-400'
            }`} />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {dragActive ? 'Drop your files here!' : 'Upload Essay Pictures'}
            </h3>
            <p className="text-gray-500 mb-4">Drag & drop or click to browse</p>
            <div className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
              Browse Files
            </div>
          </div>
        </div>
      </div>
    </div>
                <textarea
                  rows={6}
                  value={answers[question.id] || ''}
                  onChange={(e) => handleEssayChange(question.id, e.target.value)}
                  placeholder="Write your essay here..."
                  className="w-full border rounded-lg p-3 mt-4"
                />
                </>
              )}

              {isAnswered && (
                <div className="mt-3 flex items-center space-x-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Answer recorded</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Submit Button */}
        <div className="text-center mt-8">
          <button onClick={handleSubmit} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg flex items-center justify-center mx-auto space-x-2">
            <span>{currentSection === 'Essay' ? 'Submit Final Exam' : `Submit ${currentSection} Section`}</span>
            <ArrowRight className="w-5 h-5"/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnlineExam;
