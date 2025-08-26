import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { navigateAndScrollToTop } from '../utils/navigation';
import Header from '../components/Header';
import { 
  CheckCircle, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import logo from "../assets/logo.png"
import LogRegModal from '../LogRegModal';
const NSU_Exam = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const studentToken = localStorage.getItem('studentToken');
    setIsLoggedIn(!!studentToken);
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Check if user is logged in after modal is closed
    const studentToken = localStorage.getItem('studentToken');
    setIsLoggedIn(!!studentToken);
    if (studentToken) {
      setErrorMessage('');
    }
  };

  const handleStartExam = () => {
    if (isLoggedIn) {
      navigateAndScrollToTop(navigate, "/exam-selection");
    } else {
      setErrorMessage('Please login to access the examinations');
      openModal();
    }
  };

  const handleLogin = () => {
    openModal();
  };

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    setIsLoggedIn(false);
  };

  const adminLogin = () => {
    navigateAndScrollToTop(navigate, "/adminlogin");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
             <span className="text-blue-600">NSU </span>Standard Online Exam
            </h1>
          </div>
          
          <div className="mt-16 relative">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl mx-auto">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-gray-500 text-sm">Exam Pattern</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className='section1'>
                  <div className="text-lg font-semibold text-gray-900 mb-2">Section 1 :</div>
                               <div>English (Grammar and Vocabulary)</div> 
                               <div>Question Type - MCQ</div> 
                               <div>Number of Questions - 40</div> 
                               <div>Time - 20 Min</div> 
                  </div><br/>
                  </div>
                  <div>
                  <div className='section2'>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Section 2 :</h3>
                               <div>Quantitative Aptitude (General Math)</div> 
                               <div>Question Type - MCQ</div> 
                               <div>Number of Questions - 50</div> 
                               <div>Time - 60 Min</div> 
                  </div><br/>
                  </div>
                  <div>
                  <div className='section3'>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Section 3 :</h3>
                               <div>Reading Comprehension</div> 
                               <div>Question Type - MCQ</div> 
                               <div>Number of Questions - 20</div> 
                               <div>Time - 20 Min</div> 
                  </div>
                </div>
                <div>
                  <div className='section4'>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Section 4 :</h3>
                               <div>Composition (Essay)</div> 
                               <div>Question Type - Writing</div> 
                               <div>Number of Questions - 1</div> 
                               <div>Time - 20 Min</div> 
                  </div>
                </div>
              </div>
              <div><br/>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Keep Your Camera Active</span>
                    </div>
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Make Sure That You Are In Full Screen Mode</span>
                    </div>
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">You Are Not Able To Switch Tab During Your Exam</span>
                    </div>
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">You Are Not Able To Open Developer Tool</span>
                    </div>
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">You Are Not Able To Go Back To The Previous Section While A Section Is In Progress</span>
                    </div>
                  </div>
                </div>
            </div>
          </div><br/><br/>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                      onClick={handleStartExam}>
                   Start Exam
                <ChevronRight className="inline-block ml-2 w-5 h-5" />
              </button>
            </div>
            {!isLoggedIn && errorMessage && (
              <div className="text-center mt-4">
                <p className="text-red-600 text-sm">{errorMessage}</p>
              </div>
            )}
        </div>
      </section>

      {/* Render the LogRegModal component */}
      <LogRegModal isOpen={isModalOpen} onClose={closeModal} />

    </div>
  );
};

export default NSU_Exam;
