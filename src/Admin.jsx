import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import ReadingPassageQuestions from './ReadingPassageQuestions';
import { fetchPassageForReadingSet } from './utils/passageUtils';
import { Users, BookOpen, Plus, Edit3, Trash2, Eye, EyeOff, GraduationCap, FileText, Calculator, Book, PenTool, X, 
         ScrollText, CircuitBoard, FlaskConical, Stethoscope, UserCircle2, Calendar, Search, ImagePlus, BarChart, PieChart, Share2, Link, Copy } from 'lucide-react';
import './components/Tooltip.css';
import toastService from './utils/toast.jsx';
import { setStorageItem, getStorageItem, removeStorageItem, debugImageStorage } from './utils/localStorageHelper';
import { 
  BACKEND_URL, 
  fetchReadingPassage as apiGetReadingPassage,
  fetchQuestionsForPassage as apiGetPassageQuestions,
  createReadingPassage,
  addQuestionToReadingPassage,
  removeQuestionFromPassage
} from './utils/api';
import { getExams, createExam, createSection, createQuestions, dropExam, forceDropExam, fetchExamsById, 
        deleteQuestion, deleteSection, toggleExamPublishStatus, updateExamBasicDetails, createQuestionSet, 
        fetchQuestionSet, addQuestionToSet, removeQuestionFromSet, fetchQuestionsForSet, searchQuestionSets,
        editQuestionSet, deleteQuestionSet, getExamStatistics, generateExamLink, updateUserType } from './utils/api';
        
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
  const [questionSet, setQuestionSet] = useState([]);
  const [activeQuestionSet, setActiveQuestionSet] = useState(null);
  const [activeQuestionSetData, setActiveQuestionSetData] = useState(null);
  const [showMathMCQForm, setShowMathMCQForm] = useState(false);
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [questionsForSet, setQuestionsForSet] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingAddSetQuestion, setLoadingAddSetQuestion] = useState(false);
  const [loadingRemoveSetQuestion, setLoadingRemoveSetQuestion] = useState({});
  const [questionSetSearch, setQuestionSetSearch] = useState('');
  const [filteredQuestionSets, setFilteredQuestionSets] = useState([]);
  const [loadingQuestionSets, setLoadingQuestionSets] = useState(false);
  const [showQuestionSetSearch, setShowQuestionSetSearch] = useState(false);
  
  // States for edit and delete question set
  const [showEditQuestionSetModal, setShowEditQuestionSetModal] = useState(false);
  const [editQuestionSetData, setEditQuestionSetData] = useState({ id: null, subject_name: '', set_name: '' });
  const [loadingEditQuestionSet, setLoadingEditQuestionSet] = useState(false);
  const [loadingDeleteQuestionSet, setLoadingDeleteQuestionSet] = useState({});
  const [showDeleteQuestionSetConfirm, setShowDeleteQuestionSetConfirm] = useState(false);
  
  // Reading passage specific states
  const [readingPassage, setReadingPassage] = useState('');
  const [readingPassageData, setReadingPassageData] = useState(null);
  const [questionsForPassage, setQuestionsForPassage] = useState([]);
  const [loadingPassage, setLoadingPassage] = useState(false);
  const [loadingRemovePassageQuestion, setLoadingRemovePassageQuestion] = useState({});
  const [questionSetToDelete, setQuestionSetToDelete] = useState(null);
  
  // Ref for debouncing the search
  const searchTimeoutRef = useRef(null);

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
  // Image handling
  const [questionImage, setQuestionImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
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
    setReadingPassage('');
    setReadingPassageData(null);
    setQuestionsForPassage([]);
    setLoadingPassage(false);
    setLoadingRemovePassageQuestion({});
    setQuestionImage(null);
    setImagePreview(null);
    setUploadedImage(null);
    setImageId(null);
    
    // Clear localStorage entries related to the image
    localStorage.removeItem('lastUploadedImageId');
    localStorage.removeItem('lastUploadedImagePath');
    setQuestionModalBank({
      english: [],
      math: [],
      reading: [],
      physics: [],
      chemistry: [],
      biology: [],
    });
  };
  
  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        toastService.error('Please select an image file (jpg, jpeg, png, gif)');
        return;
      }
      
      setQuestionImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Cancel image selection
  const cancelImageSelection = () => {
    setQuestionImage(null);
    setImagePreview(null);
    setUploadedImage(null);
    setImageId(null);
    
    // Clear localStorage entries related to the image
    localStorage.removeItem('lastUploadedImageId');
    localStorage.removeItem('lastUploadedImagePath');
  };
  
  // Upload image to server
  const uploadQuestionImage = async () => {
    if (!questionImage) {
      toastService.error('No image selected');
      return null;
    }
    
    setIsUploading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', questionImage);
      
      // Upload the image
      const response = await fetch(`${BACKEND_URL}/question-images/upload`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('adminToken')}`
          // Do not set Content-Type here, browser will set it automatically with boundary
        },
        body: formData
      });
      
      const result = await response.json();
      
      console.log("Image upload response:", result);
      if (result.success) {
        toastService.success('Image uploaded successfully');
        
        // Check if the response has the expected structure
        if (!result.data || !result.data.image) {
          console.error("Unexpected API response structure:", result);
          toastService.error('Unexpected response from server');
          return null;
        }
        
        // Store the full response data
        setUploadedImage(result.data);
        
        // Extract and store the image ID
        const uploadedImageId = result.data.image?.id;
        setImageId(uploadedImageId);
        
        // Use our helper to store values
        setStorageItem('lastUploadedImageId', uploadedImageId);
        setStorageItem('lastUploadedImagePath', result.data.image?.path || '');
        
        // Debug storage values
        debugImageStorage();
        
        // Log the image ID to the console
        console.log("Uploaded Image ID:", uploadedImageId);
        console.log("Complete image data:", result.data);
        console.log("Image path:", result.data.image?.path);
        
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toastService.error(`Upload failed: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Function to fetch a specific reading passage by ID
  const fetchReadingPassage = async (passageId) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${BACKEND_URL}/reading/passages/${passageId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log("Fetched passage:", data);
        return data;
      } else {
        throw new Error(data.message || 'Failed to fetch reading passage');
      }
    } catch (error) {
      console.error("Error fetching reading passage:", error);
      toastService.error(`Failed to fetch reading passage: ${error.message}`);
      return null;
    }
  };

  // Add question for current subject
  const handleAddQuestion = async (q) => {
    // First, upload the image if one is selected
    let uploadedImageData = null;
    let currentImageId = null;
    
    if (questionImage && !uploadedImage) {
      uploadedImageData = await uploadQuestionImage();
      if (!uploadedImageData) {
        toastService.error('Failed to upload image. Please try again.');
        return;
      }
      // After upload, get the image ID from localStorage for reliability
      currentImageId = localStorage.getItem('lastUploadedImageId');
      console.log("Newly uploaded image ID (from localStorage):", currentImageId);
    } else if (uploadedImage) {
      uploadedImageData = uploadedImage;
      // Get the image ID from localStorage for reliability
      currentImageId = localStorage.getItem('lastUploadedImageId') || imageId;
      console.log("Using stored image ID (from localStorage):", currentImageId);
    }
    
    // Always double-check localStorage for the image ID
    if (!currentImageId && localStorage.getItem('lastUploadedImageId')) {
      currentImageId = localStorage.getItem('lastUploadedImageId');
      console.log("Recovered image ID from localStorage:", currentImageId);
    }
    
    console.log("Using image ID for question:", currentImageId);
    
    let newQ;
    if (activeQuestionSubject === 'math') {
      newQ = q; // MathMCQMaker provides the full question object
      // Store the math question form for later use
      setMathQuestionForm(newQ);
      
      // Add image data if available
      if (currentImageId) {
        newQ.image_id = parseInt(currentImageId, 10);
        newQ.image_path = localStorage.getItem('lastUploadedImagePath') || '';
        console.log("Added image to math question with ID (from localStorage):", currentImageId);
      }
    } else {
      newQ = {
        id: Date.now(),
        question: questionInput,
        options: [...questionOptions],
        correctAnswer: correctOption,
        hasMath: false,
      };
      
      // Add image data if available
      if (currentImageId) {
        newQ.image_id = parseInt(currentImageId, 10);
        newQ.image_path = localStorage.getItem('lastUploadedImagePath') || '';
        console.log("Added image to regular question with ID (from localStorage):", currentImageId);
      }
    }
    
    // Add to local state for preview
    setQuestionModalBank((prev) => ({
      ...prev,
      [activeQuestionSubject]: [newQ, ...prev[activeQuestionSubject]],
    }));

    // If we're working with an existing question set, also add to the API
    if (activeQuestionSetData?.id) {
      try {
        // For math, handle differently as needed
        const questionText = activeQuestionSubject === 'math' ? newQ.question : questionInput;
        const options = activeQuestionSubject === 'math' ? newQ.options : questionOptions;
        
        // Ensure we have valid options array
        if (!options || !Array.isArray(options) || options.length === 0) {
          toastService.error('Options are required');
          return;
        }
        
        // Calculate the correct answer safely
        let correctAnswer;
        if (activeQuestionSubject === 'math') {
          // Make sure newQ.correctAnswer is a valid index
          if (newQ.correctAnswer !== null && newQ.correctAnswer !== undefined && 
              newQ.correctAnswer >= 0 && newQ.correctAnswer < options.length) {
            correctAnswer = options[newQ.correctAnswer];
          } else {
            toastService.error('Please select a correct answer');
            return;
          }
        } else {
          // For non-math subjects
          if (correctOption !== null && correctOption !== undefined && 
              correctOption >= 0 && correctOption < options.length) {
            correctAnswer = options[correctOption];
          } else {
            toastService.error('Please select a correct answer');
            return;
          }
        }
        
        // Use the numeric ID, not the object
        const questionSetId = activeQuestionSetData.id;
        console.log("Adding question to set ID:", questionSetId);
        console.log("Question text:", questionText);
        console.log("Options:", options);
        console.log("Correct answer:", correctAnswer);
        
        // Validate required fields before sending to API
        if (!questionText || questionText.trim() === '') {
          toastService.error('Question text is required');
          return;
        }
        
        // Transform options to the correct format if needed
        // If backend expects an array of strings and not objects
        const formattedOptions = Array.isArray(options) ? options.map(opt => 
          typeof opt === 'object' && opt !== null ? opt.text : opt
        ) : options;
        
        // If we have an image, include the image_id in the question
        // Get the image ID using our helper
        const storedImageId = getStorageItem('lastUploadedImageId');
        console.log("Checking localStorage before adding question:", storedImageId);
        
        // Debug all stored values
        debugImageStorage();
        
        if (storedImageId) {
          // Always get the image ID from localStorage for maximum reliability
          const numericImageId = parseInt(storedImageId, 10);
            
          console.log("Passing image ID to addQuestionToSet (from localStorage):", numericImageId);
          
          await handleAddQuestionToSet(
            questionSetId,
            questionText,
            'mcq',
            formattedOptions,
            correctAnswer,
            numericImageId
          );
          console.log("Added question to set with image ID:", numericImageId);
        } else {
          await handleAddQuestionToSet(
            questionSetId,
            questionText,
            'mcq',
            formattedOptions,
            correctAnswer
          );
        }
      } catch (error) {
        console.error("Error adding question to set:", error);
        toastService.error(`Error: ${error.message || 'Failed to add question to set'}`);
      }
    }
    
    // Reset only the input for the current subject
    if (activeQuestionSubject === 'math') {
      setMathQuestionForm(null);
    } else {
      setQuestionInput('');
      setQuestionOptions(['', '', '', '']);
      setCorrectOption(null);
    }
    
    if (!activeQuestionSetData) {
      toastService.success('Question added!');
    }
  };
  const [activeTab, setActiveTab] = useState('exams');
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  // Pagination for students
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(9); // Show 9 students per page to fit 3x3 grid
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: '', id: '', email: '' });
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    english: { questions: [], timeLimit: '', sequenceOrder: '' },
    math: { questions: [], timeLimit: '', sequenceOrder: '' },
    reading: { questions: [], timeLimit: '', sequenceOrder: '' },
    essay: { topics: [], timeLimit: '', sequenceOrder: '' },
    physics: { questions: [], timeLimit: '', sequenceOrder: '' },
    chemistry: { questions: [], timeLimit: '', sequenceOrder: '' },
    biology: { questions: [], timeLimit: '', sequenceOrder: '' }
  });
  const [activeSection, setActiveSection] = useState('english');
  const [sectionCreated, setSectionCreated] = useState({
  english: false,
  math: false,
  reading: false,
  essay: false,
  physics: false,
  chemistry: false,
  biology: false
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
  
  // Statistics modal state
  const [statisticsModalOpen, setStatisticsModalOpen] = useState(false);
  const [currentStatistics, setCurrentStatistics] = useState(null);
  const [loadingStatistics, setLoadingStatistics] = useState(false);
  const [currentExamForStats, setCurrentExamForStats] = useState(null);
  
  // Exam Link Generation
  const [showExamLinkModal, setShowExamLinkModal] = useState(false);
  const [currentExamLink, setCurrentExamLink] = useState(null);
  const [loadingExamLink, setLoadingExamLink] = useState(false);
  const [loadingShareExam, setLoadingShareExam] = useState({});
  const [linkVisibility, setLinkVisibility] = useState('public');
  const [linkCopied, setLinkCopied] = useState(false);
  
  // User Type Update
  const [loadingUserTypeUpdate, setLoadingUserTypeUpdate] = useState({});

  // Function to handle generating exam link
  const handleGenerateExamLink = async (e, examId, examTitle) => {
    e.stopPropagation(); // Prevent parent click event (edit exam)
    
    try {
      setLoadingShareExam(prev => ({ ...prev, [examId]: true }));
      const result = await generateExamLink(examId);
      
      if (result.success) {
        setCurrentExamLink({
          id: examId,
          title: examTitle,
          ...result.data
        });
        setShowExamLinkModal(true);
      } else {
        toastService.error("Failed to generate exam link");
      }
    } catch (error) {
      toastService.error(`Error: ${error.message}`);
    } finally {
      setLoadingShareExam(prev => ({ ...prev, [examId]: false }));
    }
  };

  // Function to toggle link visibility
  const handleToggleLinkVisibility = () => {
    setLinkVisibility(prev => prev === 'public' ? 'private' : 'public');
  };

  // Function to copy link to clipboard
  const handleCopyLink = () => {
    if (currentExamLink?.access_link) {
      navigator.clipboard.writeText(currentExamLink.access_link)
        .then(() => {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
        })
        .catch(() => {
          toastService.error("Failed to copy link");
        });
    }
  };

  // Function to handle updating user type
  const handleUpdateUserType = async (userId, currentType) => {
    try {
      const newType = currentType === 'public' ? 'enrolled' : 'public';
      setLoadingUserTypeUpdate(prev => ({ ...prev, [userId]: true }));
      
      const result = await updateUserType(userId, newType);
      
      if (result.success) {
        // Update the students list with the new user type
        setStudents(students.map(student => 
          student.id === userId ? { ...student, user_type: newType } : student
        ));
        
        // Also update filtered students
        setFilteredStudents(filteredStudents.map(student => 
          student.id === userId ? { ...student, user_type: newType } : student
        ));
        
        toastService.success(`User type updated to ${newType}`);
      }
    } catch (error) {
      toastService.error(`Error updating user type: ${error.message}`);
    } finally {
      setLoadingUserTypeUpdate(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Function to fetch and display exam statistics
  const handleViewStatistics = async (e, examId, examTitle) => {
    e.stopPropagation(); // Prevent parent click event (edit exam)
    
    try {
      setLoadingStatistics(true);
      setCurrentExamForStats({ id: examId, title: examTitle });
      const statistics = await getExamStatistics(examId);
      console.log("Exam statistics:", statistics);
      setCurrentStatistics(statistics);
      setStatisticsModalOpen(true);
    } catch (error) {
      console.error('Error fetching exam statistics:', error);
      toastService.error('Failed to fetch exam statistics');
    } finally {
      setLoadingStatistics(false);
    }
  };

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

  const handleCreateQuestionSet = async () => {
    try {
      const response = await createQuestionSet(questionSetSubject, questionSetName);
      console.log("Created question set:", response);
      toastService.success('Question set created successfully!');

      setActiveQuestionSubject(questionSetSubject);
      setQuestionSetCreated(true);
      
      // Store the question set data to use when adding questions
      if (response.success) {
        setActiveQuestionSetData(response.data);
      }

    } catch (error) {
      console.error("Error creating question set:", error);
      toastService.error('Failed to create question set');
    }
  };
  
  const handleCreateReadingPassage = async () => {
    if (!readingPassage.trim()) {
      toastService.error('Please enter a reading passage');
      return;
    }
    
    try {
      setLoadingPassage(true);
      
      // Extract title from the first three words of the passage
      const passageWords = readingPassage.trim().split(/\s+/);
      const title = passageWords.slice(0, 3).join(' ') + '...';
      const wordCount = passageWords.length;
      
      // Use the API function from utils/api.js
      const response = await createReadingPassage(readingPassage, wordCount);
      
      if (response.success) {
        console.log("Reading passage created:", response.data);
        toastService.success('Reading passage added successfully!');
        
        // Store passage data for adding questions
        // The API returns the passage object inside data.passage
        setReadingPassageData(response.data.passage);
        // Initialize empty questions array for this new passage
        setQuestionsForPassage([]);
      } else {
        throw new Error('Failed to create reading passage');
      }
    } catch (error) {
      console.error("Error creating reading passage:", error);
      toastService.error(`Failed to create reading passage: ${error.message}`);
    } finally {
      setLoadingPassage(false);
    }
  };

  const handleAddQuestionButtonClick = () => {
    if (activeQuestionSubject === 'reading' && readingPassageData) {
      // For reading subject with a reading passage
      if (!questionInput || questionInput.trim() === '') {
        toastService.error('Question text is required');
        return;
      }
      
      if (questionOptions.some(opt => !opt)) {
        toastService.error('All options must be filled');
        return;
      }
      
      if (correctOption === null) {
        toastService.error('Please select a correct answer');
        return;
      }
      
      // Handle reading passage questions
      console.log("Reading passage data for question:", readingPassageData);
      
      if (!readingPassageData || !readingPassageData.id) {
        toastService.error('Reading passage ID is missing. Please try again.');
        return;
      }
      
      if (!activeQuestionSetData || !activeQuestionSetData.id) {
        toastService.error('No active question set selected. Please create or select a question set first.');
        return;
      }
      
      handleAddQuestionToReadingPassage(
        readingPassageData.id,
        questionInput,
        questionOptions,
        correctOption
      );
    } else if (activeQuestionSubject === 'math') {
      // Make sure we have all required parameters
      if (!activeQuestionSetData?.id) {
        toastService.error('No active question set selected');
        return;
      }
      
      // For math, we need to check if the user has created a question in the math form
      if (!mathQuestionForm) {
        toastService.error('Please create a math question first');
        return;
      }
      
      // Handle math question submission
      const questionText = mathQuestionForm.question;
      const options = mathQuestionForm.options;
      
      // Make sure we have a valid correctAnswer index
      if (mathQuestionForm.correctAnswer === null || 
          mathQuestionForm.correctAnswer === undefined || 
          mathQuestionForm.correctAnswer < 0 || 
          mathQuestionForm.correctAnswer >= options.length) {
        toastService.error('Invalid correct answer selection');
        return;
      }
      
      // Get the correct answer string
      const correctAnswer = options[mathQuestionForm.correctAnswer];
      
      if (!questionText || questionText.trim() === '') {
        toastService.error('Question text is required');
        return;
      }
      
      handleAddQuestionToSet(
        activeQuestionSetData.id,
        questionText,
        'mcq',
        options,
        correctAnswer
      );
    } else {
      // For other subjects
      // Make sure we have all required parameters
      if (!activeQuestionSetData?.id) {
        toastService.error('No active question set selected');
        return;
      }
      
      if (!questionInput || questionInput.trim() === '') {
        toastService.error('Question text is required');
        return;
      }
      
      if (questionOptions.some(opt => !opt)) {
        toastService.error('All options must be filled');
        return;
      }
      
      if (correctOption === null) {
        toastService.error('Please select a correct answer');
        return;
      }
      
      // Call with proper parameters for non-math questions
      handleAddQuestionToSet(
        activeQuestionSetData.id,
        questionInput,
        'mcq',
        questionOptions,
        questionOptions[correctOption]
      );
    }
  };

  // Handle searching question sets
  const handleSearchQuestionSets = async (searchTerm, subject) => {
    try {
      setLoadingQuestionSets(true);
      const response = await searchQuestionSets(searchTerm, subject);
      
      if (response.success) {
        // Filter the question sets by name containing the search term
        const filtered = searchTerm 
          ? response.data.filter(set => 
              set.set_name.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : response.data;
        
        setFilteredQuestionSets(filtered);
      } else {
        setFilteredQuestionSets([]);
      }
    } catch (error) {
      console.error("Error searching question sets:", error);
      toastService.error('Failed to search question sets');
      setFilteredQuestionSets([]);
    } finally {
      setLoadingQuestionSets(false);
    }
  };

  // Function to handle question set search input changes
  const handleQuestionSetSearchChange = (e) => {
    const value = e.target.value;
    setQuestionSetSearch(value);
    
    // Debounce the search to avoid too many API calls
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      handleSearchQuestionSets(value, activeSection);
    }, 300);
  };
  
  // Toggle showing the question set search interface
  const toggleQuestionSetSearch = () => {
    setShowQuestionSetSearch(prev => !prev);
    if (!showQuestionSetSearch) {
      // When opening, perform an initial search
      handleSearchQuestionSets('', activeSection);
    }
  };

  // Function to fetch questions for a specific reading passage
  const fetchQuestionsForPassage = async (setId) => {
    if (!readingPassageData) {
      console.log("No reading passage data available");
      return;
    }
    
    // Get the passage ID
    const passageId = readingPassageData.id || readingPassageData.uuid;
    if (!passageId) {
      console.log("No passage ID available");
      return;
    }
    
    try {
      setLoadingQuestions(true);
      
      // Fetch questions for the set using the API - this will include reading passage questions
      const response = await fetchQuestionsForSet(setId);
      
      if (response && response.success) {
        // Filter questions for this specific passage
        const passageQuestions = response.data.questions.filter(
          q => q.passage_id === passageId && q.question_type === 'reading_question'
        );
        
        console.log("Filtered passage questions:", passageQuestions);
        setQuestionsForPassage(passageQuestions);
      } else {
        throw new Error('Failed to fetch questions for passage');
      }
    } catch (error) {
      console.error("Error fetching passage questions:", error);
      toastService.error(error.message || 'Failed to fetch passage questions');
    } finally {
      setLoadingQuestions(false);
    }
  };
  
  // Function to fetch a specific reading passage by ID
  const fetchReadingPassageById = async (passageId) => {
    try {
      // Use the API function from utils/api.js
      const response = await apiGetReadingPassage(passageId);
      
      if (response.success) {
        setReadingPassageData(response.data);
        // After setting the passage data, fetch its questions
        await fetchQuestionsForPassage(activeQuestionSetData?.id);
      } else {
        throw new Error('Failed to fetch reading passage');
      }
    } catch (error) {
      console.error("Error fetching reading passage:", error);
      toastService.error(error.message || 'Failed to fetch reading passage');
    }
  };

  // Function to fetch questions for a set
  const fetchQuestionsForSet = async (setId) => {
    try {
      setLoadingQuestions(true);
      
      const response = await fetch(`${BACKEND_URL}/question-sets/${setId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setQuestionsForSet(data.data.questions || []);
        return data;
      } else {
        throw new Error(data.message || 'Failed to fetch questions');
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toastService.error(`Failed to fetch questions: ${error.message}`);
      setQuestionsForSet([]);
      return null;
    } finally {
      setLoadingQuestions(false);
    }
  };
  
  // Add question to a reading passage
  // Function to remove a question from a reading passage
  const handleRemoveQuestionFromPassage = async (questionId) => {
    try {
      setLoadingRemovePassageQuestion(prev => ({ ...prev, [questionId]: true }));
      
      // Use the API function from utils/api.js
      const response = await removeQuestionFromPassage(questionId);
      
      if (response.success) {
        toastService.success('Question removed successfully');
        // Update the local state by filtering out the removed question
        setQuestionsForPassage(prev => prev.filter(q => q.id !== questionId));
      } else {
        throw new Error('Failed to remove question');
      }
    } catch (error) {
      console.error("Error removing question:", error);
      toastService.error(error.message || 'Failed to remove question');
    } finally {
      setLoadingRemovePassageQuestion(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleAddQuestionToReadingPassage = async (passageId, questionText, options, correctAnswer) => {
    console.log("Adding question to reading passage:", passageId);
    console.log("Question text:", questionText);
    console.log("Options:", options);
    console.log("Correct answer:", correctAnswer);
    
    // Validate inputs
    if (!questionText || questionText.trim() === '') {
      toastService.error('Question text is required');
      return { success: false, error: 'Question text is required' };
    }
    
    if (!options || !Array.isArray(options) || options.length === 0) {
      toastService.error('Options are required');
      return { success: false, error: 'Options are required' };
    }
    
    if (correctAnswer === undefined || correctAnswer === null) {
      toastService.error('Correct answer is required');
      return { success: false, error: 'Correct answer is required' };
    }

    // We need a question set to associate this reading passage question with
    if (!activeQuestionSetData?.id) {
      toastService.error('Please create or select a question set first');
      return { success: false, error: 'Question set ID is required' };
    }
    
    try {
      setLoadingAddSetQuestion(true);
      
      // Format the options for the API
      const formattedOptions = options.map(opt => String(opt));
      const correctAnswerText = formattedOptions[correctAnswer];
      
      // Use the API function that requires setId
      const response = await addQuestionToReadingPassage(
        activeQuestionSetData.id, // setId - required by updated API
        passageId,
        questionText,
        formattedOptions,
        correctAnswerText
      );
      
      if (response.success) {
        console.log("Question added to reading passage:", response.data);
        toastService.success('Question added to reading passage');
        
        // If the response contains the newly added question directly
        if (response.data.questions) {
          // Set the questions from the response
          const passageQuestions = response.data.questions.filter(
            q => q.passage_id === passageId && q.question_type === 'reading_question'
          );
          console.log("Setting questions from response:", passageQuestions);
          setQuestionsForPassage(passageQuestions);
        } else {
          // If not, add the new question to the existing list
          const newQuestion = {
            id: response.data.id || Date.now(),
            uuid: response.data.uuid,
            question_set_id: activeQuestionSetData.id,
            passage_id: passageId,
            question_text: questionText,
            question_type: 'reading_question',
            options: formattedOptions,
            correct_answer: correctAnswerText,
            created_at: new Date().toISOString()
          };
          
          setQuestionsForPassage(prev => [...prev, newQuestion]);
          
          // Also fetch from API to ensure consistency
          await fetchQuestionsForPassage(activeQuestionSetData.id);
        }

        // Reset the question form
        setQuestionInput('');
        setQuestionOptions(['', '', '', '']);
        setCorrectOption(null);
        
        return { success: true, data: response.data };
      } else {
        throw new Error('Failed to add question to reading passage');
      }
    } catch (error) {
      console.error("Error adding question to reading passage:", error);
      toastService.error(`Failed to add question: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoadingAddSetQuestion(false);
    }
  };

  // Add questions from a question set to a section
  const addQuestionsFromSet = async (questionSetId, section) => {
    try {
      // First fetch the questions in the set
      const response = await fetchQuestionsForSet(questionSetId);
      
      if (response.success && response.data.questions && response.data.questions.length > 0) {
        console.log("Questions from set:", response.data.questions);
        
        // Add each question to the section
        for (const question of response.data.questions) {
          // Find the index of the correct answer in the options array
          console.log("Question:", question);
          console.log("Options:", question.options);
          console.log("Correct answer:", question.correct_answer);
          
          const correctIndex = question.options.findIndex(
            option => option === question.correct_answer
          );
          
          console.log("Correct index found:", correctIndex);
          
          const newQuestion = {
            id: Date.now() + Math.random(), // Temporary ID
            question: question.question_text,
            options: question.options,
            correctAnswer: correctIndex >= 0 ? correctIndex : 0, // Default to first option if not found
            hasMath: section === 'math'
          };
          
          await addQuestion(section, newQuestion);
        }
        
        toastService.success(`Added ${response.data.questions.length} questions to ${section} section`);
      } else {
        toastService.info('No questions found in this set');
      }
    } catch (error) {
      console.error("Error adding questions from set:", error);
      toastService.error('Failed to add questions from set');
    }
  };

  const handleAddQuestionToSet = async (questionSetId, questionText, questionType, options, correctAnswer, imageId = null) => {
    console.log("Adding question with ID:", questionSetId);
    console.log("Question text:", questionText);
    console.log("Question type:", questionType);
    console.log("Options:", options);
    console.log("Correct answer:", correctAnswer);
    console.log("Image ID:", imageId);
    console.log("Image ID type:", typeof imageId);
    
    // Validate inputs before proceeding
    if (!questionText || questionText.trim() === '') {
      toastService.error('Question text is required');
      return { success: false, error: 'Question text is required' };
    }
    
    if (!options || !Array.isArray(options) || options.length === 0) {
      toastService.error('Options are required');
      return { success: false, error: 'Options are required' };
    }
    
    if (correctAnswer === undefined || correctAnswer === null || correctAnswer === '') {
      toastService.error('Correct answer is required');
      return { success: false, error: 'Correct answer is required' };
    }
    
    // Format options to ensure they're strings
    const formattedOptions = options.map(opt => {
      if (typeof opt === 'object' && opt !== null) {
        return opt.text || String(opt) || '';
      }
      return String(opt);
    });
    
    // Format correct answer to ensure it's a string
    let formattedAnswer;
    if (typeof correctAnswer === 'object' && correctAnswer !== null) {
      formattedAnswer = correctAnswer.text || String(correctAnswer) || '';
    } else {
      formattedAnswer = String(correctAnswer);
    }
    
    try {
      setLoadingAddSetQuestion(true);
      
      let response;
      
      // Handle adding questions to reading passage differently
      if (activeQuestionSubject === 'reading' && activePassageData) {
        // For reading questions, add them to the passage
        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) {
          throw new Error("Authentication required");
        }
        
        const responseData = await fetch(`${BACKEND_URL}/reading/passages/${activePassageData.id}/questions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminToken}`
          },
          body: JSON.stringify({
            question_text: questionText,
            options: formattedOptions,
            correct_answer: formattedAnswer
          }),
        });
        
        response = await responseData.json();
        
      } else {
        // Regular question set addition
        response = await addQuestionToSet(
          questionSetId, 
          questionText, 
          questionType, 
          formattedOptions, 
          formattedAnswer
        );
      }
      
      if (response && response.success) {
        // Refresh the questions list
        await fetchQuestionsForQuestionSet(questionSetId);
        toastService.success('Question added successfully!');
        return { success: true };
      } else {
        // Handle unexpected response format
        toastService.error('Received invalid response from server');
        return { success: false, error: 'Invalid server response' };
      }
    } catch (error) {
      console.error("Error adding question to set:", error);
      const errorMessage = error.message || 'Failed to add question to set';
      toastService.error(`Error: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setLoadingAddSetQuestion(false);
    }
  };

  const handleRemoveQuestionFromSet = async (questionId) => {
    try {
      // Ensure we're using a proper ID value, not an object
      const qId = typeof questionId === 'object' && questionId !== null ? questionId.id : questionId;
      console.log("Removing question ID:", qId);
      
      setLoadingRemoveSetQuestion(prev => ({ ...prev, [qId]: true }));
      const response = await removeQuestionFromSet(qId);
      
      if (response.success) {
        // Update the local state by removing the question
        setQuestionsForSet(prev => prev.filter(q => q.id !== qId));
        toastService.success('Question removed successfully!');
      }
    } catch (error) {
      console.error("Error removing question from set:", error);
      toastService.error('Failed to remove question from set');
    } finally {
      setLoadingRemoveSetQuestion(prev => ({ ...prev, [questionId]: false }));
    }
  };

  // Handle opening edit question set modal
  const handleOpenEditQuestionSetModal = (e, questionSet) => {
    e.stopPropagation(); // Prevent parent click event (open question set)
    setEditQuestionSetData({
      id: questionSet.id,
      subject_name: questionSet.subject_name,
      set_name: questionSet.set_name
    });
    setShowEditQuestionSetModal(true);
  };

  // Handle updating question set details
  const handleUpdateQuestionSet = async (e) => {
    e.preventDefault();
    if (!editQuestionSetData.id) return;
    
    setLoadingEditQuestionSet(true);
    
    try {
      const response = await editQuestionSet(
        editQuestionSetData.id,
        editQuestionSetData.subject_name,
        editQuestionSetData.set_name
      );
      
      if (response.success) {
        // Update the question sets list with the new details
        setQuestionSet(prevSets => 
          prevSets.map(set => 
            set.id === editQuestionSetData.id 
              ? { 
                  ...set, 
                  subject_name: editQuestionSetData.subject_name, 
                  set_name: editQuestionSetData.set_name 
                } 
              : set
          )
        );
        
        // Also update filtered question sets if any
        setFilteredQuestionSets(prevSets => 
          prevSets.map(set => 
            set.id === editQuestionSetData.id 
              ? { 
                  ...set, 
                  subject_name: editQuestionSetData.subject_name, 
                  set_name: editQuestionSetData.set_name 
                } 
              : set
          )
        );
        
        toastService.success('Question set updated successfully');
        setShowEditQuestionSetModal(false);
      }
    } catch (error) {
      console.error('Error updating question set:', error);
      toastService.error('Failed to update question set');
    } finally {
      setLoadingEditQuestionSet(false);
    }
  };

  // Handle delete question set
  const handleDeleteQuestionSet = (e, questionSet) => {
    e.stopPropagation(); // Prevent parent click event (open question set)
    setQuestionSetToDelete(questionSet);
    setShowDeleteQuestionSetConfirm(true);
  };

  // Confirm delete question set
  const confirmDeleteQuestionSet = async () => {
    if (!questionSetToDelete) return;
    
    try {
      setLoadingDeleteQuestionSet(prev => ({ ...prev, [questionSetToDelete.id]: true }));
      const response = await deleteQuestionSet(questionSetToDelete.id);
      
      if (response.success) {
        // Remove the deleted question set from the list
        setQuestionSet(prevSets => prevSets.filter(set => set.id !== questionSetToDelete.id));
        
        // Also remove from filtered question sets if any
        setFilteredQuestionSets(prevSets => prevSets.filter(set => set.id !== questionSetToDelete.id));
        
        toastService.success('Question set deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting question set:', error);
      
      // Handle foreign key constraint error specifically
      if (error.message.includes('questions exist') || error.message.includes('foreign key constraint')) {
        // Show a more detailed confirmation dialog for force delete
        const forceDelete = window.confirm(
          `This question set cannot be deleted because it contains questions that are used in exams.\n\n` +
          `Do you want to FORCE DELETE this question set?\n` +
          `WARNING: This will permanently delete the question set and all related questions!\n\n` +
          `Click OK to force delete, or Cancel to keep the question set.`
        );
        
        if (forceDelete) {
          try {
            // You would need to implement a force delete API function similar to forceDropExam
            // For now, we'll just use the same deleteQuestionSet with an additional parameter
            const forceResponse = await deleteQuestionSet(questionSetToDelete.id, true);
            
            if (forceResponse.success) {
              setQuestionSet(prevSets => prevSets.filter(set => set.id !== questionSetToDelete.id));
              setFilteredQuestionSets(prevSets => prevSets.filter(set => set.id !== questionSetToDelete.id));
              toastService.success('Question set force deleted successfully!');
            }
          } catch (forceError) {
            console.error("Failed to force delete question set:", forceError);
            toastService.error('Failed to force delete question set: ' + forceError.message);
          }
        }
      } else {
        toastService.error('Failed to delete question set: ' + error.message);
      }
    } finally {
      setLoadingDeleteQuestionSet(prev => ({ ...prev, [questionSetToDelete.id]: false }));
      setShowDeleteQuestionSetConfirm(false);
      setQuestionSetToDelete(null);
    }
  };

  const fetchQuestionsForQuestionSet = async (questionSetId) => {
    try {
      setLoadingQuestions(true);
      
      // Ensure we're using a proper ID value, not an object
      const setId = typeof questionSetId === 'object' && questionSetId !== null ? questionSetId.id : questionSetId;
      console.log("Fetching questions for set ID:", setId);
      
      const response = await fetchQuestionsForSet(setId);
      
      if (response.success) {
        // The questions are in response.data.questions
        if (response.data && response.data.questions) {
          console.log("Setting questions:", response.data.questions);
          setQuestionsForSet(response.data.questions);
        } else {
          console.log("No questions found in response", response.data);
          setQuestionsForSet([]);
        }
      }
    } catch (error) {
      console.error("Error fetching questions for set:", error);
      toastService.error('Failed to fetch questions for set');
      setQuestionsForSet([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const openQuestionSetModal = async (set) => {
    // Store the active question set data
    setActiveQuestionSet(set.uuid);
    setActiveQuestionSetData(set);
    setActiveQuestionSubject(set.subject_name);
    
    // Reset reading passage data initially
    setReadingPassageData(null);
    setQuestionsForPassage([]);
    
    // If this is a reading set, check if it already has a passage
    if (set.subject_name === 'reading') {
      console.log("Opening a reading question set, checking for passage...");
      try {
        const passageResult = await fetchPassageForReadingSet(set.id);
        console.log("Passage fetch result:", passageResult);
        
        if (passageResult.success && passageResult.data) {
          // We found a passage for this set, set it
          const passageData = passageResult.data;
          console.log("Setting passage data:", passageData);
          
          // Store the raw data for complete transparency
          window.debugPassageData = passageData;
          
          // Make sure it has the needed fields
          setReadingPassageData({
            ...passageData,
            // Make sure passage_text is available - try multiple possible field locations
            passage_text: passageData.passage_text || 
                          passageData.text || 
                          (passageData.passage && passageData.passage.text) || 
                          passageData.content || 
                          "",
            // Make sure id is available
            id: passageData.id || 
                passageData.uuid || 
                (passageData.passage && (passageData.passage.id || passageData.passage.uuid))
          });
          
          // Also set the questions for this passage
          if (passageResult.questions) {
            console.log("Setting questions for passage:", passageResult.questions.length);
            setQuestionsForPassage(passageResult.questions);
          }
          
          console.log("Found existing passage for reading set:", passageResult.data);
        } else {
          console.log("No existing passage found for this reading set");
          // This is a reading set without a passage, leave readingPassageData as null
          // to trigger the passage input UI
        }
      } catch (error) {
        console.error("Error fetching passage for reading set:", error);
        toastService.error('Failed to load reading passage');
      }
    }
    
    // Fetch questions for this set
    await fetchQuestionsForQuestionSet(set.id);
    
    // Open the modal
    setShowQuestionModal(true);
    setQuestionSetCreated(true);
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
        console.log("Exam sections:", exam.sections);
        setIsEditingExam(true);
        setExamCreated(true);
        
        // Initialize examForm with default values for all sections
        const examFormUpdate = {
          title: exam.title,
          description: exam.description,
          english: { questions: [], timeLimit: '', sequenceOrder: '' },
          math: { questions: [], timeLimit: '', sequenceOrder: '' },
          reading: { questions: [], timeLimit: '', sequenceOrder: '' },
          essay: { topics: [], timeLimit: '', sequenceOrder: '' },
          physics: { questions: [], timeLimit: '', sequenceOrder: '' },
          chemistry: { questions: [], timeLimit: '', sequenceOrder: '' },
          biology: { questions: [], timeLimit: '', sequenceOrder: '' }
        };

        // Initialize section state
        const sectionsState = {
          english: false,
          math: false,
          reading: false,
          essay: false,
          physics: false,
          chemistry: false,
          biology: false
        };

        // Process sections from API response
        if (exam.sections && exam.sections.length > 0) {
          exam.sections.forEach(section => {
            const sectionName = section.name.toLowerCase();
            
            // Map API section names to our section keys
            let sectionKey = sectionName;
            
            // Handle possible name variations from the API
            if (sectionName.includes('physics')) sectionKey = 'physics';
            if (sectionName.includes('chemistry')) sectionKey = 'chemistry';
            if (sectionName.includes('biology')) sectionKey = 'biology';
            if (sectionName.includes('english')) sectionKey = 'english';
            if (sectionName.includes('math')) sectionKey = 'math';
            if (sectionName.includes('reading')) sectionKey = 'reading';
            if (sectionName.includes('essay')) sectionKey = 'essay';
            
            console.log("Mapping section name:", sectionName, "to key:", sectionKey);
            
            if (examFormUpdate[sectionKey]) {
              sectionsState[sectionKey] = true;
              
              // Set time limit and sequence order - handle different API response formats
              examFormUpdate[sectionKey].timeLimit = 
                section.time_limit || 
                section.duration_minutes?.toString() || 
                '';
                
              examFormUpdate[sectionKey].sequenceOrder = 
                section.sequence_order?.toString() || 
                '';
              
              // Process questions if they exist
              if (section.questions && section.questions.length > 0) {
                console.log(`Processing ${section.questions.length} questions for section ${sectionKey}`);
                
                examFormUpdate[sectionKey].questions = section.questions.map(q => {
                  // Handle different question structures in API response
                  const questionText = q.question_text || q.question || '';
                  let options = [];
                  let correctOption = 0;
                  
                  // Handle different options formats
                  if (Array.isArray(q.options)) {
                    // Format 1: Array of option objects with text property
                    if (q.options[0] && typeof q.options[0] === 'object' && q.options[0].text) {
                      options = q.options.map(opt => opt.text);
                      
                      // Find correct option index
                      if (q.correct_answer) {
                        const correctIndex = q.options.findIndex(opt => 
                          opt.text === q.correct_answer || 
                          opt.id === q.correct_answer
                        );
                        correctOption = correctIndex >= 0 ? correctIndex : 0;
                      } else if (q.correct_option !== undefined) {
                        correctOption = q.correct_option;
                      }
                    } 
                    // Format 2: Array of string options
                    else if (typeof q.options[0] === 'string') {
                      options = q.options;
                      correctOption = q.correct_option !== undefined ? q.correct_option : 0;
                    }
                  }
                  
                  return {
                    id: q.id,
                    question: questionText,
                    options: options,
                    correctOption: correctOption
                  };
                });
              }
            }
          });
        }

        console.log("Final section state:", sectionsState);
        console.log("Final exam form update:", examFormUpdate);
        
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
      essay: { topics: [], timeLimit: '', sequenceOrder: '' },
      physics: { questions: [], timeLimit: '', sequenceOrder: '' },
      chemistry: { questions: [], timeLimit: '', sequenceOrder: '' },
      biology: { questions: [], timeLimit: '', sequenceOrder: '' }
    });
    setSectionCreated({
      english: false,
      math: false,
      reading: false,
      essay: false,
      physics: false,
      chemistry: false,
      biology: false
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
    const getQuestionSets = async () => {
      try {
        if(activeTab === 'questions') {
          const questionData = await fetchQuestionSet();
          if(questionData.success) {
            // Sort the question sets to show newest first
            const sortedQuestionSets = [...questionData.data].sort((a, b) => 
              new Date(b.created_at) - new Date(a.created_at)
            );
            setQuestionSet(sortedQuestionSets);
          }
        }
      } catch (err) {
        toastService.error("Failed to load question sets");
        console.error(err);
      }
    };

    getQuestionSets();
  }, [activeTab]);

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

        // Ask user for master key
        const masterKey = window.prompt("Please enter the master key:");
        if (!masterKey) {
          toastService.error("Master key is required");
          setIsLoadingStudents(false);
          return;
        }

        const response = await fetch(`${BACKEND_URL}/auth/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminToken}`,
            "masterkey": masterKey
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
      // Reset to first page when search is cleared
      setCurrentPage(1);
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
      // Reset to first page when search results change
      setCurrentPage(1);
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
          
          // Add this section to currentExamData if it exists
          if (currentExamData && currentExamData.sections) {
            setCurrentExamData({
              ...currentExamData,
              sections: [
                ...currentExamData.sections,
                {
                  id: res.data.section.id,
                  name: activeSection,
                  time_limit: examForm[activeSection].timeLimit,
                  sequence_order: examForm[activeSection].sequenceOrder
                }
              ]
            });
            console.log("Updated currentExamData with new section:", activeSection);
          }
          
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
    console.log("Deleting section:", sectionKey, sectionLabel);
    setSectionToDelete({ key: sectionKey, label: sectionLabel });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSection = async () => {
    if (!sectionToDelete || !currentExamData) return;

    try {
      setLoadingSectionDelete(true);
      // Find the section ID from currentExamData
      console.log("Looking for section:", sectionToDelete.key);
      console.log("Available sections:", currentExamData.sections);
      
      // Create a mapping of section keys to possible API section names
      const sectionNameMap = {
        'physics': ['physics', 'physical science', 'physical'],
        'chemistry': ['chemistry', 'chem'],
        'biology': ['biology', 'bio', 'biological science'],
        'english': ['english', 'eng', 'language'],
        'math': ['math', 'mathematics', 'maths'],
        'reading': ['reading', 'read', 'comprehension'],
        'essay': ['essay', 'writing', 'write']
      };
      
      // Get possible section names for the key
      const possibleSectionNames = sectionNameMap[sectionToDelete.key] || [sectionToDelete.key];
      
      // Find section in API data by checking all possible names
      let sectionData = null;
      if (currentExamData.sections) {
        for (const section of currentExamData.sections) {
          const sectionNameLower = section.name.toLowerCase();
          
          // Check if the section name matches any of the possible names
          const isMatch = possibleSectionNames.some(name => 
            sectionNameLower === name || 
            sectionNameLower.includes(name)
          );
          
          if (isMatch) {
            sectionData = section;
            console.log(`Found matching section: ${section.name} (id: ${section.id})`);
            break;
          }
        }
      }
      
      console.log("Found section data:", sectionData);
      
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
        
        // Update currentExamData to reflect the deletion
        if (currentExamData.sections) {
          setCurrentExamData({
            ...currentExamData,
            sections: currentExamData.sections.filter(s => s.id !== sectionData.id)
          });
        }
        
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
      } else {
        console.error("Could not find section ID for deletion:", sectionToDelete.key);
        toastService.error(`Failed to delete section: Could not find section ID for ${sectionToDelete.key}`);
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
                <p className="text-gray-600 text-sm">CampusPro Examination System</p>
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
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    // Get admin token from localStorage
                    const adminToken = localStorage.getItem("adminToken");
                    if (!adminToken) {
                      toastService.error("Authentication required");
                      return;
                    }

                    // Ask user for master key
                    const masterKey = window.prompt("Please enter the master key:");
                    if (!masterKey) {
                      toastService.error("Master key is required");
                      return;
                    }

                    try {
                      // Create a download link
                      const downloadLink = document.createElement("a");
                      downloadLink.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;

                      // Call API with headers
                      const response = await fetch(`${BACKEND_URL}/user-exports/export-users`, {
                        method: "GET",
                        headers: {
                          "Authorization": `Bearer ${adminToken}`,
                          "masterkey": masterKey,
                        },
                      });

                      if (!response.ok) {
                        throw new Error(`Error: ${response.status} ${response.statusText}`);
                      }

                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);

                      // Download file
                      downloadLink.href = url;
                      document.body.appendChild(downloadLink);
                      downloadLink.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(downloadLink);

                      toastService.success("Users exported successfully");
                    } catch (error) {
                      console.error("Error exporting users:", error);
                      toastService.error(`Failed to export users: ${error.message}`);
                    }
                  }}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                  <FileText className="w-5 h-5" />
                  <span>Export Users</span>
                </button>
                <button
                  onClick={() => setShowStudentForm(true)}
                  className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Student</span>
                </button>
              </div>
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
                // Display only current page of students
                filteredStudents
                  .slice((currentPage - 1) * studentsPerPage, currentPage * studentsPerPage)
                  .map((student) => (
                  <div key={student.uuid} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateUserType(student.id, student.user_type)}
                          className={`px-3 py-1 text-xs font-medium rounded ${student.user_type === 'enrolled' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition`}
                          disabled={loadingUserTypeUpdate[student.id]}
                        >
                          {loadingUserTypeUpdate[student.id] ? (
                            <div className="w-4 h-4 border-2 border-t-2 border-current rounded-full animate-spin mx-auto"></div>
                          ) : (
                            student.user_type === 'enrolled' ? "Change to Public" : "Change to Enrolled"
                          )}
                        </button>
                      </div>
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
                        <span className="font-medium mr-2">Status:</span> 
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          student.user_type === 'enrolled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.user_type}
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
            
            {/* Pagination Controls */}
            {filteredStudents.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.ceil(filteredStudents.length / studentsPerPage) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === index + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => 
                      Math.min(prev + 1, Math.ceil(filteredStudents.length / studentsPerPage))
                    )}
                    disabled={currentPage === Math.ceil(filteredStudents.length / studentsPerPage)}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === Math.ceil(filteredStudents.length / studentsPerPage)
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Question Sets</h2>
              <button
                onClick={() => setShowQuestionModal(true)} 
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Create Question Set</span>
              </button>
            </div>

            {/* Question Sets Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {questionSet?.length > 0 ? (
                questionSet.map((set) => (
                  <div
                    key={set.uuid}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 cursor-pointer relative"
                    onClick={() => openQuestionSetModal(set)}
                  >
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button
                        onClick={(e) => handleOpenEditQuestionSetModal(e, set)}
                        className="p-1 rounded-full text-blue-500 hover:text-blue-700 transition"
                        title="Edit Question Set"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={(e) => handleDeleteQuestionSet(e, set)}
                        className="p-1 rounded-full text-red-500 hover:text-red-700 transition"
                        title="Delete Question Set"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{set.set_name}</h3>
                        <p className="text-gray-600">{subjectTabs.find(s => s.key === set.subject_name)?.label || set.subject_name}</p>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <UserCircle2 className="w-4 h-4 mr-2" />
                        <span>{set.creator_name}</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(set.created_at).toLocaleDateString()}</span>
                      </div>
                      {/* <div className="flex space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveQuestionSet(set.uuid);
                            setActiveQuestionSetData(set);
                            setActiveQuestionSubject(set.subject_name);
                            setShowQuestionModal(true);
                            setQuestionSetCreated(true);
                          }}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition-colors"
                        >
                          Add Questions
                        </button>
                      </div> */}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">No question sets found</p>
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
                 onClick={async () => {
  // Get admin token from localStorage
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) {
    toastService.error("Authentication required");
    return;
  }

  // Ask user for master key
  const masterKey = window.prompt("Please enter the master key:");
  if (!masterKey) {
    toastService.error("Master key is required");
    return;
  }

  try {
    // Create a download link
    const downloadLink = document.createElement("a");
    downloadLink.download = `user-reports-${new Date().toISOString().split("T")[0]}.csv`;

    // Call API with headers
    const response = await fetch(`${BACKEND_URL}/reports/export-detailed-score-report`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${adminToken}`,
        "masterkey": masterKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Download file
    downloadLink.href = url;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(downloadLink);

    toastService.success("Report downloaded successfully");
  } catch (error) {
    console.error("Error downloading report:", error);
    toastService.error(`Failed to download report: ${error.message}`);
  }
}}

                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                >
                  <FileText className="w-5 h-5" />
                  <span>Export User Reports</span>
                </button>
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
                  onClick={handleCreateQuestionSet}
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
                          {/* Image preview area - positioned at the top */}
                          {imagePreview && (
                            <div className="mb-4 relative">
                              <div className="border border-gray-300 rounded-lg p-2 relative">
                                <img 
                                  src={imagePreview} 
                                  alt="Question image preview" 
                                  className="max-h-48 max-w-full mx-auto rounded"
                                />
                                <div className="mt-2 flex justify-between">
                                  <button
                                    type="button"
                                    onClick={cancelImageSelection}
                                    className="text-red-500 text-sm hover:text-red-700"
                                  >
                                    Remove
                                  </button>
                                  {!uploadedImage && !isUploading && (
                                    <button
                                      type="button"
                                      onClick={uploadQuestionImage}
                                      className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600"
                                    >
                                      Upload
                                    </button>
                                  )}
                                  {isUploading && (
                                    <span className="text-gray-500 text-sm">Uploading...</span>
                                  )}
                                  {uploadedImage && (
                                    <span className="text-green-500 text-sm">✓ Uploaded</span>
                                  )}
                                </div>
                                {/* Debug button to check localStorage */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const { imageId, imagePath } = debugImageStorage();
                                    alert(`Image ID in localStorage: ${imageId || 'Not found'}`);
                                  }}
                                  className="mt-2 text-xs text-blue-500 underline"
                                >
                                  Debug: Check localStorage
                                </button>
                              </div>
                            </div>
                          )}

                         <div className="flex justify-between w-full">
                            <div className="flex-1 flex justify-start">
                          <label className="block text-gray-700 text-sm font-medium mb-2">Question</label>
                          </div>
                          <div className="flex-1 flex justify-end text-gray-500 size-sm">
                            <input 
                              id="qstnImg" 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleImageSelect} 
                            />
                              <label htmlFor="qstnImg" className="cursor-pointer flex items-center">
                                <ImagePlus className="w-5 h-5 hover:text-blue-500 transition-colors"/>
                                
                              </label>
                            </div>
                          </div>
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
            onClick={(e) => handleGenerateExamLink(e, exam.id, exam.title)}
            className="p-1 rounded-full text-blue-500 hover:text-blue-700 transition"
            disabled={loadingShareExam[exam.id]}
            title="Share Exam Link"
          >
            {loadingShareExam[exam.id] ? (
              <div className="w-5 h-5 border-2 border-t-2 border-blue-500 rounded-full animate-spin"></div>
            ) : (
              <Share2 className="w-5 h-5" />
            )}
          </button>
        
          <button
            onClick={(e) => handleViewStatistics(e, exam.id, exam.title)}
            className="p-1 rounded-full text-blue-500 hover:text-blue-700 transition"
            disabled={loadingStatistics}
            title="View Statistics"
          >
            {loadingStatistics && currentExamForStats?.id === exam.id ? (
              <div className="w-5 h-5 border-2 border-t-2 border-blue-500 rounded-full animate-spin"></div>
            ) : (
              <BarChart className="w-5 h-5" />
            )}
          </button>
          
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
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Add English Question</h3>
            <button 
              onClick={toggleQuestionSetSearch}
              className="flex items-center text-blue-600 hover:text-blue-800"
              title="Search question sets"
            >
              <Search className="w-4 h-4 mr-1" />
              {showQuestionSetSearch ? 'Hide Sets' : 'Search Sets'}
            </button>
          </div>
          
          {showQuestionSetSearch ? (
            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search question sets by name..."
                  value={questionSetSearch}
                  onChange={handleQuestionSetSearchChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {loadingQuestionSets ? (
                <div className="text-center py-4">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                  </div>
                </div>
              ) : filteredQuestionSets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {filteredQuestionSets.map(set => (
                    <div 
                      key={set.id}
                      className="bg-white p-3 rounded border border-gray-200 hover:border-blue-400 cursor-pointer transition-colors relative group"
                    >
                      <div onClick={() => addQuestionsFromSet(set.id, activeSection)}>
                        <h4 className="font-medium text-gray-900">{set.set_name}</h4>
                        <p className="text-sm text-gray-500">Subject: {set.subject_name}</p>
                        <p className="text-xs text-gray-400 mt-1">Click to add questions from this set</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-2">No question sets found. Try a different search term.</p>
              )}
            </div>
          ) : null}
          
         {/* <MCQMaker activeSection={activeSection} addQuestion={addQuestion} /> */}
        </div>

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
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Add Math Question</h3>
            <button 
              onClick={toggleQuestionSetSearch}
              className="flex items-center text-blue-600 hover:text-blue-800"
              title="Search question sets"
            >
              <Search className="w-4 h-4 mr-1" />
              {showQuestionSetSearch ? 'Hide Sets' : 'Search Sets'}
            </button>
          </div>
          
          {showQuestionSetSearch ? (
            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search question sets by name..."
                  value={questionSetSearch}
                  onChange={handleQuestionSetSearchChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {loadingQuestionSets ? (
                <div className="text-center py-4">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                  </div>
                </div>
              ) : filteredQuestionSets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {filteredQuestionSets.map(set => (
                    <div 
                      key={set.id}
                      className="bg-white p-3 rounded border border-gray-200 hover:border-green-400 cursor-pointer transition-colors relative group"
                    >
                      <div onClick={() => addQuestionsFromSet(set.id, activeSection)}>
                        <h4 className="font-medium text-gray-900">{set.set_name}</h4>
                        <p className="text-sm text-gray-500">Subject: {set.subject_name}</p>
                        <p className="text-xs text-gray-400 mt-1">Click to add questions from this set</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-2">No question sets found. Try a different search term.</p>
              )}
            </div>
          ) : null}
          
          {/* <MathMCQMaker activeSection={activeSection} addQuestion={addQuestion} /> */}
        </div>
         
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
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Add Reading Question</h3>
            <button 
              onClick={toggleQuestionSetSearch}
              className="flex items-center text-blue-600 hover:text-blue-800"
              title="Search question sets"
            >
              <Search className="w-4 h-4 mr-1" />
              {showQuestionSetSearch ? 'Hide Sets' : 'Search Sets'}
            </button>
          </div>
          
          {showQuestionSetSearch ? (
            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search question sets by name..."
                  value={questionSetSearch}
                  onChange={handleQuestionSetSearchChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {loadingQuestionSets ? (
                <div className="text-center py-4">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                  </div>
                </div>
              ) : filteredQuestionSets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {filteredQuestionSets.map(set => (
                    <div 
                      key={set.id}
                      className="bg-white p-3 rounded border border-gray-200 hover:border-purple-400 cursor-pointer transition-colors relative group"
                    >
                      <div onClick={() => addQuestionsFromSet(set.id, activeSection)}>
                        <h4 className="font-medium text-gray-900">{set.set_name}</h4>
                        <p className="text-sm text-gray-500">Subject: {set.subject_name}</p>
                        <p className="text-xs text-gray-400 mt-1">Click to add questions from this set</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-2">No question sets found. Try a different search term.</p>
              )}
            </div>
          ) : null}
          
          {/* <MCQMaker activeSection={activeSection} addQuestion={addQuestion} /> */}
        </div>
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
          className="px-4 py-2 border rounded-lg w-1/2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="px-4 py-2 border rounded-lg w-1/2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <br />
        <button
          onClick={handleCreateSection}
          disabled={!examForm.physics.timeLimit || !examForm.physics.sequenceOrder || loadingCreateSection}
          className={`ml-3 ${
            !examForm.physics.timeLimit || !examForm.physics.sequenceOrder
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

    {activeSection === 'physics' && sectionCreated.physics && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Add Physics Question</h3>
            <button 
              onClick={toggleQuestionSetSearch}
              className="flex items-center text-red-600 hover:text-red-800"
              title="Search question sets"
            >
              <Search className="w-4 h-4 mr-1" />
              {showQuestionSetSearch ? 'Hide Sets' : 'Search Sets'}
            </button>
          </div>
          
          {showQuestionSetSearch ? (
            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search question sets by name..."
                  value={questionSetSearch}
                  onChange={handleQuestionSetSearchChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              {loadingQuestionSets ? (
                <div className="text-center py-4">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-red-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                  </div>
                </div>
              ) : filteredQuestionSets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {filteredQuestionSets.map(set => (
                    <div 
                      key={set.id}
                      className="bg-white p-3 rounded border border-gray-200 hover:border-red-400 cursor-pointer transition-colors relative group"
                    >
                      <div onClick={() => addQuestionsFromSet(set.id, activeSection)}>
                        <h4 className="font-medium text-gray-900">{set.set_name}</h4>
                        <p className="text-sm text-gray-500">Subject: {set.subject_name}</p>
                        <p className="text-xs text-gray-400 mt-1">Click to add questions from this set</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-2">No question sets found. Try a different search term.</p>
              )}
            </div>
          ) : null}
          
          {/* <MCQMaker activeSection={activeSection} addQuestion={addQuestion} /> */}
        </div>
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

    {activeSection === 'chemistry' && sectionCreated.chemistry && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Add Chemistry Question</h3>
            <button 
              onClick={toggleQuestionSetSearch}
              className="flex items-center text-orange-600 hover:text-orange-800"
              title="Search question sets"
            >
              <Search className="w-4 h-4 mr-1" />
              {showQuestionSetSearch ? 'Hide Sets' : 'Search Sets'}
            </button>
          </div>
          
          {showQuestionSetSearch ? (
            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search question sets by name..."
                  value={questionSetSearch}
                  onChange={handleQuestionSetSearchChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              {loadingQuestionSets ? (
                <div className="text-center py-4">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-orange-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                  </div>
                </div>
              ) : filteredQuestionSets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {filteredQuestionSets.map(set => (
                    <div 
                      key={set.id}
                      className="bg-white p-3 rounded border border-gray-200 hover:border-orange-400 cursor-pointer transition-colors relative group"
                    >
                      <div onClick={() => addQuestionsFromSet(set.id, activeSection)}>
                        <h4 className="font-medium text-gray-900">{set.set_name}</h4>
                        <p className="text-sm text-gray-500">Subject: {set.subject_name}</p>
                        <p className="text-xs text-gray-400 mt-1">Click to add questions from this set</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-2">No question sets found. Try a different search term.</p>
              )}
            </div>
          ) : null}
          
          {/* <MCQMaker activeSection={activeSection} addQuestion={addQuestion} /> */}
        </div>
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

    {activeSection === 'biology' && sectionCreated.biology && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Add Biology Question</h3>
            <button 
              onClick={toggleQuestionSetSearch}
              className="flex items-center text-teal-600 hover:text-teal-800"
              title="Search question sets"
            >
              <Search className="w-4 h-4 mr-1" />
              {showQuestionSetSearch ? 'Hide Sets' : 'Search Sets'}
            </button>
          </div>
          
          {showQuestionSetSearch ? (
            <div className="mb-4 bg-gray-50 p-4 rounded-lg">
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search question sets by name..."
                  value={questionSetSearch}
                  onChange={handleQuestionSetSearchChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              {loadingQuestionSets ? (
                <div className="text-center py-4">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-teal-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                  </div>
                </div>
              ) : filteredQuestionSets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {filteredQuestionSets.map(set => (
                    <div 
                      key={set.id}
                      className="bg-white p-3 rounded border border-gray-200 hover:border-teal-400 cursor-pointer transition-colors relative group"
                    >
                      <div onClick={() => addQuestionsFromSet(set.id, activeSection)}>
                        <h4 className="font-medium text-gray-900">{set.set_name}</h4>
                        <p className="text-sm text-gray-500">Subject: {set.subject_name}</p>
                        <p className="text-xs text-gray-400 mt-1">Click to add questions from this set</p>
                      </div>
                      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleOpenEditQuestionSetModal(e, set)}
                          className="text-teal-600 hover:text-teal-800 p-1"
                          title="Edit question set"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteQuestionSet(e, set)}
                          className="text-teal-600 hover:text-teal-800 p-1"
                          title="Delete question set"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-2">No question sets found. Try a different search term.</p>
              )}
            </div>
          ) : null}
          
          {/* <MCQMaker activeSection={activeSection} addQuestion={addQuestion} /> */}
        </div>
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
                <h3 className="text-xl font-bold text-gray-800">
                  {activeQuestionSetData ? `${activeQuestionSetData.set_name} - Add Questions` : 'Create Question Set'}
                </h3>
                <button
                  onClick={() => {
                    setShowQuestionModal(false);
                    setQuestionSetSubject('');
                    setQuestionSetName('');
                    setQuestionSetCreated(false);
                    setActiveQuestionSubject('');
                    setActiveQuestionSetData(null);
                    setQuestionsForSet([]);
                    setReadingPassage('');
                    setReadingPassageData(null);
                    setQuestionsForPassage([]);
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
                    onClick={handleCreateQuestionSet}
                  >
                    Create Question Set
                  </button>
                </div>
              ) : activeQuestionSubject === 'reading' && !readingPassageData ? (
                <div className="space-y-6">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Enter Reading Passage</label>
                    <textarea
                      value={readingPassage}
                      onChange={e => setReadingPassage(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-64"
                      placeholder="Enter the full text of the reading passage here..."
                    />
                  </div>
                  <button
                    className="bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={!readingPassage.trim()}
                    onClick={handleCreateReadingPassage}
                  >
                    {loadingPassage ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                    ) : (
                      'Create Reading Passage'
                    )}
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
                    ) : activeQuestionSubject === 'reading' && readingPassageData ? (
                      <>
                        <div className="mb-4">
                          <label className="block text-gray-700 text-sm font-medium mb-2">Reading Passage</label>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4 max-h-48 overflow-y-auto">
                            {readingPassageData && (
                              <>
                                {/* Try different possible field names for the passage text */}
                                {readingPassageData.passage_text ? (
                                  <div dangerouslySetInnerHTML={{ __html: readingPassageData.passage_text }}></div>
                                ) : readingPassageData.text ? (
                                  <div dangerouslySetInnerHTML={{ __html: readingPassageData.text }}></div>
                                ) : readingPassageData.content ? (
                                  <div dangerouslySetInnerHTML={{ __html: readingPassageData.content }}></div>
                                ) : readingPassageData.passage && readingPassageData.passage.text ? (
                                  <div dangerouslySetInnerHTML={{ __html: readingPassageData.passage.text }}></div>
                                ) : readingPassageData.data && readingPassageData.data.passage_text ? (
                                  <div dangerouslySetInnerHTML={{ __html: readingPassageData.data.passage_text }}></div>
                                ) : (
                                  <div className="text-danger">No passage text found.</div>
                                )}
                              </>
                            )}
                          </div>
                          <button
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            onClick={() => {
                              setReadingPassageData(null);
                              setQuestionsForPassage([]);
                            }}
                          >
                            Change Passage
                          </button>
                        </div>
                        <div>
                          <div className="flex justify-between w-full">
                            <div className="flex-1 flex justify-start">
                          <label className="block text-gray-700 text-sm font-medium mb-2">Question</label>
                          </div>
                          </div>
                          <textarea
                            value={questionInput}
                            onChange={e => setQuestionInput(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter question based on the reading passage"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-2 mt-4">Options</label>
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
                          onClick={handleAddQuestionButtonClick}
                          disabled={loadingAddSetQuestion || !questionInput || questionOptions.some(opt => !opt) || correctOption === null}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {loadingAddSetQuestion ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                          ) : (
                            'Add Question to Reading Passage'
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="flex justify-between w-full">
                            <div className="flex-1 flex justify-start">
                          <label className="block text-gray-700 text-sm font-medium mb-2">Question</label>
                          </div>
                          <div className="flex-1 flex justify-end text-gray-500 size-sm">
                            <input id="questionImg" type="file" className="hidden" />
                              <label htmlFor="questionImg">
                                <ImagePlus className="w-5 h-5 hover:text-blue-500 transition-colors"/>
                              </label>
                            </div>
                          </div>
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
                          onClick={handleAddQuestionButtonClick}
                          disabled={loadingAddSetQuestion || !questionInput || questionOptions.some(opt => !opt) || correctOption === null}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {loadingAddSetQuestion ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                          ) : (
                            'Add Question'
                          )}
                        </button>
                      </>
                    )}
                  </div>
                  {/* Right: Preview */}
                  <div>
                    <div className="font-semibold mb-2">
                      {activeQuestionSubject === 'reading' && readingPassageData ? 
                        'Questions for Reading Passage' : 
                        (activeQuestionSetData?.id ? 'Questions in Set' : 'Preview')}
                      ({subjectTabs.find(s=>s.key===activeQuestionSubject)?.label || ''})
                    </div>

                    {loadingQuestions ? (
                      <div className="text-center py-4">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                        </div>
                      </div>
                    ) : activeQuestionSubject === 'reading' && readingPassageData ? (
                      <ReadingPassageQuestions 
                        questions={questionsForPassage}
                        onRemoveQuestion={handleRemoveQuestionFromPassage}
                        loadingRemove={loadingRemovePassageQuestion}
                      />
                    ) : activeQuestionSetData?.id ? (
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {questionsForSet.length > 0 ? (
                          <div className="divide-y divide-gray-200">
                            {questionsForSet.map((question, index) => (
                              <div key={question.id} className="p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="text-gray-800 font-medium mb-2">
                                      {index + 1}. {question.question_text}
                                    </p>
                                    <div className="grid grid-cols-1 gap-1 ml-6">
                                      {question.options.map((option, idx) => (
                                        <div key={idx} className="flex items-center">
                                          <div 
                                            className={`w-4 h-4 rounded-full mr-2 ${option === question.correct_answer ? 'bg-green-600' : 'bg-gray-200'}`}>
                                          </div>
                                          <span className={option === question.correct_answer ? 'font-medium' : ''}>
                                            {option}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveQuestionFromSet(question.id)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                    disabled={loadingRemoveSetQuestion[question.id]}
                                  >
                                    {loadingRemoveSetQuestion[question.id] ? (
                                      <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <Trash2 className="w-5 h-5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center">
                            <p className="text-gray-500">No questions in this set yet.</p>
                          </div>
                        )}
                      </div>
                    ) : activeQuestionSubject === 'math' ? (
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
      
      {/* Statistics Modal */}
      {statisticsModalOpen && currentExamForStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Statistics for {currentExamForStats.title}</h3>
              <button 
                onClick={() => setStatisticsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {loadingStatistics ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : currentStatistics?.data ? (
              <div className="space-y-6">
                {/* Overall Statistics */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3">Overall Statistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded shadow-sm border border-blue-100">
                      <p className="text-sm text-gray-500">Total Attempts</p>
                      <p className="text-2xl font-bold text-blue-600">{currentStatistics.data.total_attempts || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm border border-blue-100">
                      <p className="text-sm text-gray-500">Overall Average</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {currentStatistics.data.overall_average !== undefined ? 
                          `${currentStatistics.data.overall_average.toFixed(2)}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Section Statistics */}
                {currentStatistics.data.section_statistics && currentStatistics.data.section_statistics.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Section Performance</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Section</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Sequence</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Avg. Score</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Avg. Correct</th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Total Questions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentStatistics.data.section_statistics.map((section, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="py-3 px-4 border-b capitalize">{section.section_name}</td>
                              <td className="py-3 px-4 border-b">{section.sequence_order}</td>
                              <td className="py-3 px-4 border-b">
                                {section.average_score !== undefined ? `${section.average_score.toFixed(2)}` : 'N/A'}
                              </td>
                              <td className="py-3 px-4 border-b">
                                {section.average_correct !== undefined ? `${section.average_correct.toFixed(2)}` : 'N/A'}
                              </td>
                              <td className="py-3 px-4 border-b">
                                {section.average_total || 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* No data case */}
                {(!currentStatistics.data.section_statistics || currentStatistics.data.section_statistics.length === 0) && (
                  <div className="text-center py-6">
                    <PieChart className="w-16 h-16 mx-auto text-gray-300" />
                    <p className="mt-4 text-gray-500">No detailed statistics available for this exam yet.</p>
                    <p className="text-sm text-gray-400">Statistics will appear once students start taking the exam.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">Failed to load statistics. Please try again.</p>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStatisticsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Set Modal */}
      {showEditQuestionSetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Edit Question Set</h3>
              <button
                onClick={() => setShowEditQuestionSetModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateQuestionSet}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name
                </label>
                <select
                  value={editQuestionSetData.subject_name}
                  onChange={(e) => setEditQuestionSetData({...editQuestionSetData, subject_name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Select Subject --</option>
                  {subjectTabs.map(subject => (
                    <option key={subject.key} value={subject.key}>{subject.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Set Name
                </label>
                <input
                  type="text"
                  value={editQuestionSetData.set_name}
                  onChange={(e) => setEditQuestionSetData({...editQuestionSetData, set_name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditQuestionSetModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center space-x-2"
                  disabled={loadingEditQuestionSet}
                >
                  {loadingEditQuestionSet ? (
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

      {/* Delete Question Set Confirmation Modal */}
      {showDeleteQuestionSetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Confirm Delete</h3>
              <button
                onClick={() => {
                  setShowDeleteQuestionSetConfirm(false);
                  setQuestionSetToDelete(null);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the question set "<span className="font-semibold">{questionSetToDelete?.set_name}</span>"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteQuestionSetConfirm(false);
                  setQuestionSetToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteQuestionSet}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center space-x-2"
                disabled={loadingDeleteQuestionSet[questionSetToDelete?.id]}
              >
                {loadingDeleteQuestionSet[questionSetToDelete?.id] ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Exam Link Modal */}
      {showExamLinkModal && currentExamLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Exam Access Link</h3>
              <button
                onClick={() => {
                  setShowExamLinkModal(false);
                  setCurrentExamLink(null);
                  setLinkCopied(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">Share this link with students to provide access to {currentExamLink.title}</p>
            
            <div className="mb-4 bg-gray-100 p-3 rounded-lg flex items-center">
              <div className="flex-1 overflow-hidden">
                <p className="whitespace-nowrap overflow-hidden text-ellipsis">{currentExamLink.access_link}</p>
              </div>
              <button
                onClick={handleCopyLink}
                className={`ml-2 p-2 rounded-md transition-colors ${
                  linkCopied ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title={linkCopied ? "Copied!" : "Copy Link"}
              >
                {linkCopied ? (
                  <span className="text-xs">Copied</span>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium">Link Visibility:</p>
              <button
                onClick={handleToggleLinkVisibility}
                className={`px-4 py-2 rounded-md ${
                  linkVisibility === 'public'
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                {linkVisibility === 'public' ? 'Public' : 'Private'}
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              {linkVisibility === 'public'
                ? "Public links allow anyone to access the exam without logging in."
                : "Private links require user authentication to access the exam."}
            </p>
            
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => {
                  setShowExamLinkModal(false);
                  setCurrentExamLink(null);
                  setLinkCopied(false);
                }}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
