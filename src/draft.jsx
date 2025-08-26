import React, { useState } from 'react';
import { Users, BookOpen, Plus, Edit3, Trash2, Eye, EyeOff, GraduationCap, FileText, Calculator, Book, PenTool, X } from 'lucide-react';
import toastService from './utils/toast.jsx';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([
    { id: 'STU001', name: 'John Doe', email: 'john@example.com', enrolledDate: '2024-01-15' },
    { id: 'STU002', name: 'Jane Smith', email: 'jane@example.com', enrolledDate: '2024-01-20' }
  ]);
  const [exams, setExams] = useState([
    { 
      id: 'EXM001', 
      title: 'Weekly Test - 01', 
      duration: 120, 
      totalQuestions: 40,
      createdDate: '2024-08-15',
      status: 'Active'
    }
  ]);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: '', id: '', email: '' });
  const [examForm, setExamForm] = useState({
    title: '',
    duration: '',
    english: { questions: [], timeLimit: '' },
    math: { questions: [], timeLimit: '' },
    reading: { questions: [], timeLimit: '' },
    essay: { topics: [], timeLimit: '' }
  });
  const [activeSection, setActiveSection] = useState('english');
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });
  const [essayTopicForm, setEssayTopicForm] = useState('');

  const handleLogin = () => {
    if (credentials.username === 'campuspro' && credentials.password === '1234') {
      setIsAuthenticated(true);
    } else {
      toastService.error('Invalid credentials! Please try again.');
    }
  };

  const handleAddStudent = () => {
    if (studentForm.name && studentForm.id && studentForm.email) {
      setStudents([...students, { ...studentForm, enrolledDate: new Date().toISOString().split('T')[0] }]);
      setStudentForm({ name: '', id: '', email: '' });
      setShowStudentForm(false);
    }
  };

  const handleAddExam = () => {
    if (examForm.title && examForm.duration) {
      const totalQuestions = examForm.english.questions.length + 
                           examForm.math.questions.length + 
                           examForm.reading.questions.length + 
                           examForm.essay.topics.length;
      
      setExams([...exams, {
        id: `EXM${String(exams.length + 1).padStart(3, '0')}`,
        title: examForm.title,
        duration: parseInt(examForm.duration),
        totalQuestions,
        createdDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        sections: {
          english: examForm.english,
          math: examForm.math,
          reading: examForm.reading,
          essay: examForm.essay
        }
      }]);
      setExamForm({
        title: '',
        duration: '',
        english: { questions: [], timeLimit: '' },
        math: { questions: [], timeLimit: '' },
        reading: { questions: [], timeLimit: '' },
        essay: { topics: [], timeLimit: '' }
      });
      setShowExamForm(false);
    }
  };

  const addQuestion = () => {
    if (questionForm.question.trim() && questionForm.options.every(opt => opt.trim())) {
      setExamForm({
        ...examForm,
        [activeSection]: {
          ...examForm[activeSection],
          questions: [...examForm[activeSection].questions, { ...questionForm, id: Date.now() }]
        }
      });
      setQuestionForm({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      });
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

  const removeQuestion = (sectionName, questionId) => {
    setExamForm({
      ...examForm,
      [sectionName]: {
        ...examForm[sectionName],
        questions: examForm[sectionName].questions.filter(q => q.id !== questionId)
      }
    });
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

  const deleteExam = (id) => {
    setExams(exams.filter(exam => exam.id !== id));
  };

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
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
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
            
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
            >
              Login to Admin Panel
            </button>
          </div>
          
          <div className="mt-6 text-center text-gray-500 text-sm">
            Demo: campuspro / 1234
          </div>
        </div>
      </div>
    );
  }

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
                onClick={() => setShowExamForm(true)}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Create Exam</span>
              </button>
            </div>

            {/* Exams Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {exams.map((exam) => (
                <div key={exam.id} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                    <button
                      onClick={() => deleteExam(exam.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{exam.title}</h3>
                  <div className="space-y-1 text-gray-600 text-sm">
                    <p>Exam ID: {exam.id}</p>
                    <p>Duration: {exam.duration} minutes</p>
                    <p>Total Questions: {exam.totalQuestions}</p>
                    <p>Created: {exam.createdDate}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      exam.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {exam.status}
                    </span>
                  </div>
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
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-6xl max-h-[90vh] mt-10 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Create New Exam</h3>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Exam Title</label>
                  <input
                    type="text"
                    value={examForm.title}
                    onChange={(e) => setExamForm({...examForm, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter exam title"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={examForm.duration}
                    onChange={(e) => setExamForm({...examForm, duration: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="120"
                  />
                </div>
              </div>

              {/* Section Tabs */}
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
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Add Question/Topic Form */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    {activeSection === 'english' && <Book className="w-5 h-5 text-blue-600" />}
                    {activeSection === 'math' && <Calculator className="w-5 h-5 text-green-600" />}
                    {activeSection === 'reading' && <FileText className="w-5 h-5 text-purple-600" />}
                    {activeSection === 'essay' && <PenTool className="w-5 h-5 text-orange-600" />}
                    <h4 className="text-lg font-semibold text-gray-800">
                      {activeSection === 'english' && 'Add English Question'}
                      {activeSection === 'math' && 'Add Mathematics Question'}
                      {activeSection === 'reading' && 'Add Reading Comprehension Question'}
                      {activeSection === 'essay' && 'Add Essay Writing Topic'}
                    </h4>
                  </div>
                  
                  {activeSection !== 'essay' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Question</label>
                        <textarea
                          value={questionForm.question}
                          onChange={(e) => setQuestionForm({...questionForm, question: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your question"
                          rows="3"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-gray-700 text-sm font-medium">Options</label>
                        {questionForm.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={questionForm.correctAnswer === index}
                              onChange={() => setQuestionForm({...questionForm, correctAnswer: index})}
                              className="text-blue-600"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...questionForm.options];
                                newOptions[index] = e.target.value;
                                setQuestionForm({...questionForm, options: newOptions});
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={`Option ${index + 1}`}
                            />
                          </div>
                        ))}
                        <p className="text-xs text-gray-500">Select the radio button for the correct answer</p>
                      </div>
                      
                      <button
                        onClick={addQuestion}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          activeSection === 'english' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                          activeSection === 'math' ? 'bg-green-600 hover:bg-green-700 text-white' :
                          'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        Add {activeSection === 'english' ? 'English' : activeSection === 'math' ? 'Math' : 'Reading'} Question
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Essay Writing Topic</label>
                        <textarea
                          value={essayTopicForm}
                          onChange={(e) => setEssayTopicForm(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Enter essay writing topic or prompt"
                          rows="4"
                        />
                      </div>
                      
                      <button
                        onClick={addEssayTopic}
                        className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                      >
                        Add Essay Topic
                      </button>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Time Limit (minutes)</label>
                    <input
                      type="number"
                      value={activeSection === 'essay' ? examForm.essay.timeLimit : examForm[activeSection].timeLimit}
                      onChange={(e) => setExamForm({
                        ...examForm,
                        [activeSection]: {
                          ...examForm[activeSection],
                          timeLimit: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="30"
                    />
                  </div>
                </div>

                {/* Questions/Topics List */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {activeSection === 'english' && <Book className="w-5 h-5 text-blue-600" />}
                    {activeSection === 'math' && <Calculator className="w-5 h-5 text-green-600" />}
                    {activeSection === 'reading' && <FileText className="w-5 h-5 text-purple-600" />}
                    {activeSection === 'essay' && <PenTool className="w-5 h-5 text-orange-600" />}
                    <h4 className="text-lg font-semibold text-gray-800">
                      {activeSection === 'english' && 'English Questions'}
                      {activeSection === 'math' && 'Mathematics Questions'}
                      {activeSection === 'reading' && 'Reading Comprehension Questions'}
                      {activeSection === 'essay' && 'Essay Writing Topics'}
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        ({activeSection === 'essay' ? examForm.essay.topics.length : examForm[activeSection].questions.length})
                      </span>
                    </h4>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {activeSection === 'essay' 
                      ? examForm.essay.topics.map((topic, index) => (
                          <div key={topic.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-800">Topic {index + 1}</p>
                                <p className="text-gray-600 mt-1">{topic.topic}</p>
                              </div>
                              <button
                                onClick={() => removeEssayTopic(topic.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      : examForm[activeSection].questions.map((question, index) => (
                          <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">Question {index + 1}</p>
                                <p className="text-gray-600 mt-1">{question.question}</p>
                                <div className="mt-2 space-y-1">
                                  {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className={`text-sm ${optIndex === question.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                                      {String.fromCharCode(65 + optIndex)}. {option} {optIndex === question.correctAnswer && '✓'}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <button
                                onClick={() => removeQuestion(activeSection, question.id)}
                                className="text-red-500 hover:text-red-700 ml-2"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                    }
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-6 border-t">
                <button
                  onClick={handleAddExam}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Create Exam
                </button>
                <button
                  onClick={() => setShowExamForm(false)}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
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
