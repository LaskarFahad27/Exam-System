import { Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import './App.css';
import NSU_Exam from "./VarsityBasedExam.jsx/NSU_Exam";
import BRACU_Exam from "./VarsityBasedExam.jsx/BRACU_Exam";
import AUST_Exam from "./VarsityBasedExam.jsx/AUST_Exam";
import EWU_Exam from "./VarsityBasedExam.jsx/EWU_Exam";
import UIU_Exam from "./VarsityBasedExam.jsx/UIU_Exam";
import OnlineExam from "./OnlineExam";
import AdminLogin from "./AdminLogin";
import AdminPanel from "./Admin";
import LandingPage from "./LandingPage";
import ExamSelectionPage from "./ExamSelectionPage";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
      <ScrollToTop />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/exam/nsu" element={<NSU_Exam />} />
          <Route path="/exam/bracu" element={<BRACU_Exam />} />
          <Route path="/exam/aust" element={<AUST_Exam />} />
          <Route path="/exam/ewu" element={<EWU_Exam />} />
          <Route path="/exam/uiu" element={<UIU_Exam />} /> 
          <Route path="/exam-selection" element={<ExamSelectionPage />} />
          <Route path="/online_exam" element={<OnlineExam />} />
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;