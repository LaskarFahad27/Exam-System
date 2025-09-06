import { fetchQuestionImage } from './api';

// Store for object URLs to prevent memory leaks
const objectURLStore = new Map();

/**
 * Get an object URL for a question image
 * 
 * @param {number} imageId - The ID of the image
 * @param {boolean} forceRefresh - Whether to force a refresh of the image
 * @returns {Promise<string>} - A promise that resolves to the object URL
 */
export async function getQuestionImageObjectUrl(imageId, forceRefresh = false) {
  if (!imageId) return null;
  
  // Return existing URL if we have one and not forcing refresh
  if (!forceRefresh && objectURLStore.has(imageId)) {
    return objectURLStore.get(imageId);
  }
  
  try {
    // If we had a previous URL for this ID, revoke it to prevent memory leaks
    if (objectURLStore.has(imageId)) {
      URL.revokeObjectURL(objectURLStore.get(imageId));
    }
    
    // Fetch the image blob
    const blob = await fetchQuestionImage(imageId);
    
    // Create and store an object URL
    const objectUrl = URL.createObjectURL(blob);
    objectURLStore.set(imageId, objectUrl);
    
    return objectUrl;
  } catch (error) {
    console.error(`Error creating object URL for image ${imageId}:`, error);
    return null;
  }
}

/**
 * Clean up object URLs to prevent memory leaks
 * Call this when you're done with images, like when unmounting components
 * 
 * @param {number|number[]|null} imageId - The ID or IDs of images to clean up, or null to clean up all
 */
export function cleanupImageObjectUrls(imageId = null) {
  // Clean up a specific image
  if (typeof imageId === 'number' && objectURLStore.has(imageId)) {
    URL.revokeObjectURL(objectURLStore.get(imageId));
    objectURLStore.delete(imageId);
    return;
  }
  
  // Clean up multiple images
  if (Array.isArray(imageId)) {
    imageId.forEach(id => {
      if (objectURLStore.has(id)) {
        URL.revokeObjectURL(objectURLStore.get(id));
        objectURLStore.delete(id);
      }
    });
    return;
  }
  
  // Clean up all images if no specific ID provided
  if (imageId === null) {
    objectURLStore.forEach(url => URL.revokeObjectURL(url));
    objectURLStore.clear();
  }
}
