import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, Plus, Edit3, Trash2, Eye, EyeOff, GraduationCap, FileText, Calculator, Book, PenTool, X, ScrollText, CircuitBoard, FlaskConical, Stethoscope } from 'lucide-react';
import './components/Tooltip.css';
import toastService from './utils/toast.jsx';
import { BACKEND_URL } from './utils/api';
import { getExams, createExam, createSection, createQuestions, dropExam, forceDropExam, fetchExamsById, deleteQuestion, deleteSection, toggleExamPublishStatus, updateExamBasicDetails } from './utils/api';
import MCQMaker from './MCQMaker';
import MathMCQMaker from './MathMCQMaker';
import QuestionsList from './QuestionsList';
import MathQuestionsList from './MathQuestionsList';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // State for Create Question Modal
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  // For new question set modal
  const [questionSetSubject, setQuestionSetSubject] = useState('');
  const [questionSetName, setQuestionSetName] = useState('');
  const [questionSetCreated, setQuestionSetCreated] = useState(false);
  // Only one subject per question set
  const [activeQuestionSubject, setActiveQuestionSubject] = useState('');
  // Per-subject question bank for modal (for preview)
  const [questionModalBank, setQuestionModalBank] = useState({
    english: [],
    math: [],
    reading: [],
    physics: [],
    chemistry: [],
    biology: [],
  });
  // For non-math subjects
  const [questionInput, setQuestionInput] = useState('');
  const [questionOptions, setQuestionOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState(null);
  // For math section
  const [mathQuestionForm, setMathQuestionForm] = useState(null); // will be set by MathMCQMaker

  const subjectTabs = [
    { key: 'english', label: 'English', color: 'blue' },
    { key: 'math', label: 'Mathematics', color: 'green' },
    { key: 'reading', label: 'Reading', color: 'purple' },
    { key: 'physics', label: 'Physics', color: 'red' },
    { key: 'chemistry', label: 'Chemistry', color: 'yellow' },
    { key: 'biology', label: 'Biology', color: 'teal' },
  ];

  const resetQuestionModal = () => {
    setActiveQuestionSubject('english');
    setQuestionInput('');
    setQuestionOptions(['', '', '', '']);
    setCorrectOption(null);
    setMathQuestionForm(null);
    setQuestionModalBank({
      english: [],
      math: [],
      reading: [],
      physics: [],
      chemistry: [],
      biology: [],
    });
  };

  // Add question for current subject
  const handleAddQuestion = (q) => {
    let newQ;
    if (activeQuestionSubject === 'math') {
      newQ = q; // MathMCQMaker provides the full question object
    } else {
      newQ = {
        id: Date.now(),
        question: questionInput,
        options: [...questionOptions],
        correctAnswer: correctOption,
        hasMath: false,
      };
    }
    setQuestionModalBank((prev) => ({
      ...prev,
      [activeQuestionSubject]: [newQ, ...prev[activeQuestionSubject]],
    }));
    // Reset only the input for the current subject
    if (activeQuestionSubject === 'math') {
      setMathQuestionForm(null);
    } else {
      setQuestionInput('');
      setQuestionOptions(['', '', '', '']);
      setCorrectOption(null);
    }
    toastService.success('Question added!');
  };
  const [activeTab, setActiveTab] = useState('students');
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
  const [loadingExamDelete, setLoadingExamDelete] = useState(false);
  const [loadingExamEdit, setLoadingExamEdit] = useState({});
  const [loadingSectionDelete, setLoadingSectionDelete] = useState(false);
  const [loadingCreateSection, setLoadingCreateSection] = useState(false);
  const [loadingAddQuestion, setLoadingAddQuestion] = useState(false);
  const [loadingRemoveQuestion, setLoadingRemoveQuestion] = useState({});
  
  const [loadingPublishStatus, setLoadingPublishStatus] = useState({});
  const [loadingEditStatus, setLoadingEditStatus] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState();
  const [editFormData, setEditFormData] = useState({ title: '', description: '' });

  // Handle toggle publish status
  const handleTogglePublishStatus = async (e, examId, currentStatus) => {
    e.stopPropagation(); // Prevent parent click event (edit exam)
    
    setLoadingPublishStatus(prev => ({ ...prev, [examId]: true }));
    
    try {
      await toggleExamPublishStatus(examId, !currentStatus);
      
      // Update the exams list with the new publish status
      setExams(exams.map(exam => 
        exam.id === examId 
          ? { ...exam, published: !currentStatus ? 1 : 0 } 
          : exam
      ));
      
      // Also update filtered exams
      setFilteredExams(filteredExams.map(exam => 
        exam.id === examId 
          ? { ...exam, published: !currentStatus ? 1 : 0 } 
          : exam
      ));
      
      toastService.success(`Exam ${!currentStatus ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toastService.error("Failed to update exam publish status");
    } finally {
      setLoadingPublishStatus(prev => ({ ...prev, [examId]: false }));
    }
  };
  
  // Handle opening edit modal
  const handleOpenEditModal = (e, exam) => {
    e.stopPropagation(); // Prevent parent click event (edit exam)
    setEditingExamId(exam.id);
    console.log("Editing exam:", exam.id);
    setEditFormData({ 
      title: exam.title, 
      description: exam.description 
    });
    setEditModalOpen(true);
  };
  
  // Handle updating exam details
  const handleUpdateExamDetails = async (e) => {
    e.preventDefault();
    if (!editingExamId) return;
    
    setLoadingEditStatus(prev => ({ ...prev, [editingExamId]: true }));
    
    try {
      await updateExamBasicDetails(
        editingExamId,
        editFormData.title,
        editFormData.description
      );

      console.log(editingExamId,
        editFormData.title,
        editFormData.description)
      
      // Update the exams list with the new details
      setExams(exams.map(exam => 
        exam.id === editingExamId 
          ? { ...exam, title: editFormData.title, description: editFormData.description } 
          : exam
      ));
      
      // Also update filtered exams
      setFilteredExams(filteredExams.map(exam => 
        exam.id === editingExamId 
          ? { ...exam, title: editFormData.title, description: editFormData.description } 
          : exam
      ));
      
      toastService.success('Exam details updated successfully');
      setEditModalOpen(false);
    } catch (error) {
      console.error('Error updating exam details:', error);
      toastService.error('Failed to update exam details');
    } finally {
      setLoadingEditStatus(prev => ({ ...prev, [editingExamId]: false }));
    }
  };

  // Tooltip state
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const searchRef = useRef(null);

  // Handle mouse movement to update tooltip position
  const handleMouseMove = (e) => {
    if (showTooltip) {
      setTooltipPosition({ 
        x: e.clientX, 
        y: e.clientY + 20 // Position below cursor
      });
    }
  };

  const handleEditExam = async (examId) => {
    try {
      const examData = await fetchExamsById(examId);
      console.log("Fetched exam data:", examData);
      
      if (examData.success) {
        const exam = examData.data;
        setCurrentExamData(exam);
        setExamId(exam.id); // Set the exam ID
        console.log("Setting exam ID to:", exam.id);
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
      toastService.error('Failed to load exam data');
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
        // Reverse the array to show the newest exams first
        const reversedExams = [...examData.data].reverse();
        setExams(reversedExams);
        setFilteredExams(reversedExams);
        console.log("ttt",examData.data);
      } catch (err) {
        setError("Failed to load exams");
        console.error(err);
      }
    };

    fetchExams();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (activeTab === 'students') {
        setIsLoadingStudents(true);
        try {
          const adminToken = localStorage.getItem("adminToken");
          if (!adminToken) {
            toastService.error("Authentication required");
            setIsLoadingStudents(false);
            return;
          }

          const response = await fetch(`${BACKEND_URL}/auth/users`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${adminToken}`
            },
          });
          
          const data = await response.json();
          
          if (response.ok && data.success) {
            setStudents(data.data);
            setFilteredStudents(data.data);
            console.log("Students fetched successfully:", data.data);
          } else {
            toastService.error(data.message || "Failed to fetch students");
          }
        } catch (error) {
          console.error("Error fetching students:", error);
          toastService.error("Failed to load students");
        } finally {
          setIsLoadingStudents(false);
        }
      }
    };

    fetchStudents();
  }, [activeTab]);
  
  // Effect for search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // If search is empty, show all items
      setFilteredStudents(students);
      setFilteredExams(exams);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    // Filter based on active tab
    if (activeTab === 'students') {
      const filtered = students.filter(student => 
        student.name?.toLowerCase().includes(query) || 
        student.email?.toLowerCase().includes(query) || 
        student.id?.toString().includes(query)
      );
      setFilteredStudents(filtered);
    } else if (activeTab === 'exams') {
      const filtered = exams.filter(exam => 
        exam.title?.toLowerCase().includes(query) || 
        exam.description?.toLowerCase().includes(query)
      );
      // Maintain the existing order (already reversed in fetchExams)
      setFilteredExams(filtered);
    }
  }, [searchQuery, students, exams, activeTab]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Hide tooltip when user starts typing
    setShowTooltip(false);
  };


  const [loadingAddExam, setLoadingAddExam] = useState(false);

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
      setLoadingAddExam(true);
      const res = await createExam(examForm.title, examForm.description);
      const examId = res.data.exam.id;

      setExamId(examId);
      setExamCreated(true);

      console.log("exam id", examId);
    } catch (error) {
      console.error("Failed to create exam:", error);
    } finally {
      setLoadingAddExam(false);
    }
  }
};


  const handleCreateSection = async() => {
    console.log("Creating section:", activeSection);
    console.log("Exam ID:", examId);
    console.log("Time limit:", examForm[activeSection].timeLimit);
    console.log("Sequence order:", examForm[activeSection].sequenceOrder);
    
    // Check if time and sequence order are provided
    if (examForm[activeSection].timeLimit && examForm[activeSection].sequenceOrder) {
      try {
        setLoadingCreateSection(true);
        const res = await createSection(activeSection, examId, examForm[activeSection].timeLimit, examForm[activeSection].sequenceOrder);
        console.log("Create section response:", res);
        if(res.success){
          setSectionCreated(prev => ({
            ...prev,
            [activeSection]: true
          }));
          setSectionId(res.data.section.id);
          toastService.success(`${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} section created successfully!`);
        }
      } catch (error) {
        console.error("Failed to create section:", error);
        toastService.error("Failed to create section");
      } finally {
        setLoadingCreateSection(false);
      }
    } else {
      toastService.error("Please provide both duration and sequence order");
    }
  }

 const addQuestion = async(section, newQuestion) => {
  try {
    setLoadingAddQuestion(true);
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
      toastService.error('Section not found. Please create the section first.');
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
      toastService.success('Question added successfully!');
    }
  } catch (error) {
    console.error("Failed to create question:", error);
    toastService.error('Failed to add question');
  } finally {
    setLoadingAddQuestion(false);
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
      setLoadingRemoveQuestion(prev => ({ ...prev, [id]: true }));
      // Only call API if the question has an ID (meaning it exists in database)
      if (id && typeof id === 'number') {
        await deleteQuestion(id);
        toastService.success('Question deleted successfully!');
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
      toastService.error('Failed to delete question');
    } finally {
      setLoadingRemoveQuestion(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteSection = (sectionKey, sectionLabel) => {
    setSectionToDelete({ key: sectionKey, label: sectionLabel });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSection = async () => {
    if (!sectionToDelete || !currentExamData) return;

    try {
      setLoadingSectionDelete(true);
      // Find the section ID from currentExamData
      const sectionData = currentExamData.sections.find(
        s => s.name.toLowerCase() === sectionToDelete.key
      );
      
      if (sectionData && sectionData.id) {
        await deleteSection(sectionData.id);
        toastService.success('Section deleted successfully!');
        
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
      toastService.error('Failed to delete section');
    } finally {
      setLoadingSectionDelete(false);
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

  const [loadingDelete, setLoadingDelete] = useState({});

  const deleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        setLoadingDelete(prev => ({ ...prev, [id]: true }));
        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) {
          toastService.error("Authentication required");
          setLoadingDelete(prev => ({ ...prev, [id]: false }));
          return;
        }

        const response = await fetch(`${BACKEND_URL}/auth/users/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminToken}`
          },
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          setStudents(students.filter(student => student.id !== id));
          toastService.success("Student deleted successfully");
        } else {
          toastService.error(data.message || "Failed to delete student");
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        toastService.error("Failed to delete student");
      } finally {
        setLoadingDelete(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  const handleDeleteExam = (exam) => {
    setExamToDelete(exam);
    setShowExamDeleteConfirm(true);
  };

  const confirmDeleteExam = async () => {
    if (!examToDelete) return;
    
    try {
      setLoadingExamDelete(true);
      await dropExam(examToDelete.id);
      setExams(exams.filter(exam => exam.id !== examToDelete.id));
      toastService.success('Exam deleted successfully!');
    } catch (error) {
      console.error("Failed to delete exam:", error);
      
      // Handle foreign key constraint error specifically
      if (error.message.includes('student attempts') || error.message.includes('foreign key constraint')) {
        // Show a more detailed confirmation dialog for force delete
        const forceDelete = window.confirm(
          `This exam cannot be deleted because students have already taken it.\n\n` +
          `Do you want to FORCE DELETE this exam?\n` +
          `WARNING: This will permanently delete the exam and all related student records!\n\n` +
          `Click OK to force delete, or Cancel to keep the exam.`
        );
        
        if (forceDelete) {
          try {
            await forceDropExam(examToDelete.id);
            setExams(exams.filter(exam => exam.id !== examToDelete.id));
            toastService.success('Exam force deleted successfully!');
          } catch (forceError) {
            console.error("Failed to force delete exam:", forceError);
            toastService.error('Failed to force delete exam: ' + forceError.message);
          }
        }
      } else {
        toastService.error('Failed to delete exam: ' + error.message);
      }
    } finally {
      setLoadingExamDelete(false);
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
            
            {/* Search Bar */}
            <div 
              className="relative w-64"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onMouseMove={handleMouseMove}
              ref={searchRef}
            >
              <input
                type="text"
                placeholder={activeTab === 'students' ? "Search students..." : "Search exams..."}
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* Custom Tooltip */}
              {showTooltip && (
                <div 
                  className="custom-tooltip"
                  style={{ 
                    left: `${tooltipPosition.x}px`, 
                    top: `${tooltipPosition.y}px`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {activeTab === 'students' 
                    ? "Search with student's name or ID" 
                    : "Search with exam title or description"
                  }
                </div>
              )}
            </div>
            
            {/* <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button> */}
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
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'questions' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <ScrollText className="w-5 h-5" />
            <span>Questions</span>
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
              {isLoadingStudents ? (
                <div className="col-span-3 text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                  </div>
                  <p className="mt-2 text-gray-600">Loading students...</p>
                </div>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <div key={student.uuid} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      {/* <button
                        onClick={() => deleteStudent(student.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button> */}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">{student.name}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600 text-sm">
                        <span className="font-medium mr-2">ID:</span> {student.id}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <span className="font-medium mr-2">Email:</span> {student.email}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <span className="font-medium mr-2">Phone:</span> {student.phone || 'N/A'}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <span className="font-medium mr-2">Role:</span> 
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          {student.role}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <span className="font-medium mr-2">Joined:</span> {new Date(student.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">
                    {searchQuery ? "No students match your search criteria." : "No students found"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Exam Management</h2>
              <div className="flex gap-3">
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
                <button
                  onClick={() => setShowQuestionModal(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Question</span>
                </button>
              </div>

      {/* Create Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{padding: '1vw'}}>
          <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-[98vw] max-h-[96vh] flex flex-col overflow-hidden" style={{margin: 'auto'}}>
            <div className="p-8 flex-1 min-h-0 overflow-y-auto scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
              <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2">
              <h3 className="text-xl font-bold text-gray-800">Create Question Set</h3>
              <button
                onClick={() => {
                  setShowQuestionModal(false);
                  setQuestionSetSubject('');
                  setQuestionSetName('');
                  setQuestionSetCreated(false);
                  setActiveQuestionSubject('');
                  resetQuestionModal();
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {!questionSetCreated ? (
              <div className="space-y-6">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Select the subject for which you want to create the question set</label>
                  <select
                    value={questionSetSubject}
                    onChange={e => setQuestionSetSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Subject --</option>
                    {subjectTabs.map(subject => (
                      <option key={subject.key} value={subject.key}>{subject.label}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Enter the question set name</label>
                  <input
                    type="text"
                    value={questionSetName}
                    onChange={e => setQuestionSetName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Question set name"
                  />
                </div>
                <button
                  className="bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={!questionSetSubject || !questionSetName}
                  onClick={() => {
                    setActiveQuestionSubject(questionSetSubject);
                    setQuestionSetCreated(true);
                  }}
                >
                  Create Question Set
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Question Input */}
                <div>
                  {/* Math Section: Use MathMCQMaker */}
                  {activeQuestionSubject === 'math' ? (
                    <div>
                      <MathMCQMaker
                        activeSection={activeQuestionSubject}
                        addQuestion={(_section, q) => handleAddQuestion(q)}
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Question</label>
                        <textarea
                          value={questionInput}
                          onChange={e => setQuestionInput(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Enter question for ${subjectTabs.find(s=>s.key===activeQuestionSubject)?.label || ''}`}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Options</label>
                        <div className="grid grid-cols-1 gap-2">
                          {questionOptions.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="correctOption"
                                checked={correctOption === idx}
                                onChange={() => setCorrectOption(idx)}
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={e => {
                                  const newOpts = [...questionOptions];
                                  newOpts[idx] = e.target.value;
                                  setQuestionOptions(newOpts);
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`Option ${idx + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddQuestion()}
                        disabled={!questionInput || questionOptions.some(opt => !opt) || correctOption === null}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Add Question
                      </button>
                    </>
                  )}
                </div>
                {/* Right: Preview */}
                <div>
                  <div className="font-semibold mb-2">Preview ({subjectTabs.find(s=>s.key===activeQuestionSubject)?.label || ''})</div>
                  {activeQuestionSubject === 'math' ? (
                    <MathQuestionsList
                      activeSection={activeQuestionSubject}
                      examForm={{ math: { questions: questionModalBank.math } }}
                      removeQuestion={(_section, id) => setQuestionModalBank(prev => ({
                        ...prev,
                        math: prev.math.filter(q => q.id !== id)
                      }))}
                      loadingRemoveQuestion={false}
                    />
                  ) : (
                    <QuestionsList
                      activeSection={activeQuestionSubject}
                      examForm={{ [activeQuestionSubject]: { questions: questionModalBank[activeQuestionSubject] } }}
                      removeQuestion={(idx) => setQuestionModalBank(prev => ({
                        ...prev,
                        [activeQuestionSubject]: prev[activeQuestionSubject].filter((_, i) => i !== idx)
                      }))}
                      loadingRemoveQuestion={false}
                    />
                  )}
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
            </div>

            {/* Exams Grid */}
<div className="grid gap-6 md:grid-cols-4">
  {filteredExams.length > 0 ? (
    filteredExams.map((exam) => (
      <div 
        key={exam.id} 
        onClick={() => handleEditExam(exam.id)}
        className="relative bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
      >
        <div className="absolute top-2 right-2 flex space-x-2 ">
          <button
            onClick={(e) => handleTogglePublishStatus(e, exam.id, exam.published === 1)}
            className={`p-1 rounded-full ${exam.published === 1 ? 'text-green-500 hover:text-green-700' : 'text-gray-500 hover:text-gray-700'} transition`}
            disabled={loadingPublishStatus[exam.id]}
            title={exam.published === 1 ? "Unpublish" : "Publish"}
          >
            {loadingPublishStatus[exam.id] ? (
              <div className="w-5 h-5 border-2 border-t-2 border-blue-500 rounded-full animate-spin"></div>
            ) : exam.published === 1 ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>
          
          <button
            onClick={(e) => handleOpenEditModal(e, exam)}
            className="p-1 rounded-full text-blue-500 hover:text-blue-700 transition"
            title="Edit Details"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent parent onClick
              handleDeleteExam(exam);
            }}
            className="p-1 rounded-full text-red-500 hover:text-red-700 transition"
            title="Delete Exam"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-lg font-bold mt-3">{exam.title}</h3>
        <p className="text-gray-600 text-sm">{exam.description}</p>
        <div className="mt-3 flex items-center">
          <span 
            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${exam.published === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
            title={exam.published === 1 ? 'This exam is visible to students' : 'This exam is hidden from students'}
          >
            {exam.published === 1 ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>
    ))
  ) : (
    <div className="col-span-4 text-center py-8">
      <p className="text-gray-500">
        {searchQuery ? "No exams match your search criteria." : "No exams found"}
      </p>
    </div>
  )}
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
                <div className="flex space-x-8 overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
                  {[
                    { key: 'english', label: 'English', icon: Book, color: 'blue' },
                    { key: 'math', label: 'Mathematics', icon: Calculator, color: 'green' },
                    { key: 'reading', label: 'Reading Comprehension', icon: FileText, color: 'purple' },
                    { key: 'physics', label: 'Physics', icon: CircuitBoard, color: 'red' },
                    { key: 'chemistry', label: 'Chemistry', icon: FlaskConical, color: 'orange' },
                    { key: 'biology', label: 'Biology', icon: Stethoscope, color: 'teal' },
                  ].map((section) => (
                    <button
                      key={section.key}
                      onClick={() => setActiveSection(section.key)}
                      className={`inline-flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                        activeSection === section.key
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <section.icon className="w-4 h-4" />
                      <span>{section.label}</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {section.key === 'essay' 
                          ? (examForm.essay?.topics?.length || 0)
                          : (examForm[section.key]?.questions?.length || 0)}
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
          disabled={!examForm.english.timeLimit || !examForm.english.sequenceOrder || loadingCreateSection}
          className={`ml-3 ${
            !examForm.english.timeLimit || !examForm.english.sequenceOrder
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center`}
        >
          {loadingCreateSection ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Create Section"
          )}
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
            loadingRemoveQuestion={loadingRemoveQuestion}
          />
      </div>
    )}

    {/* ========== MATH SECTION ========== */}
    {activeSection === 'math' && !sectionCreated.math && (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-700 font-medium mb-4">
          This section is not created yet. <br />
          Enter allotted time & sequence order for this section to create it.
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
          disabled={!examForm.math.timeLimit || !examForm.math.sequenceOrder || loadingCreateSection}
          className={`ml-3 ${
            !examForm.math.timeLimit || !examForm.math.sequenceOrder
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          } text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center`}
        >
          {loadingCreateSection ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Create Section"
          )}
        </button>
      </div>
    )}

    {activeSection === 'math' && sectionCreated.math && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MathMCQMaker activeSection={activeSection} addQuestion={addQuestion} />
         
          <MathQuestionsList
            activeSection={activeSection}
            examForm={examForm}
            removeQuestion={removeQuestion}
            loadingRemoveQuestion={loadingRemoveQuestion}
          />
      </div>
    )}


    {/* ========== READING SECTION ========== */}
    {activeSection === 'reading' && !sectionCreated.reading && (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-700 font-medium mb-4">
          This section is not created yet. <br />
          Enter allotted time & sequence order for this section to create it.
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
          disabled={!examForm.reading.timeLimit || !examForm.reading.sequenceOrder || loadingCreateSection}
          className={`ml-3 ${
            !examForm.reading.timeLimit || !examForm.reading.sequenceOrder
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          } text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center`}
        >
          {loadingCreateSection ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Create Section"
          )}
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
          loadingRemoveQuestion={loadingRemoveQuestion}
        />
      </div>
    )}

    {/* ========== PHYSICS SECTION ========== */}
    {activeSection === 'physics' && !sectionCreated.physics && (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-700 font-medium mb-4">
          This section is not created yet. <br />
          Enter allotted time & sequence order for this section to create it.
        </p>
        <input
          type="number"
          placeholder="Enter allotted time (min)"
          value={examForm.physics.timeLimit}
          onChange={(e) =>
            setExamForm({
              ...examForm,
              physics: {
                ...examForm.physics,
                timeLimit: e.target.value,
              },
            })
          }
          className="px-4 py-2 border rounded-lg w-1/2 mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <br />
        <input
          type="number"
          placeholder="Enter sequence order"
          value={examForm.physics.sequenceOrder}
          onChange={(e) =>
            setExamForm({
              ...examForm,
              physics: {
                ...examForm.physics,
                sequenceOrder: e.target.value,
              },
            })
          }
          className="px-4 py-2 border rounded-lg w-1/2 mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <br />
        <button
          onClick={handleCreateSection}
          disabled={!examForm.physics.timeLimit || !examForm.physics.sequenceOrder || loadingCreateSection}
          className={`ml-3 ${
            !examForm.physics.timeLimit || !examForm.physics.sequenceOrder
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          } text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center`}
        >
          {loadingCreateSection ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Create Section"
          )}
        </button>
      </div>
    )}

    {activeSection === 'physics' && sectionCreated.physics && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MCQMaker activeSection={activeSection} addQuestion={addQuestion} />
        <QuestionsList
          activeSection={activeSection}
          examForm={examForm}
          removeQuestion={removeQuestion}
          loadingRemoveQuestion={loadingRemoveQuestion}
        />
      </div>
    )}

    {/* ========== CHEMISTRY SECTION ========== */}
    {activeSection === 'chemistry' && !sectionCreated.chemistry && (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-700 font-medium mb-4">
          This section is not created yet. <br />
          Enter allotted time & sequence order for this section to create it.
        </p>
        <input
          type="number"
          placeholder="Enter allotted time (min)"
          value={examForm.chemistry.timeLimit}
          onChange={(e) =>
            setExamForm({
              ...examForm,
              chemistry: {
                ...examForm.chemistry,
                timeLimit: e.target.value,
              },
            })
          }
          className="px-4 py-2 border rounded-lg w-1/2 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <br />
        <input
          type="number"
          placeholder="Enter sequence order"
          value={examForm.chemistry.sequenceOrder}
          onChange={(e) =>
            setExamForm({
              ...examForm,
              chemistry: {
                ...examForm.chemistry,
                sequenceOrder: e.target.value,
              },
            })
          }
          className="px-4 py-2 border rounded-lg w-1/2 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <br />
        <button
          onClick={handleCreateSection}
          disabled={!examForm.chemistry.timeLimit || !examForm.chemistry.sequenceOrder || loadingCreateSection}
          className={`ml-3 ${
            !examForm.chemistry.timeLimit || !examForm.chemistry.sequenceOrder
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-700"
          } text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center`}
        >
          {loadingCreateSection ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Create Section"
          )}
        </button>
      </div>
    )}

    {activeSection === 'chemistry' && sectionCreated.chemistry && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MCQMaker activeSection={activeSection} addQuestion={addQuestion} />
        <QuestionsList
          activeSection={activeSection}
          examForm={examForm}
          removeQuestion={removeQuestion}
          loadingRemoveQuestion={loadingRemoveQuestion}
        />
      </div>
    )}

    {/* ========== BIOLOGY SECTION ========== */}
    {activeSection === 'biology' && !sectionCreated.biology && (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-700 font-medium mb-4">
          This section is not created yet. <br />
          Enter allotted time & sequence order for this section to create it.
        </p>
        <input
          type="number"
          placeholder="Enter allotted time (min)"
          value={examForm.biology.timeLimit}
          onChange={(e) =>
            setExamForm({
              ...examForm,
              biology: {
                ...examForm.biology,
                timeLimit: e.target.value,
              },
            })
          }
          className="px-4 py-2 border rounded-lg w-1/2 mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <br />
        <input
          type="number"
          placeholder="Enter sequence order"
          value={examForm.biology.sequenceOrder}
          onChange={(e) =>
            setExamForm({
              ...examForm,
              biology: {
                ...examForm.biology,
                sequenceOrder: e.target.value,
              },
            })
          }
          className="px-4 py-2 border rounded-lg w-1/2 mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <br />
        <button
          onClick={handleCreateSection}
          disabled={!examForm.biology.timeLimit || !examForm.biology.sequenceOrder || loadingCreateSection}
          className={`ml-3 ${
            !examForm.biology.timeLimit || !examForm.biology.sequenceOrder
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-teal-600 hover:bg-teal-700"
          } text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center`}
        >
          {loadingCreateSection ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Create Section"
          )}
        </button>
      </div>
    )}

    {activeSection === 'biology' && sectionCreated.biology && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MCQMaker activeSection={activeSection} addQuestion={addQuestion} />
        <QuestionsList
          activeSection={activeSection}
          examForm={examForm}
          removeQuestion={removeQuestion}
          loadingRemoveQuestion={loadingRemoveQuestion}
        />
      </div>
    )}

    {/* ========== ESSAY SECTION ========== */}
    {/* {activeSection === 'essay' && !sectionCreated.essay && (
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
          disabled={!examForm.essay.timeLimit || !examForm.essay.sequenceOrder}
          className={`ml-3 ${
            !examForm.essay.timeLimit || !examForm.essay.sequenceOrder
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white px-4 py-2 rounded-lg transition-colors`}
        >
          Create Section
        </button>
      </div>
    )} */}

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
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                  disabled={isEditingExam || loadingAddExam}
                >
                  {loadingAddExam ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Create Exam"
                  )}
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
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                  disabled={loadingSectionDelete}
                >
                  {loadingSectionDelete ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Confirm"
                  )}
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
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                  disabled={loadingExamDelete}
                >
                  {loadingExamDelete ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Confirm"
                  )}
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
      
      {/* Edit Modal */}
  {editModalOpen && editingExamId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Exam Details</h3>
              <button 
                onClick={() => setEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateExamDetails}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Title
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center space-x-2"
                  disabled={loadingEditStatus[editingExamId]}
                >
                  {loadingEditStatus[editingExamId] ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4" />
                      <span>Update</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
