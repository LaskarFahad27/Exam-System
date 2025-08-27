export const BACKEND_URL = "http://172.232.104.77:5000/api";


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

export async function createQuestions(sectionId, question, type, options, answer) {
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) throw new Error("Authentication required");

  try {
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
        correct_answer: answer
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

/**
 * Get all active sessions for the current user
 * @returns {Promise<Object>} Object containing the sessions array
 */
export async function getUserSessions() {
  const studentToken = localStorage.getItem("studentToken");

  if (!studentToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/auth/sessions`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentToken}`
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("User sessions fetched successfully:", data);
      
      // Add client-side fetch timestamp to help with time calculations
      const clientFetchTime = new Date().toISOString();
      
      // Process the data to normalize timestamps
      if (data.data && data.data.sessions) {
        data.data.sessions = data.data.sessions.map(session => ({
          ...session,
          client_fetch_time: clientFetchTime
        }));
      }
      
      // Return the entire response which contains sessions array inside data
      return data;
    }
    else {
      throw new Error(data.message || "Failed to fetch user sessions");
    }
  } catch (error) {
    console.error("Error fetching user sessions:", error);
    throw error;
  }
}

/**
 * Get the count of active sessions for the current user
 * @returns {Promise<Object>} Object containing the session count
 */
export async function getSessionCount() {
  const studentToken = localStorage.getItem("studentToken");

  if (!studentToken) {
    throw new Error("Authentication required");
  }

  try {
    // Since there's no dedicated count endpoint, we'll use the sessions endpoint
    // and get the count from the response
    const response = await fetch(`${BACKEND_URL}/auth/sessions`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentToken}`
      },
    });

    const data = await response.json();

    if (response.ok) {
      // Return an object with the count extracted from the response
      return { 
        count: data.data.total || data.data.sessions.length || 0
      };
    }
    else {
      throw new Error(data.message || "Failed to fetch session count");
    }
  } catch (error) {
    console.error("Error fetching session count:", error);
    throw error;
  }
}

/**
 * Log out from all devices except the current one
 * @returns {Promise<Object>} Result of the operation
 */
export async function logoutOtherDevices() {
  const studentToken = localStorage.getItem("studentToken");

  if (!studentToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/auth/logout-other-devices`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentToken}`
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Logged out from other devices successfully:", data);
      return data;
    }
    else {
      throw new Error(data.message || "Failed to logout from other devices");
    }
  } catch (error) {
    console.error("Error logging out from other devices:", error);
    throw error;
  }
}

/**
 * Log out from a specific device/session
 * @param {string} sessionId - ID of the session to log out from
 * @returns {Promise<Object>} Result of the operation
 */
export async function logoutSpecificSession(sessionId) {
  const studentToken = localStorage.getItem("studentToken");

  if (!studentToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/auth/sessions/${sessionId}/logout`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentToken}`
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Logged out from specific session successfully:", data);
      return data;
    }
    else {
      throw new Error(data.message || "Failed to logout from specific session");
    }
  } catch (error) {
    console.error("Error logging out from specific session:", error);
    throw error;
  }
}

/**
 * Log out the user from the current device/session
 * @returns {Promise<Object>} Result of the operation
 */
export async function logout() {
  const studentToken = localStorage.getItem("studentToken");

  if (!studentToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentToken}`
      },
    });

    const data = await response.json();

    if (response.ok) {
      // Clear the token from local storage
      localStorage.removeItem("studentToken");
      console.log("Logged out successfully:", data);
      return data;
    }
    else {
      throw new Error(data.message || "Failed to logout");
    }
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
}