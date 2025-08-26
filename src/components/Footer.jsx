import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 w-full mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Developed by <span className="font-semibold">CoreCraft</span></p>
        <p className="text-xs mt-2">Preparing students for university admission exams</p>
      </div>
    </footer>
  );
};

export default Footer;
