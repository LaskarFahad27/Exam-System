import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Header from './components/Header';
import { navigateAndScrollToTop } from './utils/navigation';

// Import university logos
import { nsuLogo, bracuLogo, austLogo, ewuLogo, uiuLogo } from './assets/universityLogos';

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const studentToken = localStorage.getItem('studentToken');
    setIsLoggedIn(!!studentToken);
  }, []);

  const adminLogin = () => {
    navigateAndScrollToTop(navigate, "/adminlogin");
  };

  // University data with logos and names
  const universities = [
    { id: 'nsu', name: 'North South University', path: '/exam/nsu', image: nsuLogo },
    { id: 'bracu', name: 'BRAC University', path: '/exam/bracu', image: bracuLogo },
    { id: 'aust', name: 'Ahsanullah University of Science and Technology', path: '/exam/aust', image: austLogo },
    { id: 'ewu', name: 'East West University', path: '/exam/ewu', image: ewuLogo },
    { id: 'uiu', name: 'United International University', path: '/exam/uiu', image: uiuLogo },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
              Smart, Secure & <span className="text-blue-600">University-Style</span> Online Exams
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-6 md:mb-10 max-w-4xl mx-auto">
              Tailored for admission coaching centers to prepare students like real NSU, BRACU, AUST, EWU, UIU exams.
            </p>
          </div>
        </div>
      </section>

      {/* University Cards Section */}
      <section className="py-8 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-6 md:mb-12">
            Select Your Preferred University
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {universities.map((university) => (
              <div 
                key={university.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
                onClick={() => navigateAndScrollToTop(navigate, university.path)}
              >
                <div className="h-36 md:h-48 bg-gray-50 flex items-center justify-center p-4 md:p-6 overflow-hidden">
                  <img 
                    src={university.image} 
                    alt={university.name} 
                    className="w-full h-full object-contain transition-all duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{university.name}</h3>
                  <p className="text-sm md:text-base text-blue-600 font-medium">Prepare for {university.id.toUpperCase()} Admission</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-6 md:mb-12">
            Why Choose Our Exam System?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
              <div className="text-blue-600 text-3xl md:text-4xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Secure Environment</h3>
              <p className="text-sm md:text-base text-gray-600">Advanced proctoring features to ensure exam integrity and prevent cheating.</p>
            </div>
            
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
              <div className="text-blue-600 text-3xl md:text-4xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Customizable Format</h3>
              <p className="text-sm md:text-base text-gray-600">Exam patterns that exactly match the format of target universities.</p>
            </div>
            
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
              <div className="text-blue-600 text-3xl md:text-4xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Detailed Analytics</h3>
              <p className="text-sm md:text-base text-gray-600">Comprehensive performance reports to identify strengths and areas for improvement.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;