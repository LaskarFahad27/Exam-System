import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle, ArrowRight, User, Shield, BookOpen, Calculator, Edit, Menu, Award, XCircle, FileText } from 'lucide-react';
import { getNextSection, submitSectionAnswers, getExamResults } from './utils/api';
import { navigateAndScrollToTop } from './utils/navigation';
import toastService from './utils/toast.jsx';
import { isSectionSubmitted, markSectionSubmitted, clearSectionSubmitted, clearExamSubmissionFlags } from './utils/examSubmission';
import { initializeExamSecurity } from './utils/examSecurity.js';
import { SecurityModalContainer } from './utils/securityModal.jsx';
import MathDisplay from './components/MathDisplay';
import { renderContent, renderMathContent } from './utils/mathUtils';
import QuestionImage from './components/QuestionImage';

// Using mathUtils.jsx for all math rendering functionality

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

  // Initialize security features
  useEffect(() => {
    // Initialize security features and get cleanup function
    const cleanupSecurity = initializeExamSecurity(navigate);
    
    // Return cleanup function
    return () => {
      cleanupSecurity();
    };
  }, [navigate]);

  useEffect(() => {
    // Check if we have the required state
    if (!userExamId) {
      toastService.error('Invalid exam session. Redirecting to exam selection.');
      navigateAndScrollToTop(navigate, '/exam-selection');
      return;
    }
    
    // Check authentication
    const studentToken = localStorage.getItem('studentToken');
    if (!studentToken) {
      toastService.error('Please login to continue.');
      navigateAndScrollToTop(navigate, '/');
      return;
    }

    // Clear any existing submission flags for this exam when starting
    clearExamSubmissionFlags(userExamId);

    // Load the first/next section
    loadNextSection();
  }, [userExamId, navigate]);

  const autoSubmitSection = async () => {
    // Only proceed if we have a valid section and not already submitting
    if (!currentSection || !currentSection.id) {
      console.error('No current section available for auto-submission');
      return;
    }
    
    // Immediately check if we're already in submission process
    if (submitting) {
      console.log('Already in submission process, preventing duplicate auto-submission');
      return;
    }
    
    // Check if this section has already been submitted
    if (isSectionSubmitted(userExamId, currentSection.id)) {
      console.log('Section already auto-submitted, waiting for server response');
      return;
    }
    
    // Immediately scroll to the top of the page
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    
    // Start submission process and mark state first to prevent race conditions
    setSubmitting(true);
    
    // Mark as submitted immediately to prevent duplicate submissions
    // This needs to happen before any async operations
    markSectionSubmitted(userExamId, currentSection.id);
    
    console.log('Starting auto-submission for section:', currentSection.id);
    toastService.error('Time is up! Submitting your answers automatically...', { duration: 3000 });
    
    // Format answers for API - using correct format with answer_text
    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      question_id: parseInt(questionId),
      answer_text: answer
    }));

    console.log('Auto-submitting answers:', {
      userExamId,
      sectionId: currentSection.id,
      answers: formattedAnswers
    });

    // Store current section info locally to prevent closures from accessing changing state
    const sectionId = currentSection.id;
    const currentSectionNum = currentSectionNumber;
    const totalSectionCount = totalSections;

    try {
      // Submit answers
      await submitSectionAnswers(userExamId, sectionId, formattedAnswers);
      
      // After successful submission, scroll to top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      
      toastService.warning('Time expired! Section submitted automatically.', { 
        duration: 4000,
        icon: '⏱️'
      });
      
      // Check if there are more sections
      if (currentSectionNum < totalSectionCount) {
        console.log('Auto-submit successful, loading next section...');
        // Clear the submission flag for this section
        clearSectionSubmitted(userExamId, sectionId);
        // Move to next section without page refresh
        setTimeout(() => {
          loadNextSection();
        }, 1500);
      } else {
        console.log('All sections completed');
        setExamCompleted(true);
        toastService.success('Exam completed successfully!');
      }
    } catch (error) {
      console.error('Error in auto-submission:', error);
      toastService.error('Auto-submission failed, but proceeding to next section');
      
      // Even if submission fails, proceed to next section after a delay
      if (currentSectionNum < totalSectionCount) {
        setTimeout(() => {
          clearSectionSubmitted(userExamId, sectionId);
          loadNextSection();
        }, 3000);
      }
    }
  };

  // Timer effect with improved auto-submission handling
  useEffect(() => {
    // Keep the timer running
    if (timeLeft > 0 && !examCompleted && !submitting && currentSection) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      
      // Show warning when time is running low using the special timer warning
      if (timeLeft === 60) {
        toastService.timerWarning('1 minute remaining in this section!');
      } else if (timeLeft === 30) {
        toastService.timerWarning('30 seconds remaining in this section!');
      } else if (timeLeft === 10) {
        toastService.timerWarning('10 seconds remaining! Section will be auto-submitted soon.');
      }
      
      return () => clearTimeout(timer);
    } 
    // Handle time expiration only once
    else if (timeLeft === 0 && !examCompleted && currentSection) {
      console.log('Time expired, checking submission status');
      
      // Create a unique key for this specific auto-submission attempt
      const autoSubmitKey = `auto_submit_${userExamId}_${currentSection.id}_triggered`;
      
      // Check if we've already triggered auto-submission for this section
      if (localStorage.getItem(autoSubmitKey) === 'true') {
        console.log('Auto-submission already triggered for this section, preventing duplicate');
        return;
      }
      
      // Prevent multiple triggers by checking both React state and localStorage flag
      if (submitting || isSectionSubmitted(userExamId, currentSection.id)) {
        console.log('Already submitting or submitted, not triggering another submission');
        
        // Safety timeout to prevent getting stuck if something goes wrong with submission
        const stuckTimer = setTimeout(() => {
          console.log('Safety timeout: Ensuring we move to next section if submission is stuck');
          // Only proceed if we're still on this section and not completed
          if (!examCompleted && currentSection) {
            clearSectionSubmitted(userExamId, currentSection.id);
            localStorage.removeItem(autoSubmitKey);
            setSubmitting(false);
            if (currentSectionNumber < totalSections) {
              loadNextSection();
            }
          }
        }, 15000); // Give 15 seconds before forcing next section
        
        return () => clearTimeout(stuckTimer);
      }
      
      // Mark that we've triggered auto-submission for this section
      localStorage.setItem(autoSubmitKey, 'true');
      
      // If we're not already submitting, trigger auto-submission
      console.log('Time expired, triggering auto-submission');
      setSubmitting(true); // Mark as submitting immediately to prevent race conditions
      
      // Use setTimeout to ensure state update has time to propagate
      // This helps prevent multiple submissions
      setTimeout(() => {
        // Double-check we still need to submit
        if (!isSectionSubmitted(userExamId, currentSection.id)) {
          autoSubmitSection();
        }
      }, 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, examCompleted, submitting]);

  useEffect(() => {
    // When the exam is completed, clear all localStorage flags for this exam
    if (examCompleted && userExamId) {
      // Clear all localStorage items related to this exam
      clearExamSubmissionFlags(userExamId);
    }
  }, [examCompleted, userExamId]);

  // This function is now provided by the examSubmission.js utility module
  // and can be safely removed here
  /*
  const clearExamLocalStorage = (examId) => {
    // Get all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Check if the key is related to this exam
      if (key && key.startsWith(`exam_${examId}`)) {
        localStorage.removeItem(key);
      }
    }
  };
  */

  const loadNextSection = async () => {
    try {
      // Scroll to top immediately when loading a new section
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      
      setLoading(true);
      console.log('Loading next section for userExamId:', userExamId);
      
      // Reset submission state
      setSubmitting(false);
      
      // Attempt to get the next section
      const response = await getNextSection(userExamId);
      
      if (response.success) {
        const { section, questions, total_sections, current_section_number, sections_completed } = response.data;
        
        console.log('Next section loaded:', {
          sectionName: section.name,
          currentSectionNumber: current_section_number,
          totalSections: total_sections,
          sectionsCompleted: sections_completed
        });
        
        // If the previous section for this exam was marked as submitted but we're still getting a new section,
        // make sure to clear any existing submission flags
        if (currentSection && currentSection.id) {
          // Clear both submission and auto-submission flags for the previous section
          clearSectionSubmitted(userExamId, currentSection.id);
          // Clear auto-submit trigger flag
          const previousAutoSubmitKey = `auto_submit_${userExamId}_${currentSection.id}_triggered`;
          localStorage.removeItem(previousAutoSubmitKey);
        }
        
        // Clear any possible existing flags for the new section (in case of a previous incomplete attempt)
        clearSectionSubmitted(userExamId, section.id);
        const newAutoSubmitKey = `auto_submit_${userExamId}_${section.id}_triggered`;
        localStorage.removeItem(newAutoSubmitKey);
        
        // Instead of using navigate, directly update the state
        setCurrentSection(section);
        setQuestions(questions);
        setTimeLeft(section.duration_minutes * 60); // Convert to seconds
        setCurrentSectionNumber(current_section_number);
        setTotalSections(total_sections);
        setSectionsCompleted(sections_completed);
        setAnswers({}); // Reset answers for new section
        
        // Scroll to top without refreshing the page
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }
    } catch (error) {
      console.error('Error loading section:', error);
      
      // More specific error handling
      if (error.message.includes('No more sections')) {
        console.log('No more sections available - exam completed');
        setExamCompleted(true);
        toastService.success('Exam completed successfully!');
      } else if (error.message.includes('completed')) {
        console.log('Exam already completed');
        setExamCompleted(true);
        toastService.success('Exam completed successfully!');
      } else if (error.message.includes('access this section yet')) {
        console.log('Cannot access next section - likely exam completed');
        // Wait a bit longer before marking as completed, might be a timing issue
        setTimeout(() => {
          setExamCompleted(true);
          toastService.success('Exam completed successfully!');
        }, 2000);
      } else if (error.message.includes('Authentication')) {
        toastService.error('Session expired. Please login again.');
        localStorage.removeItem('studentToken');
        navigateAndScrollToTop(navigate, '/');
      } else {
        toastService.error('Failed to load section: ' + error.message);
        console.error('Unexpected error in loadNextSection:', error);
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

  const handleSubmitSection = async (autoSubmit = false, e) => {
    // Prevent default form submission if event is provided
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    // Add null check for currentSection
    if (!currentSection || !currentSection.id) {
      console.error('No current section available');
      toastService.error('No section available to submit');
      return;
    }

    // Check if this section has already been submitted using the utility function
    if (isSectionSubmitted(userExamId, currentSection.id)) {
      console.log('Section already submitted, waiting for server response or moving to next section');
      return;
    }
    
    // For manual submissions, clear any auto-submit flags to prevent conflicts
    if (!autoSubmit) {
      const autoSubmitKey = `auto_submit_${userExamId}_${currentSection.id}_triggered`;
      localStorage.removeItem(autoSubmitKey);
    }

    // If this is an auto-submit triggered by timer expiration, use the dedicated function
    if (autoSubmit) {
      return autoSubmitSection();
    }

    try {
      // Immediately scroll to the top of the page
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      
      setSubmitting(true);
      // Mark this section as being submitted to prevent duplicate submissions
      markSectionSubmitted(userExamId, currentSection.id);
      
      // Format answers for API - using correct format with answer_text
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: parseInt(questionId),
        answer_text: answer
      }));

      console.log('Submitting answers:', {
        userExamId,
        sectionId: currentSection.id,
        answers: formattedAnswers
      });

      await submitSectionAnswers(userExamId, currentSection.id, formattedAnswers);
      
      // After successful submission, scroll to top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      
      if (autoSubmit) {
        toastService.warning('Time expired! Section submitted automatically.', { 
          duration: 4000,
          icon: '⏱️'
        });
      } else {
        toastService.success('Section submitted successfully!');
      }

      console.log('Section submitted. Current section:', currentSectionNumber, 'Total sections:', totalSections);

      // Check if there are more sections
      if (currentSectionNumber < totalSections) {
        console.log('Loading next section...');
        // Clear the current section's submission flag before loading the next
        clearSectionSubmitted(userExamId, currentSection.id);
        
        // Load next section after a brief delay
        setTimeout(() => {
          loadNextSection();
        }, 1500);
      } else {
        console.log('All sections completed');
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
      
      // If submission fails, we should still allow moving to the next section after a timeout
      if (currentSectionNumber < totalSections) {
        console.log('Submission failed but proceeding to next section...');
        setTimeout(() => {
          // Clear the submission flag so we can proceed
          clearSectionSubmitted(userExamId, currentSection.id);
          loadNextSection();
        }, 3000);
      }
    } finally {
      // Keep submitting state true if it failed due to network issues
      // so that we don't trigger multiple submissions
      if (!isSectionSubmitted(userExamId, currentSection.id)) {
        setSubmitting(false);
      }
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
                              {/* Display question image if available */}
                              {(question.image_id || question.image_path) && (
                                <div className="mb-3 border border-gray-200 rounded-lg p-2 bg-white">
                                  {question.image_id ? (
                                    <QuestionImage 
                                      imageId={question.image_id} 
                                      alt={`Image for question`}
                                      className="max-h-[200px] h-auto rounded-lg mx-auto"
                                      onError={(e) => console.error('Failed to load image:', e)}
                                    />
                                  ) : question.image_path ? (
                                    <img 
                                      src={question.image_path.startsWith('http') ? question.image_path : `${BACKEND_URL}${question.image_path}`} 
                                      alt="Question image" 
                                      className="max-w-full h-auto rounded-lg mx-auto max-h-[200px]"
                                      onError={(e) => {
                                        console.error('Failed to load image:', e);
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  ) : null}
                                </div>
                              )}
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
              onClick={() => navigateAndScrollToTop(navigate, '/exam-selection')}
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
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {timeLeft === 0 ? 'Time Expired - Auto Submitting' : 'Submitting Section'}
          </h2>
          <p className="text-gray-600 mb-4">
            {timeLeft === 0 
              ? 'Your answers are being submitted automatically as the allotted time for this section has ended.'
              : 'Your answers are being submitted...'}
          </p>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800">
            <p className="font-medium mb-1">Section Summary</p>
            <p>Questions Answered: {getAnsweredCount()}/{questions.length}</p>
            <p>Section: {currentSection?.name || ''} ({currentSectionNumber}/{totalSections})</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Security Modal Container */}
      <SecurityModalContainer />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <span className="text-base sm:text-lg font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-none">{examTitle}</span>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>Section {currentSectionNumber}/{totalSections}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex sm:hidden items-center mr-3 text-xs text-gray-600">
              <User className="w-3 h-3 mr-1" />
              <span>Section {currentSectionNumber}/{totalSections}</span>
            </div>
            <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${timeLeft < 300 ? 'text-red-500' : 'text-blue-600'}`} />
            <span className={`text-base sm:text-xl font-mono font-bold ${
              timeLeft < 60 ? 'text-red-500 animate-pulse' : 
              timeLeft < 300 ? 'text-red-500' : 
              'text-gray-900'
            }`}>
              {formatTime(timeLeft)}
            </span>
            {timeLeft < 300 && (
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                {timeLeft < 60 && <span className="text-xs text-red-500 ml-1 hidden sm:inline">Auto-submit soon!</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Header */}
      {currentSection && (
        <div className={`${getSectionColor(currentSection.name)} text-white`}>
          <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
            <div className="flex items-center space-x-3 mb-2">
              {getSectionIcon(currentSection.name)}
              <h1 className="text-xl sm:text-2xl font-bold">
                {currentSection.name.charAt(0).toUpperCase() + currentSection.name.slice(1)} Section
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm opacity-90">
              <span className="mb-1 sm:mb-0">Answer all questions to the best of your ability</span>
              <span>Duration: {currentSection.duration_minutes} minutes</span>
            </div>
            
            {/* Time progress bar */}
            <div className="mt-3">
              <div className="h-1.5 w-full bg-white bg-opacity-30 rounded-full overflow-hidden">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-1000 ${
                    timeLeft < 60 ? 'bg-red-300 animate-pulse' : 
                    timeLeft < 300 ? 'bg-red-300' : 
                    'bg-white'
                  }`} 
                  style={{ 
                    width: `${(timeLeft / (currentSection.duration_minutes * 60)) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1 text-white text-opacity-80">
                <span>{Math.floor(timeLeft / 60)} minutes left</span>
                <span>{Math.floor((timeLeft / (currentSection.duration_minutes * 60)) * 100)}% time remaining</span>
              </div>
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
                  {/* Display question image if available */}
                  {(q.image_id || q.image_path) && (
                    <div className="mb-4 border border-gray-200 rounded-lg p-2">
                      {q.image_id ? (
                        <QuestionImage 
                          imageId={q.image_id} 
                          alt={`Image for question ${questionNumber}`}
                          className="max-h-[300px] h-auto rounded-lg mx-auto"
                          onError={(e) => console.error('Failed to load image:', e)}
                        />
                      ) : q.image_path ? (
                        <img 
                          src={q.image_path.startsWith('http') ? q.image_path : `${BACKEND_URL}${q.image_path}`} 
                          alt="Question image" 
                          className="max-w-full h-auto rounded-lg mx-auto max-h-[300px]"
                          onError={(e) => {
                            console.error('Failed to load image:', e);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : null}
                    </div>
                  )}
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    <MathDisplay content={q.question_text} />
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
                            <MathDisplay content={option.text} />
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
            onClick={(e) => {
              e.preventDefault();
              // Scroll to top immediately for visual feedback
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
              });
              handleSubmitSection(false, e);
            }} 
            disabled={submitting || !currentSection}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium text-lg flex items-center justify-center mx-auto space-x-2"
          >
            <span>
              {currentSectionNumber === totalSections ? 'Submit Final Section' : `Submit ${currentSection?.name || 'Current'} Section`}
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
