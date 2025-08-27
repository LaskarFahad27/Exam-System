import React from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/logo_white.png"
import { Facebook, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="text-white py-8 w-full mt-auto" style={{ backgroundColor: "#3f5ad5" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and social media */}
          <div className="col-span-1">
            <div className="mb-6">
              <Link to="/" className="flex items-center">
                <h1 className="text-2xl font-bold text-white">
                 <div className="flex items-center space-x-2">
                      <img src={logo} alt="CampusPro" className="w-30 h-10" />
                    </div>
                </h1>
              </Link>
            </div>
            <p className="mb-4 text-white text-lg font-medium">আমাদের সাথে যুক্ত থাকুন</p>
            <div className="flex space-x-4">
              <a href="#" className="bg-white rounded-full p-2 hover:bg-gray-200 transition-colors" style={{ color: "#3f5ad5" }}>
                <Facebook size={20} />
              </a>
              <a href="#" className="bg-white rounded-full p-2 hover:bg-gray-200 transition-colors" style={{ color: "#3f5ad5" }}>
                <Twitter size={20} />
              </a>
              <a href="#" className="bg-white rounded-full p-2 hover:bg-gray-200 transition-colors" style={{ color: "#3f5ad5" }}>
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold mb-5">প্রয়োজনীয় লিংক</h3>
            <ul className="space-y-3">
              <li>
                <Link to="https://campusprobd.com/" className="hover:underline">Home</Link>
              </li>
              <li>
                <Link to="https://campusprobd.com/shop/" className="hover:underline">Courses</Link>
              </li>
              <li>
                <Link to="https://campusprobd.com/about/" className="hover:underline">About Us</Link>
              </li>
              <li>
                <Link to="https://campusprobd.com/contact/" className="hover:underline">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold mb-5">যোগাযোগ</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+8801331-224298</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>contact@campusprobd.com</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <span>01575085365 (WhatsApp)</span>
              </li>
            </ul>
          </div>

          {/* Company Information */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold mb-5">কোম্পানির তথ্য</h3>
            <div className="space-y-3">
              <p>Trade License</p>
              <p>Number:TRAD/DNCC/005448/2025</p>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center" style={{ borderColor: "rgba(255, 255, 255, 0.2)" }}>
          <div className="mb-4 md:mb-0">
            <nav className="flex flex-wrap gap-x-6">
              <Link to="/terms" className="hover:underline">Terms & Conditions</Link>
              <span>|</span>
              <Link to="/refund" className="hover:underline">Refund Policy</Link>
              <span>|</span>
              <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            </nav>
          </div>
          <div className="text-sm">
            &copy; {currentYear} Campus Pro. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
