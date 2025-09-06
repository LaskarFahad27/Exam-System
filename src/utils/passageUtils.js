// Import the backend URL
import { BACKEND_URL } from './api';

// Helper function to normalize passage data
const normalizePassageData = (data, passageId = null) => {
  console.log("Normalizing passage data:", data);
  
  // Handle deeply nested data structures
  let passageInfo = data;
  
  // Check if data is nested inside data property
  if (data && data.data && typeof data.data === 'object') {
    passageInfo = data.data;
  }
  
  // Check if it's nested even further (data.data.passage)
  if (passageInfo && passageInfo.passage && typeof passageInfo.passage === 'object') {
    passageInfo = passageInfo.passage;
  }
  
  // Create a normalized object
  const normalized = {
    ...passageInfo,
    // Ensure we have the passage_text field, which could be in different places
    passage_text: passageInfo.passage_text || passageInfo.text || passageInfo.content || "",
    // Also ensure we have the id field
    id: passageInfo.id || passageInfo.uuid || passageId
  };
  
  console.log("Normalized passage data:", normalized);
  return normalized;
};

// This function will fetch passage data from a reading question set
export const fetchPassageForReadingSet = async (setId) => {
  try {
    console.log(`Fetching passage for reading set: ${setId}`);
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      throw new Error("Authentication required");
    }
    
    // First get all questions for this set
    console.log(`Fetching questions for set ID: ${setId}`);
    const questionsResponse = await fetch(`${BACKEND_URL}/question-sets/${setId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      }
    });
    
    const questionsData = await questionsResponse.json();
    console.log("Questions data response:", questionsData);
    
    if (!questionsResponse.ok || !questionsData.success) {
      throw new Error(questionsData.message || 'Failed to fetch questions');
    }
    
    // Filter out reading questions that have a passage_id
    const readingQuestions = (questionsData.data.questions || []).filter(
      q => q.question_type === 'reading_question' && q.passage_id
    );
    
    console.log(`Found ${readingQuestions.length} reading questions with passage_id`);
    
    if (readingQuestions.length === 0) {
      return { success: false, message: 'No passage found for this question set' };
    }
    
    // Get the first passage_id we find
    const passageId = readingQuestions[0].passage_id;
    console.log(`Using passage ID: ${passageId}`);
    
    // Now fetch the passage
    console.log(`Fetching passage details for ID: ${passageId}`);
    const passageResponse = await fetch(`${BACKEND_URL}/reading/passages/${passageId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      }
    });
    
    const passageData = await passageResponse.json();
    console.log("Raw passage data from API:", passageData);
    
    if (!passageResponse.ok) {
      throw new Error(passageData.message || 'Failed to fetch passage');
    }
    
    // Normalize the passage data
    const normalizedPassage = normalizePassageData(passageData, passageId);
    
    return {
      success: true,
      data: normalizedPassage,
      questions: readingQuestions
    };
  } catch (error) {
    console.error("Error fetching passage for reading set:", error);
    return { success: false, error: error.message };
  }
};
