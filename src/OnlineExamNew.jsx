import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle, ArrowRight, User, Shield, BookOpen, Calculator, Edit, Menu, Award, XCircle, FileText } from 'lucide-react';
import { getNextSection, submitSectionAnswers, getExamResults } from './utils/api';
import toastService from './utils/toast.jsx';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

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
  const mathSymbols = /[√∛∜⁵²³⁴⁵₂₃π]|x²|x³|\^|\\_|log₂/;
  
  if (!mathSymbols.test(text)) return text;
  
  try {
    // For math content, just render it directly with KaTeX
    return <InlineMath math={text} />;
  } catch (error) {
    console.error('Math content processing error:', error);
    return text; // Return original text if processing fails
  }
};

const OnlineExam = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State from navigation
  const [userExamId, setUserExamId] = useState(location.state?.userExamId);
  const [examTitle, setExamTitle] = useState(location.state?.examTitle || '');
  const [examDescription, setExamDescription] = useState(location.state?.examDescription || '');
  
  // Exam state
  const [currentSection, setCurrentSection] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentSectionNumber, setCurrentSectionNumber] = useState(0);
  const [totalSections, setTotalSections] = useState(0);
  const [sectionsCompleted, setSectionsCompleted] = useState(0);
  const [examCompleted, setExamCompleted] = useState(false);
  const [examResults, setExamResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    // Check if we have the required state
    if (!userExamId) {
      toastService.error('Invalid exam session. Redirecting to exam selection.');
      navigate('/exam-selection');
      return;
    }
    
    // Check authentication
    const studentToken = localStorage.getItem('studentToken');
    if (!studentToken) {
      toastService.error('Please login to continue.');
      navigate('/');
      return;
    }

    // Load the first/next section
    loadNextSection();
  }, [userExamId, navigate]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !examCompleted && !submitting) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !examCompleted && !submitting) {
      // Time's up, auto-submit current section
      handleSubmitSection(true);
    }
  }, [timeLeft, examCompleted, submitting]);

  const loadNextSection = async () => {
    try {
      setLoading(true);
      const response = await getNextSection(userExamId);
      
      if (response.success) {
        const { section, questions, total_sections, current_section_number, sections_completed } = response.data;
        
        setCurrentSection(section);
        setQuestions(questions);
        setTimeLeft(section.duration_minutes * 60); // Convert to seconds
        setCurrentSectionNumber(current_section_number);
        setTotalSections(total_sections);
        setSectionsCompleted(sections_completed);
        setAnswers({}); // Reset answers for new section
      }
    } catch (error) {
      console.error('Error loading section:', error);
      if (error.message.includes('No more sections') || error.message.includes('completed')) {
        setExamCompleted(true);
        toastService.success('Exam completed successfully!');
      } else {
        toastService.error('Failed to load section: ' + error.message);
        navigate('/exam-selection');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitSection = async (autoSubmit = false) => {
    try {
      setSubmitting(true);
      
      // Make sure we have a valid currentSection
      if (!currentSection || !currentSection.id) {
        toastService.error('Failed to submit: Current section is not available');
        setSubmitting(false);
        return;
      }
      
      // Format answers for API
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: parseInt(questionId),
        answer: answer
      }));

      await submitSectionAnswers(userExamId, currentSection.id, formattedAnswers);
      
      if (autoSubmit) {
        toastService.warning('Time expired! Section submitted automatically.');
      } else {
        toastService.success('Section submitted successfully!');
      }

      // Check if there are more sections
      if (currentSectionNumber < totalSections) {
        // Load next section after a brief delay
        setTimeout(() => {
          loadNextSection();
        }, 1500);
      } else {
        // Exam completed
        setExamCompleted(true);
        toastService.success('Exam completed successfully!');
        
        // Fetch exam results
        try {
          setLoadingResults(true);
          const results = await getExamResults(userExamId);
          if (results.success) {
            setExamResults(results.data);
          }
        } catch (error) {
          console.error('Error fetching exam results:', error);
          toastService.error('Failed to fetch exam results: ' + error.message);
        } finally {
          setLoadingResults(false);
        }
      }
    } catch (error) {
      console.error('Error submitting section:', error);
      toastService.error('Failed to submit section: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
  };

  const getSectionIcon = (sectionName) => {
    const name = sectionName?.toLowerCase() || '';
    if (name.includes('english') || name.includes('grammar') || name.includes('vocabulary')) {
      return <BookOpen className="w-8 h-8" />;
    } else if (name.includes('math') || name.includes('quantitative') || name.includes('aptitude')) {
      return <Calculator className="w-8 h-8" />;
    } else if (name.includes('reading') || name.includes('comprehension')) {
      return <BookOpen className="w-8 h-8" />;
    } else if (name.includes('essay') || name.includes('writing')) {
      return <Edit className="w-8 h-8" />;
    }
    return <BookOpen className="w-8 h-8" />;
  };

  const getSectionColor = (sectionName) => {
    const name = sectionName?.toLowerCase() || '';
    if (name.includes('english') || name.includes('grammar') || name.includes('vocabulary')) {
      return 'bg-blue-600';
    } else if (name.includes('math') || name.includes('quantitative') || name.includes('aptitude')) {
      return 'bg-green-600';
    } else if (name.includes('reading') || name.includes('comprehension')) {
      return 'bg-purple-600';
    } else if (name.includes('essay') || name.includes('writing')) {
      return 'bg-pink-600';
    }
    return 'bg-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exam section...</p>
        </div>
      </div>
    );
  }

  if (examCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Completed!</h2>
            <p className="text-gray-600 mb-2">Thank you for taking the examination.</p>
            <p className="text-sm text-gray-500">
              Exam: {examTitle}<br/>
              Sections Completed: {totalSections}/{totalSections}
            </p>
          </div>
          
          {loadingResults ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading exam results...</p>
            </div>
          ) : examResults ? (
            <div className="space-y-6">
              <div className="text-center bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Award className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-blue-900">Overall Score</h3>
                </div>
                <div className="text-3xl font-bold text-blue-700">{examResults.total_score}%</div>
              </div>
              
              <div className="divide-y divide-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Section Breakdown</h3>
                
                {examResults.sections.map((section) => (
                  <div key={section.section_id} className="py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          section.score_percentage >= 70 
                            ? 'bg-green-100 text-green-700' 
                            : section.score_percentage >= 40 
                              ? 'bg-yellow-100 text-yellow-700' 
                              : 'bg-red-100 text-red-700'
                        }`}>
                          {section.score_percentage >= 70 
                            ? <CheckCircle className="w-4 h-4" /> 
                            : section.score_percentage >= 40 
                              ? <AlertCircle className="w-4 h-4" /> 
                              : <XCircle className="w-4 h-4" />}
                        </div>
                        <h4 className="font-medium text-gray-900">{section.section_name}</h4>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">{section.score_percentage}%</div>
                    </div>
                    
                    <div className="bg-gray-100 rounded-full h-2.5 mb-2">
                      <div 
                        className={`h-2.5 rounded-full ${
                          section.score_percentage >= 70 
                            ? 'bg-green-600' 
                            : section.score_percentage >= 40 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                        }`} 
                        style={{ width: `${section.score_percentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Correct Answers: {section.correct_answers}/{section.total_questions}</span>
                      <span>Questions: {section.total_questions}</span>
                    </div>
                    
                    {section.questions && section.questions.length > 0 && (
                      <div className="mt-3">
                        <button 
                          onClick={() => document.getElementById(`section-${section.section_id}`).classList.toggle('hidden')}
                          className="text-sm flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                        >
                          <FileText className="w-4 h-4" />
                          <span>View Question Details</span>
                        </button>
                        
                        <div id={`section-${section.section_id}`} className="hidden mt-3 pl-4 border-l-2 border-gray-200 space-y-3">
                          {section.questions.map((question) => (
                            <div key={question.question_id} className={`p-3 rounded-md ${
                              question.is_correct ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
                            }`}>
                              <p className="text-sm font-medium text-gray-800 mb-2">{question.question_text}</p>
                              
                              {question.question_type === 'mcq' && (
                                <div className="space-y-1 text-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <span className="text-gray-600">Your answer:</span>
                                      <span className={`ml-1 font-medium ${question.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                                        {question.user_answer}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Correct answer:</span>
                                      <span className="ml-1 font-medium text-green-700">{question.correct_answer}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-2 flex items-center">
                                {question.is_correct ? (
                                  <span className="text-xs flex items-center text-green-700">
                                    <CheckCircle className="w-3 h-3 mr-1" /> Correct
                                  </span>
                                ) : (
                                  <span className="text-xs flex items-center text-red-700">
                                    <XCircle className="w-3 h-3 mr-1" /> Incorrect
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>Results not available at this time.</p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/exam-selection')}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Exams
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Submitting section...</p>
          <p className="text-sm text-gray-500">Questions Answered: {getAnsweredCount()}/{Array.isArray(questions) ? questions.length : 0}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">{examTitle}</span>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>Section {currentSectionNumber}/{totalSections}</span>
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
      {currentSection && (
        <div className={`${getSectionColor(currentSection.name)} text-white`}>
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-3 mb-2">
              {getSectionIcon(currentSection.name)}
              <h1 className="text-2xl font-bold">
                {currentSection.name.charAt(0).toUpperCase() + currentSection.name.slice(1)} Section
              </h1>
            </div>
            <div className="flex items-center justify-between text-sm opacity-90">
              <span>Answer all questions to the best of your ability</span>
              <span>Duration: {currentSection.duration_minutes} minutes</span>
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Questions ({getAnsweredCount()}/{Array.isArray(questions) ? questions.length : 0} answered)
          </h2>
          <div className="text-sm text-gray-500">
            Section {currentSectionNumber} of {totalSections}
          </div>
        </div>

        {Array.isArray(questions) && questions.map((q, index) => {
          const questionNumber = index + 1;
          const isAnswered = answers[q.id] !== undefined;
          
          return (
            <div key={q.id} className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isAnswered ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {isAnswered ? <CheckCircle className="w-4 h-4" /> : questionNumber}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {renderMathContent(q.question_text)}
                    {/* Show exponential notation also for questions */}
                    {typeof q.question_text === 'string' && q.question_text.match(/[√∛∜⁵²³⁴⁵₂₃π]|x²|x³|\^|\\_|log₂/) && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span>Exponential form: </span>
                        <InlineMath math={convertRadicalToExponential(q.question_text)} />
                      </div>
                    )}
                  </h3>
                  
                  {q.question_type === 'mcq' && q.options && (
                    <div className="space-y-3">
                      {q.options.map((option, optIndex) => (
                        <label
                          key={optIndex}
                          className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            answers[q.id] === option.text
                              ? 'bg-blue-50 border-blue-300 text-blue-900'
                              : 'hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={option.text}
                            checked={answers[q.id] === option.text}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="text-blue-600"
                          />
                          <span className="flex-1">
                            {renderMathContent(option.text)}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {q.question_type === 'essay' && (
                    <textarea
                      className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Write your essay here..."
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    />
                  )}
                  
                  {isAnswered && (
                    <div className="mt-3 flex items-center space-x-2 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Answer recorded</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Submit Button */}
        <div className="text-center mt-8">
          <button 
            onClick={() => handleSubmitSection(false)} 
            disabled={submitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium text-lg flex items-center justify-center mx-auto space-x-2"
          >
            <span>
              {currentSectionNumber === totalSections ? 'Submit Final Section' : `Submit ${currentSection?.name} Section`}
            </span>
            <ArrowRight className="w-5 h-5"/>
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Make sure to review your answers before submitting
          </p>
        </div>
      </div>

      {/* Footer */}
  
    </div>
  );
};

export default OnlineExam;
