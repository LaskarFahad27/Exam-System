import React from 'react';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white py-6 z-10 w-full">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Developed by <span className="font-semibold">CoreCraft</span></p>
      </div>
    </footer>
  );
};

export default Footer;
