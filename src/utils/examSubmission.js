/**
 * Utility functions for handling exam submissions and preventing duplicates
 */

/**
 * Check if a section has already been submitted to prevent duplicates
 * @param {string} examId - The exam ID
 * @param {string} sectionId - The section ID
 * @returns {boolean} - Whether the section has already been submitted
 */
export const isSectionSubmitted = (examId, sectionId) => {
  if (!examId || !sectionId) return false;
  
  const key = `exam_${examId}_section_${sectionId}_submitted`;
  const submissionStatus = localStorage.getItem(key);
  
  // Also check the timestamp to see if this is a stale flag (older than 5 minutes)
  const timestampKey = `exam_${examId}_section_${sectionId}_submitted_time`;
  const timestamp = localStorage.getItem(timestampKey);
  
  if (submissionStatus === 'true' && timestamp) {
    const submissionTime = parseInt(timestamp, 10);
    const now = Date.now();
    const fiveMinutesMs = 5 * 60 * 1000;
    
    // If the submission flag is more than 5 minutes old, it might be stale
    // from a previous session, so ignore it
    if (now - submissionTime > fiveMinutesMs) {
      console.log('Found stale submission flag, clearing it');
      localStorage.removeItem(key);
      localStorage.removeItem(timestampKey);
      return false;
    }
  }
  
  return submissionStatus === 'true';
};

/**
 * Mark a section as submitted
 * @param {string} examId - The exam ID
 * @param {string} sectionId - The section ID
 * @returns {boolean} - Whether the marking was successful (false if already marked)
 */
export const markSectionSubmitted = (examId, sectionId) => {
  if (!examId || !sectionId) return false;
  
  const key = `exam_${examId}_section_${sectionId}_submitted`;
  const timestampKey = `exam_${examId}_section_${sectionId}_submitted_time`;
  
  // Check if already marked as submitted to prevent race conditions
  if (localStorage.getItem(key) === 'true') {
    console.log('Section already marked as submitted:', sectionId);
    return false;
  }
  
  // Set both the flag and timestamp
  localStorage.setItem(key, 'true');
  localStorage.setItem(timestampKey, Date.now().toString());
  console.log('Section marked as submitted:', sectionId);
  return true;
};

/**
 * Clear a specific section's submission flag
 * @param {string} examId - The exam ID
 * @param {string} sectionId - The section ID 
 */
export const clearSectionSubmitted = (examId, sectionId) => {
  if (!examId || !sectionId) return;
  
  const key = `exam_${examId}_section_${sectionId}_submitted`;
  const timestampKey = `exam_${examId}_section_${sectionId}_submitted_time`;
  
  localStorage.removeItem(key);
  localStorage.removeItem(timestampKey);
  console.log('Cleared submission flag for section:', sectionId);
};

/**
 * Clear all submission flags for a specific exam
 * @param {string} examId - The exam ID
 */
export const clearExamSubmissionFlags = (examId) => {
  if (!examId) return;
  
  // Find all localStorage keys related to this exam
  const keysToRemove = [];
  
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(`exam_${examId}_section_`) || key.startsWith(`auto_submit_${examId}_`)) {
      keysToRemove.push(key);
    }
  });
  
  // Remove all the keys
  if (keysToRemove.length > 0) {
    console.log(`Clearing ${keysToRemove.length} submission flags for exam:`, examId);
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
};

/**
 * Clear all exam submission flags (can be used when logging out)
 */
export const clearAllExamSubmissionFlags = () => {
  Object.keys(localStorage).forEach(key => {
    if (key.includes('_section_') && key.includes('_submitted')) {
      localStorage.removeItem(key);
    }
  });
};
