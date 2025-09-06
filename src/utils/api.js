export const BACKEND_URL = "http://172.232.104.77:6536/api";

//............Reading Passages.....................

export async function fetchReadingPassage(passageId) {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }
//d
  try {
    const response = await fetch(`${BACKEND_URL}/reading/passages/${passageId}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Reading passage fetched successfully:", data);
      return { success: true, data: data.data || data };
    }
    else {
      console.error("API error response:", data);
      throw new Error(data.message || "Failed to fetch reading passage");
    }
  } catch (error) {
    console.error("Error fetching reading passage:", error);
    throw error;
  }
}

export async function fetchQuestionsForPassage(setId) {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/question-sets/${setId}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Reading passage questions fetched successfully:", data);
      return { success: true, data: data.data || data };
    }
    else {
      console.error("API error response:", data);
      throw new Error(data.message || "Failed to fetch reading passage questions");
    }
  } catch (error) {
    console.error("Error fetching reading passage questions:", error);
    throw error;
  }
}

export async function createReadingPassage(passageText, wordCount) {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/reading/passages`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: wordCount,
        passage_text: passageText
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Reading passage created successfully:", data);
      return { success: true, data: data.data || data };
    }
    else {
      console.error("API error response:", data);
      throw new Error(data.message || "Failed to create reading passage");
    }
  } catch (error) {
    console.error("Error creating reading passage:", error);
    throw error;
  }
}

export async function addQuestionToReadingPassage(setId,passageId, questionText, options, correctAnswerText) {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/question-sets/${setId}/questions`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        question_text: questionText,
        question_type: "reading_question",
        options: options,
        correct_answer: correctAnswerText,
        passage_id: passageId
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Question added to reading passage successfully:", data);
      return { success: true, data: data.data || data };
    }
    else {
      console.error("API error response:", data);
      throw new Error(data.message || "Failed to add question to reading passage");
    }
  } catch (error) {
    console.error("Error adding question to reading passage:", error);
    throw error;
  }
}

export async function removeQuestionFromPassage(questionId) {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/reading/questions/${questionId}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Question removed from reading passage successfully:", data);
      return { success: true, data: data.data || data };
    }
    else {
      console.error("API error response:", data);
      throw new Error(data.message || "Failed to remove question from reading passage");
    }
  } catch (error) {
    console.error("Error removing question from reading passage:", error);
    throw error;
  }
}

//............Search Question Sets.....................

export async function searchQuestionSets(searchTerm = '', subject = '') {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (subject) params.append('subject', subject);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await fetch(`${BACKEND_URL}/question-sets${queryString}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Question sets searched successfully:", data);
      return { success: true, data: data.data || data };
    }
    else {
      console.error("API error response:", data);
      throw new Error(data.message || "Failed to search question sets");
    }
  } catch (error) {
    console.error("Error searching question sets:", error);
    throw error;
  }
}

// .................Fetch all exams..................................

export async function getExams() {
  
    const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/exams`, {
      method: "GET",
      headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${adminToken}`
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Exams fetched successfully:", data);
      return data;
    }
    else {
      throw new Error(data.message || "Failed to fetch exams");
    }
  } catch (error) {
    console.error("Error fetching exams:", error);
    throw error;
  }
}

//..............Fetch exams for user..................

export async function getExamsForUser() {

    const studentToken = localStorage.getItem("studentToken");

  if (!studentToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/exams`, {
      method: "GET",
      headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${studentToken}`
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Exams fetched successfully for student:", data);
      return data;
    }
    else {
      throw new Error(data.message || "Failed to fetch exams for student");
    }
  } catch (error) {
    console.error("Error fetching exams for student:", error);
    throw error;
  }
}

//..............Create a new exam..........................

export async function createExam(title, description) {
  
    const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {

    const response = await fetch(`${BACKEND_URL}/exams/shell`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title,
        description
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Exams created successfully:", data);
      return data;
    }
    else {
      throw new Error(data.message || "Failed to create exams");
    }
  } catch (error) {
    console.error("Error creating exams:", error);
    throw error;
  }
}

