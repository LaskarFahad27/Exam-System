import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, Plus, Edit3, Trash2, Eye, EyeOff, GraduationCap, FileText, Calculator, Book, PenTool, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { BACKEND_URL } from './utils/api';

const AdminLogin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
      const [showPassword, setShowPassword] = useState(false);
      const [adminUsername, setAdminUsername] = useState("");
      const [adminPassword, setAdminPassword] = useState("");
      const [emptyFields, setEmptyFields] = useState(false);
      const navigate = useNavigate();

       const handleAdminLogin = async (e) => {
    e.preventDefault();

    if (adminUsername && adminPassword) {
      try {
      const response = await fetch(`${BACKEND_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username : adminUsername, 
          password : adminPassword,
        }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        setAdminUsername('');
        setAdminPassword('');
        toast.success("Logged in successfully");
        localStorage.setItem("adminToken", data.data.token);
        navigate("/admin");
      } else {
        throw new Error(data.message || 'Login failed');
        toast.error("Failed to login");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Failed to login");
    }
  } else {
    setEmptyFields(true);
  }
    }
     if (!isAuthenticated) {
        return (
          <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <div className="text-center mb-8">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Login</h2>
                <p className="text-gray-600">Enter your credentials to access the admin panel</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={adminUsername}
                      onChange={(e) => {
                                 setAdminUsername(e.target.value);
                                 setEmptyFields(false);
                                }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter username"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => {
                                 setAdminPassword(e.target.value);
                                 setEmptyFields(false);
                                }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {emptyFields && (
                      <p className="text-red-500 text-sm mt-1">Please enter your credentials </p>
                    )}
                <button
                  onClick={handleAdminLogin}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                  Login to Admin Panel
                </button>
              </div>
            </div>
          </div>
        );
      }
};
export default AdminLogin;