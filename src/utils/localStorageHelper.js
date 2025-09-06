// Local Storage Helper Functions
// This utility provides more reliable localStorage operations with logging and error handling

/**
 * Sets a value in localStorage with verification
 * @param {string} key - The localStorage key
 * @param {any} value - The value to store (will be stringified if not a string)
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const setStorageItem = (key, value) => {
  try {
    // Convert non-string values to strings
    const stringValue = typeof value === 'string' ? value : String(value);
    
    // Clear existing value first
    localStorage.removeItem(key);
    
    // Set the new value
    localStorage.setItem(key, stringValue);
    
    // Verify the value was stored correctly - with retry mechanism
    let retryCount = 0;
    const maxRetries = 3;
    let storedValue = localStorage.getItem(key);
    
    // If the value isn't stored yet, retry a few times with delays
    const checkStoragePromise = new Promise((resolve, reject) => {
      function checkStorage() {
        storedValue = localStorage.getItem(key);
        if (storedValue === stringValue) {
          console.log(`LocalStorage: Set ${key} = ${stringValue} (success after ${retryCount} retries)`);
          resolve(true);
        } else if (retryCount < maxRetries) {
          retryCount++;
          console.log(`LocalStorage: Retry ${retryCount} for ${key} = ${stringValue}`);
          setTimeout(checkStorage, 100 * retryCount);
        } else {
          console.error(`LocalStorage: Failed to verify ${key} after ${maxRetries} retries`);
          reject(new Error(`Failed to verify localStorage value for ${key}`));
        }
      }
      
      checkStorage();
    });
    
    // For synchronous code, return a boolean immediately but continue checking
    checkStoragePromise.catch(e => console.error(e));
    
    return storedValue === stringValue;
  } catch (error) {
    console.error(`LocalStorage: Error setting ${key}`, error);
    return false;
  }
};

/**
 * Gets a value from localStorage with logging
 * @param {string} key - The localStorage key
 * @param {any} defaultValue - The default value to return if the key doesn't exist
 * @returns {string} - The stored value or default
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const value = localStorage.getItem(key);
    console.log(`LocalStorage: Get ${key} = ${value}`);
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.error(`LocalStorage: Error getting ${key}`, error);
    return defaultValue;
  }
};

/**
 * Removes a value from localStorage
 * @param {string} key - The localStorage key
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
    console.log(`LocalStorage: Removed ${key}`);
  } catch (error) {
    console.error(`LocalStorage: Error removing ${key}`, error);
  }
};

/**
 * Displays all current image-related localStorage values
 * Useful for debugging
 */
export const debugImageStorage = () => {
  const imageId = localStorage.getItem('lastUploadedImageId');
  const imagePath = localStorage.getItem('lastUploadedImagePath');
  
  console.log('DEBUG - Current localStorage values:');
  console.log('lastUploadedImageId:', imageId);
  console.log('lastUploadedImagePath:', imagePath);
  
  return { imageId, imagePath };
};