//..............Create a new section..........................

export async function createSection(name, examId, time, order) {
  
    const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {

    const response = await fetch(`${BACKEND_URL}/exams/${examId}/sections`,
       {
      method: "POST",
      headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name,
        duration_minutes: time,
        sequence_order: order
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Section created successfully:", data);
      return data;
    }
    else {
      throw new Error(data.message || "Failed to create section");
    }
  } catch (error) {
    console.error("Error creating section:", error);
    throw error;
  }
}

//..............Create questions..........................

export async function createQuestions(sectionId, question, type, options, answer) {
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) throw new Error("Authentication required");

  try {
    console.log("Creating question with answer index:", answer);
    
    // Get the correct answer text from the options array
    const correctAnswer = typeof answer === 'number' && options[answer] ? options[answer] : answer;
    console.log("Correct answer being sent to API:", correctAnswer);
    
    const response = await fetch(`${BACKEND_URL}/exams/sections/${sectionId}/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        question_text: question,
        question_type: type,
        options: options.map(opt => ({ text: opt })), 
        correct_answer: answer  // Keep as index for consistency
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Question created successfully:", data);
      return data;
    } else {
      throw new Error(data.message || "Failed to create question");
    }
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
}

//..............Update exam basic details..........................

export async function updateExamBasicDetails(examId, title, description) {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/exams/${examId}/details`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({ title, description })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Exam details updated successfully:", data);
      return { success: true, data };
    }
    else {
      throw new Error(data.message || "Failed to update exam details");
    }
  } catch (error) {
    console.error("Error updating exam details:", error);
    throw error;
  }
}

//..............Toggle exam publish status..........................

export async function toggleExamPublishStatus(examId, publishStatus) {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/exams/${examId}/published`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({ published: publishStatus ? 1 : 0 })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Exam publish status updated successfully:", data);
      return { success: true, data };
    }
    else {
      throw new Error(data.message || "Failed to update exam publish status");
    }
  } catch (error) {
    console.error("Error updating exam publish status:", error);
    throw error;
  }
}

//..............Delete an exam..........................

export async function dropExam(examId) {
  
    const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {

    const response = await fetch(`${BACKEND_URL}/exams/${examId}`,
       {
      method: "DELETE",
      headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${adminToken}`
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Exam deleted successfully:", data);
      return data;
    }
    else {
      // Enhanced error handling for foreign key constraints
      if (data.message && data.message.includes('foreign key constraint')) {
        throw new Error("Cannot delete exam: Students have already taken this exam. Please contact system administrator to handle exam deletion with existing student records.");
      }
      throw new Error(data.message || "Failed to delete exam");
    }
  } catch (error) {
    console.error("Error deleting exam:", error);
    
    // Handle different types of errors
    if (error.message.includes('foreign key constraint')) {
      throw new Error("Cannot delete exam: This exam has student attempts. Please contact system administrator.");
    }
    
    throw error;
  }
}

//..............Force delete an exam (admin only)..........................

export async function forceDropExam(examId) {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {
    // Try to force delete (backend should handle cascading)
    const response = await fetch(`${BACKEND_URL}/exams/${examId}/force-delete`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Exam force deleted successfully:", data);
      return data;
    }
    else {
      throw new Error(data.message || "Failed to force delete exam");
    }
  } catch (error) {
    console.error("Error force deleting exam:", error);
    throw error;
  }
}

//..............Delete question..........................

export async function deleteQuestion(questionId) {
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/exams/questions/${questionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      }
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Question deleted successfully:", data);
      return data;
    } else {
      throw new Error(data.message || "Failed to delete question");
    }
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
}

//..............Delete section..........................

export async function deleteSection(sectionId) {
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/exams/sections/${sectionId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      }
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Section deleted successfully:", data);
      return data;
    } else {
      throw new Error(data.message || "Failed to delete section");
    }
  } catch (error) {
    console.error("Error deleting section:", error);
    throw error;
  }
}

