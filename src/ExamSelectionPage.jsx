import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Book, Calendar, User, Shield, ChevronRight, Award, BarChart2, CheckCircle2 } from 'lucide-react';
import { getExamsForUser, startExam, getUserScores } from './utils/api';
import { logout } from './utils/auth';
import { navigateAndScrollToTop } from './utils/navigation';
import toastService from './utils/toast.jsx';

const ExamSelectionPage = () => {
  const [exams, setExams] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingScores, setLoadingScores] = useState(true);
  const [startingExam, setStartingExam] = useState(null);
  const [activeTab, setActiveTab] = useState('exams'); // 'exams' or 'scores'
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'exams') {
      fetchExams();
    } else if (activeTab === 'scores') {
      fetchScores();
    }
  }, [activeTab]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await getExamsForUser();
      if (response.success) {
        setExams(response.data);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      toastService.error('Failed to load exams');
      // If token is invalid, redirect to login
      if (error.message.includes('Authentication')) {
        localStorage.removeItem('studentToken');
        navigateAndScrollToTop(navigate, '/');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchScores = async () => {
    try {
      setLoadingScores(true);
      const response = await getUserScores();
      if (response.success) {
        setScores(response.data);
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
      toastService.error('Failed to load scores');
      // If token is invalid, redirect to login
      if (error.message.includes('Authentication')) {
        localStorage.removeItem('studentToken');
        navigateAndScrollToTop(navigate, '/');
      }
    } finally {
      setLoadingScores(false);
    }
  };

  const handleStartExam = async (examId) => {
    try {
      setStartingExam(examId);
      const response = await startExam(examId);
      
      if (response.success) {
        toastService.success('Exam started successfully!');
        // Navigate to online exam with the user_exam_id
        navigate('/online_exam', { 
          state: { 
            userExamId: response.data.user_exam_id,
            examTitle: response.data.exam_title,
            examDescription: response.data.exam_description,
            startedAt: response.data.started_at
          } 
        });
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      toastService.error('Failed to start exam: ' + error.message);
    } finally {
      setStartingExam(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout(); // Call the API logout function
      navigateAndScrollToTop(navigate, '/');
      toastService.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // If there's an error with the API call, still remove the token as a fallback
      localStorage.removeItem('studentToken');
      navigateAndScrollToTop(navigate, '/');
      toastService.success('Logged out successfully');
    }
  };

  const renderLoadingState = (message) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );

  if (loading && activeTab === 'exams') {
    return renderLoadingState('Loading available exams...');
  }

  if (loadingScores && activeTab === 'scores') {
    return renderLoadingState('Loading your scores...');
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <span className="text-lg md:text-xl font-bold text-gray-900">Exam Portal</span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Student Dashboard</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-2 py-1 sm:px-4 sm:py-2 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex space-x-1 bg-gray-200 rounded-lg p-1 mb-8 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'exams' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <Book className="w-5 h-5" />
            <span>Exams</span>
          </button>
          <button
            onClick={() => setActiveTab('scores')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'scores' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <Award className="w-5 h-5" />
            <span>Scores</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'exams' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Exams</h1>
                <p className="text-gray-600">Select an exam to begin your assessment</p>
              </div>

              {exams.length === 0 ? (
                <div className="text-center py-12">
                  <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Exams Available</h3>
                  <p className="text-gray-600">There are currently no exams available for you to take.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {exams.map((exam) => (
                    <div
                      key={exam.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Book className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">
                              {exam.university_name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{exam.total_duration_minutes} min</span>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{exam.description}</p>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Created: {new Date(exam.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleStartExam(exam.id)}
                          disabled={startingExam === exam.id}
                          className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                            startingExam === exam.id
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {startingExam === exam.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Starting...</span>
                            </>
                          ) : (
                            <>
                              <span>Start Exam</span>
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'scores' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Exam Scores</h1>
                <p className="text-gray-600">View your performance on completed exams</p>
              </div>

              {scores.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Scores Available</h3>
                  <p className="text-gray-600">You haven't completed any exams yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {scores.map((score) => (
                    <div
                      key={score.exam_id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Award className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">
                              Exam Results
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              score.average_score >= 70 
                                ? 'bg-green-100 text-green-800' 
                                : score.average_score >= 40 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {score.average_score}% Average
                            </span>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-4">{score.exam_title}</h3>
                        
                        <div className="space-y-3 mb-4">
                          {score.sections.map((section) => (
                            <div key={section.section_id} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="text-sm font-semibold capitalize">
                                  {section.section_name}
                                </h4>
                                <div className="flex items-center">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    section.score_percentage >= 70 
                                      ? 'bg-green-100 text-green-800' 
                                      : section.score_percentage >= 40 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {section.score_percentage}%
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{section.correct_answers} correct</span>
                                </div>
                                <div>
                                  <span>Out of {section.total_questions}</span>
                                </div>
                              </div>
                              {/* Progress bar */}
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    section.score_percentage >= 70 
                                      ? 'bg-green-500' 
                                      : section.score_percentage >= 40 
                                      ? 'bg-yellow-500' 
                                      : 'bg-red-500'
                                  }`} 
                                  style={{ width: `${section.score_percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <BarChart2 className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-600">Overall Performance</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamSelectionPage;
