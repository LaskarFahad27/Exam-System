import logo from "../assets/logo.png"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogRegModal from "../LogRegModal";
import { 
  CheckCircle, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
const Header = () => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
      const [isLogRegModalOpen, setIsLogRegModalOpen] = useState(false);
       const [errorMessage, setErrorMessage] = useState('');

      const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const studentToken = localStorage.getItem('studentToken');
        setIsLoggedIn(!!studentToken);
      }, []);
    
       const handleLogin = () => {
    setIsLogRegModalOpen(true);
  };

    const handleLogout = () => {
    localStorage.removeItem('studentToken');
    setIsLoggedIn(false);
  };

    const adminLogin = () => {
    navigate("/adminlogin"); 
  };
  return (
    <>
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
                {/* <a href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Features</a>
                <a href="#pricing" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Pricing</a>
                <a href="#testimonials" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Testimonials</a> */}
                <a href="#contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Contact</a>
                <button className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                      onClick={adminLogin}>
                   Admin Login
                </button>
                {isLoggedIn ? (
                  <button className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        onClick={handleLogout}>
                    Logout
                  </button>
                ) : (
                  <button className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        onClick={handleLogin}>
                    Login
                  </button>
                )}
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
              {/* <a href="#features" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">Pricing</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">Testimonials</a> */}
              <a href="#contact" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">Contact</a>
              <div onClick={adminLogin} className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">Admin Login</div>
              {isLoggedIn ? (
                <div onClick={handleLogout} className="text-red-600 hover:text-red-700 block px-3 py-2 text-base font-medium">Logout</div>
              ) : (
                <div onClick={handleLogin} className="text-green-600 hover:text-green-700 block px-3 py-2 text-base font-medium">Login</div>
              )}
            </div>
          </div>
        )}
      </nav>
      <LogRegModal 
        isOpen={isLogRegModalOpen} 
        onClose={() => {
          setIsLogRegModalOpen(false);
          // Check if user is logged in after modal is closed
          const studentToken = localStorage.getItem('studentToken');
          setIsLoggedIn(!!studentToken);
          if (studentToken) {
            setErrorMessage('');
          }
        }} 
      />
      </>
  );
};

export default Header;