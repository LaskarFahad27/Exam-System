import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from './utils/api';

const LogRegModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [errors, setErrors] = useState({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginId, setLoginId] = useState('');
  const [invalidMsg, setInvalidMsg] = useState('');
  const navigate = useNavigate();

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
        setIsLogin(true);
        toast.success("Registered successfully");
      } else {
        throw new Error(data.message || 'Registration failed');
        toast.error("Registration failed");
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.message || 'Failed to register. Please try again.');
    }
  };

  const handleGo = async (e) => {
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
        toast.success("Logged in successfully");
        localStorage.setItem("studentToken", data.data.token);
        onClose(); // Close the modal
      } else {
        throw new Error(data.message || 'Login failed');
        toast.error("Failed to login");
      }
    } catch (error) {
      console.error('Login error:', error);
      setInvalidMsg(error.message || 'Failed to login. Please try again.');
      toast.error("Failed to login");
    }
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {isLogin ? "Login" : "Register"}
            </h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isLogin ? (
            // Login Form
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Email or Phone"
                  value={loginId}
                  onChange={(e) => {
                             setLoginId(e.target.value);
                              setInvalidMsg('');
                            }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.loginId
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                />
                {errors.loginId && (
                  <p className="text-red-500 text-sm mt-1">{errors.loginId}</p>
                )}
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                             setPassword(e.target.value);
                              setInvalidMsg('');
                            }}

                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
                <p className="text-red-600 text-sm mt-1">{invalidMsg}</p>
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
              {/* Name */}
              <div>
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <input
                  type="text"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-600"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={handleRegister}
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
    )
  );
};

export default LogRegModal;