//..............Fetch exams by ID..........................

export async function fetchExamsById(examId) {

    const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/exams/${examId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${adminToken}`
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Exam fetched successfully:", data);
      return data;
    }
    else {
      throw new Error(data.message || "Failed to fetch exam");
    }
  } catch (error) {
    console.error("Error fetching exam:", error);
    throw error;
  }
}

//..............Start an exam..........................

export async function startExam(examId) {
  const studentToken = localStorage.getItem("studentToken");

  if (!studentToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/user-exams/${examId}/start`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentToken}`
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Exam started successfully:", data);
      return data;
    }
    else {
      throw new Error(data.message || "Failed to start exam");
    }
  } catch (error) {
    console.error("Error starting exam:", error);
    throw error;
  }
}

//..............Get next section..........................

export async function getNextSection(userExamId) {
  const studentToken = localStorage.getItem("studentToken");

  if (!studentToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/user-exams/${userExamId}/next-section`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentToken}`
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Next section fetched successfully:", data);
      return data;
    }
    else {
      throw new Error(data.message || "Failed to fetch next section");
    }
  } catch (error) {
    console.error("Error fetching next section:", error);
    throw error;
  }
}

//..............Submit section answers..........................

export async function submitSectionAnswers(userExamId, sectionId, answers) {
  const studentToken = localStorage.getItem("studentToken");

  if (!studentToken) {
    throw new Error("Authentication required");
  }

  const payload = { answers };
  console.log('API Request:', {
    url: `${BACKEND_URL}/user-exams/${userExamId}/section/${sectionId}/submit`,
    method: 'POST',
    payload: payload
  });

  try {
    const response = await fetch(`${BACKEND_URL}/user-exams/${userExamId}/section/${sectionId}/submit`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentToken}`
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Section answers submitted successfully:", data);
      return data;
    }
    else {
      throw new Error(data.message || "Failed to submit answers");
    }
  } catch (error) {
    console.error("Error submitting answers:", error);
    throw error;
  }
}

//..............Get exam results..........................

export async function getExamResults(examId) {
  const studentToken = localStorage.getItem("studentToken");

  if (!studentToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/scores/user-exams/${examId}/details`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentToken}`
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Exam results fetched successfully:", data);
      return data;
    }
    else {
      throw new Error(data.message || "Failed to fetch exam results");
    }
  } catch (error) {
    console.error("Error fetching exam results:", error);
    throw error;
  }
}

//..............Create Question Set..............

