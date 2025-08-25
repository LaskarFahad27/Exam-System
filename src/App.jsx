import { Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import NSU_Exam from "./VarsityBasedExam.jsx/NSU_Exam";
import BRACU_Exam from "./VarsityBasedExam.jsx/BRACU_Exam";
import AUST_Exam from "./VarsityBasedExam.jsx/AUST_Exam";
import OnlineExam from "./OnlineExam";
import AdminLogin from "./AdminLogin";
import AdminPanel from "./Admin";
import LandingPage from "./LandingPage";

function App() {
  return (
    <>
    <Toaster/>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/exam/nsu" element={<NSU_Exam />} />
      <Route path="/exam/bracu" element={<BRACU_Exam />} />
      <Route path="/exam/aust" element={<AUST_Exam />} />
      {/* <Route path="/exam/ewu" element={<EWU_Exam />} />
      <Route path="/exam/uiu" element={<UIU_Exam />} /> */}
      <Route path="/online_exam" element={<OnlineExam />} />
      <Route path="/adminlogin" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
    </>
  );
}

export default App;