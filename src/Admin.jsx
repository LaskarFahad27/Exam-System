import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, Plus, Edit3, Trash2, Eye, EyeOff, GraduationCap, FileText, Calculator, Book, PenTool, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { BACKEND_URL } from './utils/api';
import { getExams, createExam, createSection, createQuestions, dropExam, fetchExamsById, deleteQuestion, deleteSection } from './utils/api';
import MCQMaker from './MCQMaker';
import QuestionsList from './QuestionsList';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('students');
  const navigate = useNavigate();
  const [students, setStudents] = useState([
    { id: 'STU001', name: 'John Doe', email: 'john@example.com', enrolledDate: '2024-01-15' },
    { id: 'STU002', name: 'Jane Smith', email: 'jane@example.com', enrolledDate: '2024-01-20' }
  ]);
  const [exams, setExams] = useState([]);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: '', id: '', email: '' });
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    english: { questions: [], timeLimit: '', sequenceOrder: '' },
    math: { questions: [], timeLimit: '', sequenceOrder: '' },
    reading: { questions: [], timeLimit: '', sequenceOrder: '' },
    essay: { topics: [], timeLimit: '', sequenceOrder: '' }
  });
  const [activeSection, setActiveSection] = useState('english');
  const [sectionCreated, setSectionCreated] = useState({
  english: false,
  math: false,
  reading: false,
  essay: false,
});

  const [sectionId, setSectionId] = useState();
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: null
  });
  const [questionType, setQuestionType] = useState('MCQ');


  const [examCreated, setExamCreated] = useState(false);
  const [essayTopicForm, setEssayTopicForm] = useState('');
  const [examId, setExamId] = useState();
  const [isEditingExam, setIsEditingExam] = useState(false);
  const [currentExamData, setCurrentExamData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [showExamDeleteConfirm, setShowExamDeleteConfirm] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);

  const handleEditExam = async (examId) => {
    try {
      const examData = await fetchExamsById(examId);
      console.log("Fetched exam data:", examData);
      
      if (examData.success) {
        const exam = examData.data;
        setCurrentExamData(exam);
        setExamId(exam.id);
        setIsEditingExam(true);
        setExamCreated(true);
        
        // Populate exam form with existing data
        setExamForm({
          title: exam.title,
          description: exam.description,
          english: { questions: [], timeLimit: '', sequenceOrder: '' },
          math: { questions: [], timeLimit: '', sequenceOrder: '' },
          reading: { questions: [], timeLimit: '', sequenceOrder: '' },
          essay: { topics: [], timeLimit: '', sequenceOrder: '' }
        });

        // Map sections and mark them as created
        const sectionsState = {
          english: false,
          math: false,
          reading: false,
          essay: false,
        };

        const examFormUpdate = {
          title: exam.title,
          description: exam.description,
          english: { questions: [], timeLimit: '', sequenceOrder: '' },
          math: { questions: [], timeLimit: '', sequenceOrder: '' },
          reading: { questions: [], timeLimit: '', sequenceOrder: '' },
          essay: { topics: [], timeLimit: '', sequenceOrder: '' }
        };

        // Process sections from API response
        exam.sections.forEach(section => {
          const sectionName = section.name.toLowerCase();
          
          if (examFormUpdate[sectionName]) {
            sectionsState[sectionName] = true;
            examFormUpdate[sectionName].timeLimit = section.duration_minutes.toString();
            examFormUpdate[sectionName].sequenceOrder = section.sequence_order.toString();
            
            // Convert questions to the expected format
            const questions = section.questions.map(q => ({
              id: q.id,
              question: q.question_text,
              options: q.options.map(opt => opt.text),
              correctAnswer: q.correct_answer
            }));
            
            examFormUpdate[sectionName].questions = questions;
          }
        });

        setSectionCreated(sectionsState);
        setExamForm(examFormUpdate);
        setShowExamForm(true);

        // Set active section to first available section
        const firstActiveSection = Object.keys(sectionsState).find(key => sectionsState[key]);
        if (firstActiveSection) {
          setActiveSection(firstActiveSection);
        }
      }
    } catch (error) {
      console.error("Failed to fetch exam:", error);
      toast.error('Failed to load exam data');
    }
  };

  const resetExamForm = () => {
    setExamForm({
      title: '',
      description: '',
      english: { questions: [], timeLimit: '', sequenceOrder: '' },
      math: { questions: [], timeLimit: '', sequenceOrder: '' },
      reading: { questions: [], timeLimit: '', sequenceOrder: '' },
      essay: { topics: [], timeLimit: '', sequenceOrder: '' }
    });
    setSectionCreated({
      english: false,
      math: false,
      reading: false,
      essay: false,
    });
    setExamCreated(false);
    setIsEditingExam(false);
    setCurrentExamData(null);
    setExamId(null);
    setActiveSection('english');
  };

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const examData = await getExams();
        setExams(examData.data);
        console.log("ttt",examData.data);
      } catch (err) {
        setError("Failed to load exams");
        console.error(err);
      }
    };

    fetchExams();
  }, []);


  const handleAddStudent = () => {
    if (studentForm.name && studentForm.id && studentForm.email) {
      setStudents([...students, { ...studentForm, enrolledDate: new Date().toISOString().split('T')[0] }]);
      setStudentForm({ name: '', id: '', email: '' });
      setShowStudentForm(false);
    }
  };

  const handleAddExam = async () => {
  if (examForm.title) {
    try {
      const res = await createExam(examForm.title, examForm.description);
      const examId = res.data.exam.id;

      setExamId(examId);
      setExamCreated(true);

      console.log("exam id", examId);
    } catch (error) {
      console.error("Failed to create exam:", error);
    }
  }
};


  const handleCreateSection = async() => {
    // Skip section creation if we're editing an existing exam (sections already exist)
    if (isEditingExam) {
      return;
    }

    if (examForm[activeSection].timeLimit && examForm[activeSection].sequenceOrder) {
    try {
      const res = await createSection(activeSection, examId, examForm[activeSection].timeLimit, examForm[activeSection].sequenceOrder);
      if(res.success){
        setSectionCreated(prev => ({
          ...prev,
          [activeSection]: true
        }));
        setSectionId(res.data.section.id);
      }
    } catch (error) {
      console.error("Failed to create section:", error);
    }
  }
  }

 const addQuestion = async(section, newQuestion) => {
  try {
    // Get the section ID for the current active section
    let currentSectionId = sectionId;
    
    // If we're editing an existing exam, find the section ID from the current exam data
    if (isEditingExam && currentExamData) {
      const existingSection = currentExamData.sections.find(s => s.name.toLowerCase() === section);
      if (existingSection) {
        currentSectionId = existingSection.id;
      }
    }

    if (!currentSectionId) {
      toast.error('Section not found. Please create the section first.');
      return;
    }

    // Call the API to create the question
    const response = await createQuestions(
      currentSectionId,
      newQuestion.question,
      'mcq', // question type
      newQuestion.options,
      newQuestion.correctAnswer
    );
    
    if (response.success) {
      // Add ID from response to the new question
      const questionWithId = {
        ...newQuestion,
        id: response.data.question.id
      };
      
      // Update local state only if API call is successful
      setExamForm((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          questions: [questionWithId, ...prev[section].questions], 
        },
      }));
      toast.success('Question added successfully!');
    }
  } catch (error) {
    console.error("Failed to create question:", error);
    toast.error('Failed to add question');
  }
};


  const addEssayTopic = () => {
    if (essayTopicForm.trim()) {
      setExamForm({
        ...examForm,
        essay: {
          ...examForm.essay,
          topics: [...examForm.essay.topics, { topic: essayTopicForm, id: Date.now() }]
        }
      });
      setEssayTopicForm('');
    }
  };

  const removeQuestion = async (section, id) => {
    try {
      // Only call API if the question has an ID (meaning it exists in database)
      if (id && typeof id === 'number') {
        await deleteQuestion(id);
        toast.success('Question deleted successfully!');
      }
      
      // Update local state
      setExamForm((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          questions: prev[section].questions.filter((q) => q.id !== id),
        },
      }));
    } catch (error) {
      console.error("Failed to delete question:", error);
      toast.error('Failed to delete question');
    }
  };

  const handleDeleteSection = (sectionKey, sectionLabel) => {
    setSectionToDelete({ key: sectionKey, label: sectionLabel });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSection = async () => {
    if (!sectionToDelete || !currentExamData) return;

    try {
      // Find the section ID from currentExamData
      const sectionData = currentExamData.sections.find(
        s => s.name.toLowerCase() === sectionToDelete.key
      );
      
      if (sectionData && sectionData.id) {
        await deleteSection(sectionData.id);
        toast.success('Section deleted successfully!');
        
        // Update local state
        setSectionCreated(prev => ({
          ...prev,
          [sectionToDelete.key]: false
        }));
        
        // Reset section data in examForm
        setExamForm(prev => ({
          ...prev,
          [sectionToDelete.key]: {
            questions: [],
            timeLimit: '',
            sequenceOrder: ''
          }
        }));
        
        // Switch to a different section if the deleted one was active
        if (activeSection === sectionToDelete.key) {
          const availableSections = Object.keys(sectionCreated).filter(
            key => key !== sectionToDelete.key && sectionCreated[key]
          );
          if (availableSections.length > 0) {
            setActiveSection(availableSections[0]);
          } else {
            setActiveSection('english');
          }
        }
      }
    } catch (error) {
      console.error("Failed to delete section:", error);
      toast.error('Failed to delete section');
    } finally {
      setShowDeleteConfirm(false);
      setSectionToDelete(null);
    }
  };

  const removeEssayTopic = (topicId) => {
    setExamForm({
      ...examForm,
      essay: {
        ...examForm.essay,
        topics: examForm.essay.topics.filter(t => t.id !== topicId)
      }
    });
  };

  const deleteStudent = (id) => {
    setStudents(students.filter(student => student.id !== id));
  };

  const handleDeleteExam = (exam) => {
    setExamToDelete(exam);
    setShowExamDeleteConfirm(true);
  };

  const confirmDeleteExam = async () => {
    if (!examToDelete) return;
    
    try {
      await dropExam(examToDelete.id);
      setExams(exams.filter(exam => exam.id !== examToDelete.id));
      toast.success('Exam deleted successfully!');
    } catch (error) {
      console.error("Failed to delete exam:", error);
      toast.error('Failed to delete exam');
    } finally {
      setShowExamDeleteConfirm(false);
      setExamToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                <p className="text-gray-600 text-sm">Campus Pro Examination System</p>
              </div>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-200 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'students' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Students</span>
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'exams' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Exams</span>
          </button>
        </div>

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Student Management</h2>
              <button
                onClick={() => setShowStudentForm(true)}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Add Student</span>
              </button>
            </div>

            {/* Students Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {students.map((student) => (
                <div key={student.id} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <button
                      onClick={() => deleteStudent(student.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{student.name}</h3>
                  <p className="text-gray-600 text-sm mb-1">ID: {student.id}</p>
                  <p className="text-gray-600 text-sm mb-1">Email: {student.email}</p>
                  <p className="text-gray-600 text-sm">Enrolled: {student.enrolledDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Exam Management</h2>
              <button
                onClick={() => {
                  resetExamForm();
                  setShowExamForm(true);
                }}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Create Exam</span>
              </button>
            </div>

            {/* Exams Grid */}

<div className="grid gap-6 md:grid-cols-4">
  {exams.map((exam) => (
    <div 
      key={exam.id} 
      onClick={() => handleEditExam(exam.id)}
      className="relative bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
    >
      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent parent onClick
          handleDeleteExam(exam);
        }}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <h3 className="text-lg font-bold">{exam.title}</h3>
      <p>{exam.description}</p>
      
    </div>
  ))}
</div>

          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showStudentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Add New Student</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Student Name</label>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter student name"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Student ID</label>
                <input
                  type="text"
                  value={studentForm.id}
                  onChange={(e) => setStudentForm({...studentForm, id: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter student ID"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleAddStudent}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Add Student
                </button>
                <button
                  onClick={() => setShowStudentForm(false)}
                  className="flex-1 bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Exam Modal */}
      {showExamForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-scroll">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full h-full overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {isEditingExam ? 'Edit Exam' : 'Create New Exam'}
              </h3>
              <button
                onClick={() => {
                  setShowExamForm(false);
                  resetExamForm();
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                <X className="w-6 h-6" />
                </button>
            </div>
            <div className="space-y-6">
              {!examCreated && (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Exam Title</label>
                  <input
                    type="text"
                    value={examForm.title}
                    onChange={(e) => setExamForm({...examForm, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter exam title"
                    disabled={isEditingExam}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2"><span>Description</span> <i>(Optional)</i></label>
                  <input
                    type="text"
                    value={examForm.description}
                    onChange={(e) => setExamForm({...examForm, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter exam description"
                    disabled={isEditingExam}
                  />
                </div>
              </div>

              )}
              {/* Section Tabs */}
              {examCreated && (
                <div className="border-b border-gray-200">
                <div className="flex space-x-8">
                  {[
                    { key: 'english', label: 'English', icon: Book, color: 'blue' },
                    { key: 'math', label: 'Mathematics', icon: Calculator, color: 'green' },
                    { key: 'reading', label: 'Reading Comprehension', icon: FileText, color: 'purple' },
                    { key: 'essay', label: 'Essay Writing', icon: PenTool, color: 'orange' }
                  ].map((section) => (
                    <button
                      key={section.key}
                      onClick={() => setActiveSection(section.key)}
                      className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                        activeSection === section.key
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <section.icon className="w-4 h-4" />
                      <span>{section.label}</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {section.key === 'essay' 
                          ? examForm.essay.topics.length 
                          : examForm[section.key].questions.length}
                      </span>
                      {/* Delete button - only show for active section and if section is created */}
                      {activeSection === section.key && sectionCreated[section.key] && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(section.key, section.label);
                          }}
                          className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                          title={`Delete ${section.label} section`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              )}
              
              {/* Section Content */}

{examCreated && (
  <div>
    {/* ========== ENGLISH SECTION ========== */}
    {activeSection === 'english' && !sectionCreated.english && (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <div className="text-gray-700 font-medium mb-4">
          This section is not created yet. <br />
          Enter allotted time & sequence order for this section to create it.
        </div>

        <input
          type="number"
          placeholder="Enter allotted time (min)"
          value={examForm.english.timeLimit}
          onChange={(e) =>
            setExamForm({
              ...examForm,
              english: {
                ...examForm.english,
                timeLimit: e.target.value,
              },
            })
          }
          className="px-4 py-2 border rounded-lg w-1/2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <br />

        <input
          type="number"
          placeholder="Enter sequence order"
          value={examForm.english.sequenceOrder}
          onChange={(e) =>
            setExamForm({
              ...examForm,
              english: {
                ...examForm.english,
                sequenceOrder: e.target.value,
              },
            })
          }
          className="px-4 py-2 border rounded-lg w-1/2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <br />

        <button
          onClick={handleCreateSection}
          className="ml-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Section
        </button>
      </div>
    )}

    {activeSection === 'english' && sectionCreated.english && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MCQMaker activeSection={activeSection} addQuestion={addQuestion} />

          <QuestionsList
            activeSection={activeSection}
            examForm={examForm}
            removeQuestion={removeQuestion}
          />
      </div>
    )}

    {/* ========== MATH SECTION ========== */}
    {activeSection === 'math' && !sectionCreated.math && (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-700 font-medium mb-4">
          This section is not created yet. Enter allotted time & sequence order.
        </p>
        <input
          type="number"
          placeholder="Enter allotted time (min)"
          value={examForm.math.timeLimit}
          onChange={(e) =>
            setExamForm({
              ...examForm,
              math: {
                ...examForm.math,
                timeLimit: e.target.value,
              },
            })
          }
          className="px-4 py-2 border rounded-lg w-1/2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <br />
        <input
          type="number"
          placeholder="Enter sequence order"
          value={examForm.math.sequenceOrder}
          onChange={(e) =>
            setExamForm({
              ...examForm,
              math: {
                ...examForm.math,
                sequenceOrder: e.target.value,
              },
            })
          }
          className="px-4 py-2 border rounded-lg w-1/2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <br />
        <button
          onClick={handleCreateSection}
          className="ml-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Create Section
        </button>
      </div>
    )}

    {activeSection === 'math' && sectionCreated.math && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MCQMaker activeSection={activeSection} addQuestion={addQuestion} />
         
          <QuestionsList
            activeSection={activeSection}
            examForm={examForm}
            removeQuestion={removeQuestion}
          />
      </div>
    )}

    {/* ========== READING SECTION ========== */}
    {activeSection === 'reading' && !sectionCreated.reading && (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-700 font-medium mb-4">
          This section is not created yet. Enter allotted time & sequence order.
        </p>
        <input
          type="number"
          placeholder="Enter allotted time (min)"
          value={examForm.reading.timeLimit}
          onChange={(e) =>
            setExamForm({
              ...examForm,
              reading: {
                ...examForm.reading,
                timeLimit: e.target.value,
              },
            })
          }
          className="px-4 py-2 border rounded-lg w-1/2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <br />
        <input
          type="number"
          placeholder="Enter sequence order"
          value={examForm.reading.sequenceOrder}
          onChange={(e) =>
            setExamForm({
              ...examForm,
              reading: {
                ...examForm.reading,
                sequenceOrder: e.target.value,
              },
            })
          }
          className="px-4 py-2 border rounded-lg w-1/2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <br />
        <button
          onClick={handleCreateSection}
          className="ml-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Create Section
        </button>
      </div>
    )}

    {activeSection === 'reading' && sectionCreated.reading && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MCQMaker activeSection={activeSection} addQuestion={addQuestion} />

          <QuestionsList
            activeSection={activeSection}
            examForm={examForm}
            removeQuestion={removeQuestion}
          />
      </div>
    )}

    {/* ========== ESSAY SECTION ========== */}
    {activeSection === 'essay' && !sectionCreated.essay && (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-700 font-medium mb-4">
          This section is not created yet. Enter allotted time & sequence order.
        </p>
        <input
          type="number"
          placeholder="Enter allotted time (min)"
          value={examForm.essay.timeLimit}
          onChange={(e) =>
            setExamForm({
              ...examForm,
              essay: {
                ...examForm.essay,
                timeLimit: e.target.value,
              },
            })
          }
          className="px-4 py-2 border rounded-lg w-1/2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <br />
        <input
          type="number"
          placeholder="Enter sequence order"
          value={examForm.essay.sequenceOrder}
          onChange={(e) =>
            setExamForm({
              ...examForm,
              essay: {
                ...examForm.essay,
                sequenceOrder: e.target.value,
              },
            })
          }
          className="px-4 py-2 border rounded-lg w-1/2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <br />
        <button
          onClick={handleCreateSection}
          className="ml-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Section
        </button>
      </div>
    )}

    {activeSection === 'essay' && sectionCreated.essay && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Add Essay Topic</h2>
          <input
            type="text"
            placeholder="Enter essay topic"
            value={essayTopicForm}
            onChange={(e) => setEssayTopicForm(e.target.value)}
            className="px-4 py-2 border rounded-lg w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addEssayTopic}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Topic
          </button>
          {/* Essay form inputs */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Essay Topics</h2>
          <ul className="list-disc list-inside text-gray-700">
            {examForm.essay.topics.map((topic) => (
              <li key={topic.id} className="flex items-center justify-between mb-2">
                <span>{topic.topic}</span>
                <button
                  onClick={() => removeEssayTopic(topic.id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
            {examForm.essay.topics.length === 0 && (
              <p className="text-gray-500 italic">No topics added yet</p>
            )}
          </ul>
        </div>
      </div>
    )}
  </div>
)}

              {!examCreated && (
                <div className="flex space-x-3 pt-6 border-t">
                <button
                  onClick={handleAddExam}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  disabled={isEditingExam}
                >
                  Create Exam
                </button>
                <button
                 onClick={() => {
                    setShowExamForm(false);
                    resetExamForm();
                    }}

                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Section Confirmation Modal */}
      {showDeleteConfirm && sectionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete Section
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Do you want to delete <span className="font-semibold">{sectionToDelete.label}</span> section?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={confirmDeleteSection}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSectionToDelete(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Exam Confirmation Modal */}
      {showExamDeleteConfirm && examToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete Exam
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Do you want to delete <span className="font-semibold">{examToDelete.title}</span>?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={confirmDeleteExam}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    setShowExamDeleteConfirm(false);
                    setExamToDelete(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;