import logo from "../assets/logo.png"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { navigateAndScrollToTop } from '../utils/navigation';
import { logout, getSessionCount } from '../utils/auth';
import LogRegModal from "../LogRegModal";
import DeviceManagementModal from "./DeviceManagementModal";
import { 
  CheckCircle, 
  ChevronRight,
  Menu,
  X,
  Monitor,
  Shield
} from 'lucide-react';
const Header = () => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLogRegModalOpen, setIsLogRegModalOpen] = useState(false);
    const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
    const [deviceCount, setDeviceCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const studentToken = localStorage.getItem('studentToken');
        setIsLoggedIn(!!studentToken);
        
        // Fetch device count if logged in
        if (studentToken) {
          fetchDeviceCount();
        }
        
        // Listen for custom event to open login modal
        const handleOpenLoginModal = () => {
          setIsLogRegModalOpen(true);
        };
        
        window.addEventListener('openLoginModal', handleOpenLoginModal);
        
        // Clean up event listener
        return () => {
          window.removeEventListener('openLoginModal', handleOpenLoginModal);
        };
      }, []);
      
    // Fetch the device count
    const fetchDeviceCount = async () => {
      try {
        const response = await getSessionCount();
        if (response && typeof response.count === 'number') {
          setDeviceCount(response.count);
        } else {
          // Default to 1 if count is not available
          setDeviceCount(1);
        }
      } catch (error) {
        console.error("Error fetching device count:", error);
        // Default to 1 if there's an error
        setDeviceCount(1);
      }
    };
    
    const handleLogout = async () => {
      try {
        await logout(); // Call the API logout function
        setIsLoggedIn(false);
        navigateAndScrollToTop(navigate, "/");
      } catch (error) {
        console.error('Logout error:', error);
        // If there's an error with the API call, still remove the token as a fallback
        localStorage.removeItem('studentToken');
        setIsLoggedIn(false);
        navigateAndScrollToTop(navigate, "/");
      }
    };

    const handleLogin = () => {
      setIsLogRegModalOpen(true);
    };
    
    const handleOpenDeviceModal = () => {
      setIsDeviceModalOpen(true);
    };
    
    const handleCloseDeviceModal = () => {
      setIsDeviceModalOpen(false);
      // Refresh device count after modal is closed
      fetchDeviceCount();
    };

    const adminLogin = () => {
    navigateAndScrollToTop(navigate, "/adminlogin"); 
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
                {isLoggedIn && (
                  <button 
                    onClick={handleOpenDeviceModal}
                    className="relative bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition-colors"
                    aria-label="Manage devices"
                  >
                    <Monitor className="w-5 h-5" />
                    {deviceCount > 1 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {deviceCount}
                      </span>
                    )}
                  </button>
                )}
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg rounded-b-lg">
              {/* <a href="#features" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">Pricing</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">Testimonials</a> */}
              <a href="#contact" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium rounded-md hover:bg-gray-50">Contact</a>
              <button onClick={adminLogin} className="w-full text-left text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium rounded-md hover:bg-gray-50">Admin Login</button>
              {isLoggedIn && (
                <button 
                  onClick={handleOpenDeviceModal} 
                  className="w-full text-left flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium rounded-md hover:bg-gray-50"
                >
                  <Monitor className="w-5 h-5" />
                  <span>Manage Devices</span>
                  {deviceCount > 1 && (
                    <span className="ml-auto bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                      {deviceCount}
                    </span>
                  )}
                </button>
              )}
              {isLoggedIn ? (
                <button onClick={handleLogout} className="w-full text-left text-red-600 hover:text-red-700 block px-3 py-2 text-base font-medium rounded-md hover:bg-red-50">Logout</button>
              ) : (
                <button onClick={handleLogin} className="w-full text-left text-green-600 hover:text-green-700 block px-3 py-2 text-base font-medium rounded-md hover:bg-green-50">Login</button>
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
            // Fetch device count if user just logged in
            fetchDeviceCount();
          }
        }} 
      />
      
      <DeviceManagementModal
        isOpen={isDeviceModalOpen}
        onClose={handleCloseDeviceModal}
      />
      </>
  );
};

export default Header;