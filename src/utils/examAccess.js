import { BACKEND_URL } from "./api";
import toastService from "./toast.jsx";

/**
 * Fetch exam details for a public link
 * @param {string|number} examId - ID of the exam to fetch
 * @returns {Promise<object>} - Promise resolving to exam details
 */
export async function fetchPublicExamDetails(examId) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/exam-links/public/${examId}/verify-access`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("Public exam access verified:", data);
      return data;
    } else {
      console.error("API error response:", data);
      throw new Error(data.message || "Failed to verify public exam access");
    }
  } catch (error) {
    console.error("Error verifying public exam access:", error);
    throw error;
  }
}

/**
 * Fetch exam details for an authenticated user
 * @param {string|number} examId - ID of the exam to fetch
 * @returns {Promise<object>} - Promise resolving to exam details
 */
export async function fetchAuthenticatedExamDetails(examId) {
  const studentToken = localStorage.getItem("studentToken");

  if (!studentToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/exam-links/${examId}/verify-access`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${studentToken}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log("Authenticated exam access verified:", data);
      return data;
    } else {
      console.error("API error response:", data);
      throw new Error(data.message || "Failed to verify exam access");
    }
  } catch (error) {
    console.error("Error verifying authenticated exam access:", error);
    throw error;
  }
}

/**
 * Fetch detailed exam information for display
 * @param {string|number} examId - ID of the exam to fetch
 * @returns {Promise<object>} - Promise resolving to detailed exam information
 */
export async function fetchExamDetails(examId) {
  const studentToken = localStorage.getItem("studentToken");

  if (!studentToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(`${BACKEND_URL}/exams/${examId}/details`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Exam details fetched successfully:", data);
      return data;
    } else {
      console.error("API error response:", data);
      throw new Error(data.message || "Failed to fetch exam details");
    }
  } catch (error) {
    console.error("Error fetching exam details:", error);
    throw error;
  }
}

/**
 * Start an exam for a student
 * @param {string|number} examId - ID of the exam to start
 * @returns {Promise<object>} - Promise resolving to started exam data
 */
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
        Authorization: `Bearer ${studentToken}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Exam started successfully:", data);
      return data;
    } else {
      console.error("API error response:", data);
      throw new Error(data.message || "Failed to start exam");
    }
  } catch (error) {
    console.error("Error starting exam:", error);
    throw error;
  }
}

/**
 * Attempt to access an exam via link
 * First tries public access, then authenticated access if a token is available
 * @param {string|number} examId - ID of the exam to access
 * @returns {Promise<{success: boolean, requiresAuth: boolean, data: object}>}
 */
export async function attemptExamAccess(examId) {
  try {
    // Try public access first
    const publicResult = await fetchPublicExamDetails(examId);

    if (publicResult.success) {
      return {
        success: true,
        requiresAuth: false,
        data: publicResult.data,
      };
    }
  } catch (error) {
    console.log("Public access failed, may require authentication");
  }

  // Try authenticated access if we have a token
  const studentToken = localStorage.getItem("studentToken");

  if (studentToken) {
    try {
      const authResult = await fetchAuthenticatedExamDetails(examId);

      if (authResult.success) {
        return {
          success: true,
          requiresAuth: true,
          data: authResult.data,
        };
      } else {
        return {
          success: false,
          requiresAuth: true,
          message: authResult.message || "You don't have access to this exam",
        };
      }
    } catch (error) {
      return {
        success: false,
        requiresAuth: true,
        message: error.message,
      };
    }
  }

  return {
    success: false,
    requiresAuth: true,
    message: "Authentication required to access this exam",
  };
}