export async function createQuestionSet(subject, setName) {
  
    const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {

    const response = await fetch(`${BACKEND_URL}/question-sets`,
       {
      method: "POST",
      headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        subject_name: subject,
        set_name: setName
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Set created successfully:", data);
      return data;
    }
    else {
      throw new Error(data.message || "Failed to create set");
    }
  } catch (error) {
    console.error("Error creating set:", error);
    throw error;
  }
}

//............Fetch Question Sets.....................

export async function fetchQuestionSet(subject, setName) {
  
    const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {

    const response = await fetch(`${BACKEND_URL}/question-sets`,
       {
      method: "GET",
      headers: { "Content-Type": "application/json",
                  "Authorization": `Bearer ${adminToken}`
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Set fetched successfully:", data);
      return data;
    }
    else {
      throw new Error(data.message || "Failed to fetch sets");
    }
  } catch (error) {
    console.error("Error fetching sets:", error);
    throw error;
  }
}

//............Add Question to Question Set.....................

import { getStorageItem, debugImageStorage } from './localStorageHelper';

/**
 * Get the URL for a question image by its ID
 * @param {number} imageId - The ID of the image to fetch
 * @returns {string} - The URL to the image
 */
export function getQuestionImageUrl(imageId) {
  if (!imageId) return '';
  
  // Get the authentication token (admin or student)
  const token = localStorage.getItem("adminToken") || localStorage.getItem("studentToken");
  
  // Return the URL with authentication token as a query parameter if available
  return token 
    ? `${BACKEND_URL}/question-images/${imageId}?token=${encodeURIComponent(token)}`
    : `${BACKEND_URL}/question-images/${imageId}`;
}

/**
 * Fetch a question image by its ID
 * @param {number} imageId - The ID of the image to fetch
 * @param {boolean} useAdminToken - Whether to force using admin token
 * @returns {Promise<Blob>} - A promise resolving to the image blob
 */
export async function fetchQuestionImage(imageId, useAdminToken = false) {
  if (!imageId) {
    throw new Error("Image ID is required");
  }

  // Try to get a token - use specific token if requested, otherwise try both
  let token;
  if (useAdminToken) {
    token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Admin authentication required");
  } else {
    token = localStorage.getItem("adminToken") || localStorage.getItem("studentToken");
    if (!token) throw new Error("Authentication required");
  }

  try {
    console.log(`Fetching image ${imageId} with ${useAdminToken ? 'admin' : 'available'} token`);
    
    const response = await fetch(`${BACKEND_URL}/question-images/${imageId}`, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`
      },
      // Include credentials to ensure cookies are sent with the request if needed
      credentials: 'include'
    });
    
    if (!response.ok) {
      // If unauthorized with student token, try with admin token as fallback
      if (response.status === 401 && !useAdminToken && localStorage.getItem("adminToken")) {
        console.log("Unauthorized with student token, trying admin token");
        return fetchQuestionImage(imageId, true);
      }
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error("Error fetching question image:", error);
    throw error;
  }
}

export async function addQuestionToSet(questionSetId, questionText, questionType, options, correctAnswer, imageId = null) {
  
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  console.log("API - addQuestionToSet called with imageId:", imageId);
  const storedImageId = getStorageItem('lastUploadedImageId');
  console.log("API - localStorage value check:", storedImageId);
  
  // If no imageId was provided but one exists in localStorage, use that as a fallback
  if (!imageId && storedImageId) {
    imageId = parseInt(storedImageId, 10);
    console.log("API - Using fallback image ID from localStorage:", imageId);
  }
  
  // Debug all storage
  debugImageStorage();
  
  // Make sure we have a valid question set ID
  if (!questionSetId) {
    throw new Error("Question set ID is required");
  }

  // Ensure questionSetId is treated as a primitive value, not an object
  const setId = typeof questionSetId === 'object' ? questionSetId.id : questionSetId;

  // Format options if needed - ensure we have an array of strings
  let formattedOptions = [];
  if (Array.isArray(options)) {
    formattedOptions = options.map(opt => {
      if (typeof opt === 'object' && opt !== null) {
        // If the option is an object, try to get a string representation
        return opt.text || opt.toString() || '';
      } else {
        // If it's already a string or primitive, use it directly
        return String(opt);
      }
    });
  } else if (options) {
    // If options is not an array but exists, make it an array
    formattedOptions = [String(options)];
  }

  // Format correct answer - ensure it's a string
  let formattedAnswer = '';
  if (correctAnswer !== null && correctAnswer !== undefined) {
    if (typeof correctAnswer === 'object') {
      formattedAnswer = correctAnswer.text || correctAnswer.toString() || '';
    } else {
      formattedAnswer = String(correctAnswer);
    }
  }

  try {
    console.log(`Sending request to ${BACKEND_URL}/question-sets/${setId}/questions`);
    console.log("Request payload:", {
      question_text: questionText,
      question_type: questionType,
      options: formattedOptions,
      correct_answer: formattedAnswer,
      ...(imageId ? { image_id: imageId } : {})
    });
    
    // Ensure the URL is correctly formatted
    const url = `${BACKEND_URL}/question-sets/${setId}/questions`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        question_text: questionText || '',
        question_type: questionType || 'mcq',
        options: formattedOptions,
        correct_answer: formattedAnswer,
        ...(imageId ? { image_id: parseInt(imageId, 10) } : {}) // Include image_id if provided (ensure it's a number)
      }),
    });
    
    // Safely parse JSON response
    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error(`Failed to parse server response: ${parseError.message}`);
    }
    
    if (response.ok) {
      console.log("Question added successfully:", data);
      return { ...data, success: true };
    }
    else {
      console.error("API error response:", data);
      // Throw a more detailed error message
      const errorMessage = data.message || 
                          (data.error ? (typeof data.error === 'string' ? data.error : JSON.stringify(data.error)) : 
                          "Failed to add question to set");
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Error adding question:", error);
    throw error;
  }
}

//............Remove Question from Question Set.....................

export async function removeQuestionFromSet(questionId) {
  
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {
    // Ensure the ID is not an object
    const qId = typeof questionId === 'object' && questionId !== null ? questionId.id : questionId;
    
    console.log("API Removing question ID:", qId);
    
    const response = await fetch(`${BACKEND_URL}/question-sets/questions/${qId}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Question removed successfully:", data);
      return data;
    }
    else {
      console.error("API error response:", data);
      throw new Error(data.message || "Failed to remove question from set");
    }
  } catch (error) {
    console.error("Error removing question:", error);
    throw error;
  }
}

//............Fetch Questions for a Question Set.....................

export async function fetchQuestionsForSet(questionSetId) {
  
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {
    // Ensure the ID is not an object
    const setId = typeof questionSetId === 'object' && questionSetId !== null ? questionSetId.id : questionSetId;
    
    console.log("API Fetching questions for set ID:", setId);
    
    const response = await fetch(`${BACKEND_URL}/question-sets/${setId}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Questions fetched successfully:", data);
      return data;
    }
    else {
      console.error("API error response:", data);
      throw new Error(data.message || "Failed to fetch questions for set");
    }
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
}

//............Edit Question Set.....................

export async function editQuestionSet(questionSetId, subjectName, setName) {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {
    // Ensure the ID is not an object
    const setId = typeof questionSetId === 'object' && questionSetId !== null ? questionSetId.id : questionSetId;
    
    console.log("API Editing question set with ID:", setId);
    
    const response = await fetch(`${BACKEND_URL}/question-sets/${setId}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        subject_name: subjectName,
        set_name: setName
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Question set edited successfully:", data);
      return { success: true, data };
    }
    else {
      console.error("API error response:", data);
      throw new Error(data.message || "Failed to edit question set");
    }
  } catch (error) {
    console.error("Error editing question set:", error);
    throw error;
  }
}

//............Delete Question Set.....................

export async function deleteQuestionSet(questionSetId, forceDelete = false) {
  const adminToken = localStorage.getItem("adminToken");

  if (!adminToken) {
    throw new Error("Authentication required");
  }

  try {
    // Ensure the ID is not an object
    const setId = typeof questionSetId === 'object' && questionSetId !== null ? questionSetId.id : questionSetId;
    
    console.log("API Deleting question set with ID:", setId, forceDelete ? "(Force Delete)" : "");
    
    // Add force delete parameter if needed
    const url = forceDelete 
      ? `${BACKEND_URL}/question-sets/${setId}?force=true` 
      : `${BACKEND_URL}/question-sets/${setId}`;
    
    const response = await fetch(url, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      }
    });
    
    // If it's a 204 No Content response
    if (response.status === 204) {
      console.log("Question set deleted successfully");
      return { success: true };
    }
    
    // Handle other successful responses
    if (response.ok) {
      const data = await response.json();
      console.log("Question set deleted successfully:", data);
      return { success: true, data };
    }
    else {
      const data = await response.json().catch(() => ({}));
      console.error("API error response:", data);
      throw new Error(data.message || "Failed to delete question set");
    }
  } catch (error) {
    console.error("Error deleting question set:", error);
    throw error;
  }
}
