import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import logo from "../assets/logo.png"

const AUST_Exam = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const startExam = () => {
    navigate("/online_exam"); 
  };

  const adminLogin = () => {
    navigate("/adminlogin"); 
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Navigation */}
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
                <button className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                      onClick={adminLogin}>
                   Admin Login
              </button>
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
              <div onClick={adminLogin} className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">Admin Login</div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Smart, Secure & <span className="text-blue-600">University-Style</span> Online Exams
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto">
              AUST Exam System Is Under Development. It Will Be Launched Soon
            </p>
          </div>
          
          {/* <div className="mt-16 relative">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl mx-auto">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-gray-500 text-sm">Online Examination System</span>
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
                      onClick={startExam}>
                   Start Exam
                <ChevronRight className="inline-block ml-2 w-5 h-5" />
              </button>
            </div> */}
        </div>
      </section>
    </div>
  );
};

export default AUST_Exam;