import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, Lock, User, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from './utils/api';
import toastService from './utils/toast.jsx';

const LogRegModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [errors, setErrors] = useState({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginId, setLoginId] = useState('');
  const [invalidMsg, setInvalidMsg] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  // Animation effect when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Handle modal close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300); // Match this with CSS transition duration
  };

  const validateForm = () => {
    let newErrors = {};

    if (!name.trim() && !isLogin) newErrors.name = "Name is required";
    if (!email.trim() && !isLogin) {
      newErrors.email = "Email is required";
    } else if (!isLogin && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!phone.trim() && !isLogin) newErrors.phone = "Phone is required";
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        //setIsLogin(true);
        toastService.success("Registered successfully");
        localStorage.setItem("studentToken", data.data.token);
        handleClose();
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toastService.error(error.message || 'Failed to register. Please try again.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginId.trim() || !password.trim()) {
      setErrors({
        loginId: !loginId ? "Email or Phone is required" : undefined,
        password: !password ? "Password is required" : undefined,
      });
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginId, 
          password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setLoginId('');
        setPassword('');
        toastService.success("Logged in successfully");
        localStorage.setItem("studentToken", data.data.token);
        handleClose(); // Close the modal with animation
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setInvalidMsg(error.message || 'Failed to login. Please try again.');
      toastService.error("Failed to login");
    }
  };

  // Toggle between login and register forms with smooth transition
  const toggleForm = (mode) => {
    // Only change if it's different from current mode
    if ((mode === 'login' && !isLogin) || (mode === 'register' && isLogin)) {
      // Clear form fields and errors
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setLoginId('');
      setErrors({});
      setInvalidMsg('');
      
      // Add animation class and then change state
      setIsLogin(mode === 'login');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop with blur effect */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${isVisible ? 'bg-opacity-60 backdrop-blur-sm' : 'bg-opacity-0'}`} 
        onClick={handleClose}
      ></div>
      
      {/* Modal container */}
      <div 
        className={`relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transition-all duration-300 transform ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'
        }`}
      >
        {/* Modal header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {isLogin ? (
                <LogIn className="w-6 h-6" />
              ) : (
                <UserPlus className="w-6 h-6" />
              )}
              <h2 className="text-xl font-bold">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
            </div>
            <button
              className="text-white hover:text-gray-200 transition-colors"
              onClick={handleClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-blue-100 mt-1 text-sm">
            {isLogin 
              ? "Sign in to continue to your account" 
              : "Join us today and access all features"}
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 font-medium text-center transition-colors ${
              isLogin 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => toggleForm('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-3 font-medium text-center transition-colors ${
              !isLogin 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => toggleForm('register')}
          >
            Register
          </button>
        </div>

        {/* Form content */}
        <div className="p-6">
          <div className={`transition-all duration-300 ${isLogin ? 'block' : 'hidden'}`}>
            {/* Login Form */}
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Email or Phone"
                  value={loginId}
                  onChange={(e) => {
                    setLoginId(e.target.value);
                    setInvalidMsg('');
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.loginId
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                />
                {errors.loginId && (
                  <p className="text-red-500 text-sm mt-1">{errors.loginId}</p>
                )}
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setInvalidMsg('');
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              
              {invalidMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {invalidMsg}
                </div>
              )}
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-medium 
                  transition-all hover:shadow-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 
                  focus:ring-blue-600 focus:ring-opacity-50"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>

          <div className={`transition-all duration-300 ${!isLogin ? 'block' : 'hidden'}`}>
            {/* Register Form */}
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="WhatsApp Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="Create Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-medium 
                  transition-all hover:shadow-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 
                  focus:ring-blue-600 focus:ring-opacity-50"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>

          {/* Terms & privacy policy */}
          <p className="text-xs text-center text-gray-600 mt-8">
            By continuing, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogRegModal;
