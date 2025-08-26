import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Book, Calendar, User, Shield, ChevronRight } from 'lucide-react';
import { getExamsForUser, startExam } from './utils/api';
import { navigateAndScrollToTop } from './utils/navigation';
import toast from 'react-hot-toast';

const ExamSelectionPage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingExam, setStartingExam] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await getExamsForUser();
      if (response.success) {
        setExams(response.data);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
      // If token is invalid, redirect to login
      if (error.message.includes('Authentication')) {
        localStorage.removeItem('studentToken');
        navigateAndScrollToTop(navigate, '/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (examId) => {
    try {
      setStartingExam(examId);
      const response = await startExam(examId);
      
      if (response.success) {
        toast.success('Exam started successfully!');
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
      toast.error('Failed to start exam: ' + error.message);
    } finally {
      setStartingExam(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    navigateAndScrollToTop(navigate, '/');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading available exams...</p>
        </div>
      </div>
    );
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
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
      </div>
    </div>
  );
};

export default ExamSelectionPage;
