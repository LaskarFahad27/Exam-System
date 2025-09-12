import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptExamAccess, startExam } from '../utils/examAccess';
import toastService from '../utils/toast.jsx';
import Footer from '../components/Footer';
import Header from '../components/Header';

function ExamAccess() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const checkExamAccess = async () => {
      try {
        setLoading(true);
        const result = await attemptExamAccess(examId);
        
        if (result.success) {
          setExam(result.data);
          setRequiresAuth(result.requiresAuth);
          
          // If authenticated and has access, redirect to exam
          if (result.requiresAuth && localStorage.getItem('studentToken')) {
            handleStartExam();
          }
        } else {
          setError(result.message);
          if (result.requiresAuth && !localStorage.getItem('studentToken')) {
            setRequiresAuth(true);
          }
        }
      } catch (error) {
        console.error('Error accessing exam:', error);
        setError(error.message || 'Failed to access exam');
      } finally {
        setLoading(false);
      }
    };
    
    checkExamAccess();
  }, [examId]);
  
  const handleStartExam = async () => {
    try {
      setLoading(true);
      const result = await startExam(examId);
      
      if (result.success) {
        toastService.success('Starting exam...');
        // Redirect to the online exam page with the exam ID
        navigate(`/online-exam/${examId}`);
      } else {
        setError(result.message || 'Unable to start exam');
        toastService.error(result.message || 'Unable to start exam');
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      setError(error.message || 'Failed to start exam');
      toastService.error(error.message || 'Failed to start exam');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = () => {
    // Store the current exam ID in localStorage for redirect after login
    localStorage.setItem('redirectExamId', examId);
    navigate('/');
    
    // Trigger the login modal to open
    // Using a small timeout to ensure navigation completes first
    setTimeout(() => {
      const event = new CustomEvent('openLoginModal');
      window.dispatchEvent(event);
    }, 100);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
            <p className="mt-4 text-lg">Loading exam details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    // Check if the error is about enrollment
    const isEnrollmentError = error.includes('enrolled users');
    
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-center text-red-600 mb-4">
              {isEnrollmentError ? "Enrollment Required" : "Access Error"}
            </h2>
            <p className="text-center mb-6">{error}</p>
            
            {requiresAuth && !isEnrollmentError && (
              <div className="text-center">
                <p className="mb-4">You need to log in to access this exam.</p>
                <button
                  onClick={handleLogin}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Log In
                </button>
              </div>
            )}
            
            {isEnrollmentError && (
              <div className="text-center">
                <p className="mb-4">Please contact your administrator for enrollment.</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Return to Home
                </button>
              </div>
            )}
            
            {!requiresAuth && !isEnrollmentError && (
              <div className="text-center">
                <button
                  onClick={() => navigate('/')}
                  className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Return to Home
                </button>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (exam && !requiresAuth) {
    // Public exam that requires enrollment
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-center mb-4">{exam.title}</h2>
            <div className="mb-6">
              <p className="mb-2"><span className="font-semibold">Subject:</span> {exam.subject}</p>
              <p className="mb-2"><span className="font-semibold">Duration:</span> {exam.duration} minutes</p>
              {exam.description && (
                <p className="mb-2"><span className="font-semibold">Description:</span> {exam.description}</p>
              )}
            </div>
            
            <div className="text-center">
              <p className="mb-4">Please log in to enroll in this exam.</p>
              <button
                onClick={handleLogin}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Log In to Continue
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-lg">Redirecting to exam...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ExamAccess;
