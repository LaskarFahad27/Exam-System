import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import logo from "../src/assets/logo.png"

const NSU_Exam = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

    const handleGo = () => {
    if (name && email) {
      navigate("/online_exam");
    } else {
      alert("Please fill in both Name and Email fields.");
    }
  };

  const adminLogin = () => {
    navigate("/admin"); 
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
                      onClick ={() => setIsModalOpen(true)}>
                   Start Exam
                <ChevronRight className="inline-block ml-2 w-5 h-5" />
              </button>
            </div>
        </div>
      </section>

      {/* Modal */}
{isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {isLogin ? "Login" : "Register"}
        </h2>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setIsModalOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      {isLogin ? (
        // Login Form
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Email or Phone"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <div className="flex justify-end mt-6">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={handleGo}
            >
              Login
            </button>
          </div>
          <p className="text-sm text-center text-gray-600 mt-4">
            Don't registered?{" "}
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </p>
        </div>
      ) : (
        // Register Form
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="text"
            placeholder="Phone"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <div className="flex justify-end mt-6">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={handleGo}
            >
              Register
            </button>
          </div>
          <p className="text-sm text-center text-gray-600 mt-4">
            Already registered?{" "}
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
          </p>
        </div>
      )}
    </div>
  </div>
)}
      {/* Footer */}
<footer className="bg-gray-800 text-white py-6 mt-12">
  <div className="max-w-7xl mx-auto px-4 text-center">
    <p className="text-sm">&copy; {new Date().getFullYear()} Developed by <span className="font-semibold">CoreCraft</span></p>
  </div>
</footer>

    </div>
  );
};

export default NSU_Exam;