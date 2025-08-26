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
  return localStorage.getItem(key) === 'true';
};

/**
 * Mark a section as submitted
 * @param {string} examId - The exam ID
 * @param {string} sectionId - The section ID
 */
export const markSectionSubmitted = (examId, sectionId) => {
  if (!examId || !sectionId) return;
  
  const key = `exam_${examId}_section_${sectionId}_submitted`;
  localStorage.setItem(key, 'true');
};

/**
 * Clear a specific section's submission flag
 * @param {string} examId - The exam ID
 * @param {string} sectionId - The section ID 
 */
export const clearSectionSubmitted = (examId, sectionId) => {
  if (!examId || !sectionId) return;
  
  const key = `exam_${examId}_section_${sectionId}_submitted`;
  localStorage.removeItem(key);
};

/**
 * Clear all submission flags for a specific exam
 * @param {string} examId - The exam ID
 */
export const clearExamSubmissionFlags = (examId) => {
  if (!examId) return;
  
  // Find all localStorage keys related to this exam
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(`exam_${examId}_section_`)) {
      localStorage.removeItem(key);
    }
  });
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
