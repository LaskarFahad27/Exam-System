// auth.js - Centralized authentication functions
import { BACKEND_URL } from './api';

// Logout function - performs a server logout and cleans up local storage
export const logout = async () => {
  const token = localStorage.getItem('studentToken') || localStorage.getItem('adminToken');
  
  try {
    // Call the server logout endpoint if we have a token
    if (token) {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
    }
  } catch (error) {
    console.error("Error during server logout:", error);
    // Continue with local logout even if server logout fails
  } finally {
    // Clear all authentication tokens
    localStorage.removeItem('studentToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userInfo');
    
    // Additional cleanup
    // Remove any exam-related localStorage entries
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('exam_') || key.startsWith('auto_submit_'))) {
        keysToRemove.push(key);
      }
    }
    
    // Remove the collected keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('User logged out successfully');
  }
  
  return true;
};

// Get user sessions
export const getUserSessions = async () => {
  const token = localStorage.getItem('studentToken') || localStorage.getItem('adminToken');
  
  if (!token) {
    throw new Error("Authentication required");
  }
  
  try {
    const response = await fetch(`${BACKEND_URL}/auth/sessions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Sessions fetched successfully:", data);
      return data.data.sessions || [];
    } else {
      throw new Error(data.message || "Failed to fetch sessions");
    }
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }
};

// Logout a specific session
export const logoutSpecificSession = async (sessionId) => {
  const token = localStorage.getItem('studentToken') || localStorage.getItem('adminToken');
  
  if (!token) {
    throw new Error("Authentication required");
  }
  
  try {
    const response = await fetch(`${BACKEND_URL}/auth/sessions/${sessionId}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Session logged out successfully:", data);
      return data;
    } else {
      throw new Error(data.message || "Failed to logout session");
    }
  } catch (error) {
    console.error("Error logging out session:", error);
    throw error;
  }
};

// Logout all other devices
export const logoutOtherDevices = async () => {
  const token = localStorage.getItem('studentToken') || localStorage.getItem('adminToken');
  
  if (!token) {
    throw new Error("Authentication required");
  }
  
  try {
    const response = await fetch(`${BACKEND_URL}/auth/logout-other-devices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("Other devices logged out successfully:", data);
      return data;
    } else {
      throw new Error(data.message || "Failed to logout other devices");
    }
  } catch (error) {
    console.error("Error logging out other devices:", error);
    throw error;
  }
};

// Get session count
export const getSessionCount = async () => {
  const token = localStorage.getItem('studentToken') || localStorage.getItem('adminToken');
  
  if (!token) {
    throw new Error("Authentication required");
  }
  
  try {
    const response = await fetch(`${BACKEND_URL}/auth/sessions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log("Session count fetched successfully:", data);
      return data.data.total || 1;
    } else {
      throw new Error(data.message || "Failed to fetch session count");
    }
  } catch (error) {
    console.error("Error fetching session count:", error);
    return 1; // Default to 1 on error
  }
};

// Change user status (admin only)
export const updateUserStatus = async (userId, status) => {
  const adminToken = localStorage.getItem('adminToken');
  
  if (!adminToken) {
    throw new Error("Admin authentication required");
  }
  
  try {
    const response = await fetch(`${BACKEND_URL}/auth/users/${userId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("User status updated successfully:", data);
      return data;
    } else {
      throw new Error(data.message || "Failed to update user status");
    }
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};
