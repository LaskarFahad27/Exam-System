import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import logo from "../src/assets/logo.png"

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const startExam = () => {
    navigate("/online_exam"); 
  };

  const adminLogin = () => {
    navigate("/adminlogin"); 
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              Tailored for admission coaching centers to prepare students like real NSU, BRACU, AUST exams.
            </p>
          </div>
          
          <div className="mt-16 relative">
              <div id='box' className="flex flex-col items-center space-y-4">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Select Your Preferred University</h3>
                <ul className="space-y-4">
                  <li>
                    <button 
                      onClick={() => navigate("/exam/nsu")} 
                      className="text-blue-600 border border-blue-600 px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-md w-64 text-center"
                    >
                      NSU
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigate("/exam/bracu")} 
                      className="text-blue-600 border border-blue-600 px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-md w-64 text-center"
                    >
                      BRACU
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigate("/exam/aust")} 
                       className="text-blue-600 border border-blue-600 px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-md w-64 text-center"
                    >
                      AUST
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigate("/exam/ewu")} 
                       className="text-blue-600 border border-blue-600 px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-md w-64 text-center"
                    >
                      EWU
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigate("/exam/uiu")} 
                       className="text-blue-600 border border-blue-600 px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-md w-64 text-center"
                    >
                      UIU
                    </button>
                  </li>
                </ul>
              </div>
          </div>
        </div>
      </section>
      {/* Footer */}
<footer className="bg-gray-800 text-white py-6 mt-12">
  <div className="max-w-7xl mx-auto px-4 text-center">
    <p className="text-sm">&copy; {new Date().getFullYear()} Developed by <span className="font-semibold">CoreCraft</span></p>
  </div>
</footer>

    </div>
  );
};

export default LandingPage;