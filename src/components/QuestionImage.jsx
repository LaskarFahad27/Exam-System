import React, { useState, useEffect } from 'react';
import { getQuestionImageUrl, fetchQuestionImage } from '../utils/api';
import { getQuestionImageObjectUrl, cleanupImageObjectUrls } from '../utils/imageUtils';

/**
 * Component for displaying question images with proper error handling and loading states
 * 
 * @param {Object} props
 * @param {number} props.imageId - The ID of the image to display
 * @param {string} props.className - Optional CSS class names
 * @param {string} props.alt - Alt text for the image
 * @param {Function} props.onError - Optional callback for error handling
 * @param {boolean} props.useObjectUrl - Whether to use object URLs (better for caching)
 * @param {boolean} props.forceRefresh - Whether to force refresh the image
 */
const QuestionImage = ({ 
  imageId, 
  className = '', 
  alt = 'Question image', 
  onError,
  useObjectUrl = true,
  forceRefresh = false
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (!imageId) {
      setLoading(false);
      return;
    }

    // Reset states when imageId changes
    setLoading(true);
    setError(null);

    // Check for authentication
    const token = localStorage.getItem("adminToken") || localStorage.getItem("studentToken");
    if (!token) {
      setError("Authentication required to view image");
      setLoading(false);
      return;
    }

    // Different loading strategies based on preference
    if (useObjectUrl) {
      // Object URL approach (better caching, works with both tokens)
      getQuestionImageObjectUrl(imageId, forceRefresh)
        .then(url => {
          if (!url) {
            throw new Error('Failed to create object URL');
          }
          setImageSrc(url);
          setLoading(false);
        })
        .catch(e => {
          console.error('Error loading image:', e);
          setError(`Failed to load image (ID: ${imageId}). Make sure you're authorized.`);
          setLoading(false);
          if (onError) onError(e);
        });
    } else {
      // Direct URL approach
      const imageUrl = getQuestionImageUrl(imageId);
      
      // Create an image object to handle loading and errors
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(imageUrl);
        setLoading(false);
      };
      
      img.onerror = (e) => {
        console.error('Error loading image:', e);
        setError(`Failed to load image (ID: ${imageId}). Make sure you're authorized.`);
        setLoading(false);
        if (onError) onError(e);
      };
      
      // Set the source to start loading
      img.src = imageUrl;
    }
    
    // Clean up
    return () => {
      if (!useObjectUrl && img) {
        img.onload = null;
        img.onerror = null;
      }
    };
  }, [imageId, onError, useObjectUrl, forceRefresh]);

  if (!imageId) return null;
  
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 bg-gray-100 rounded ${className}`}>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`p-4 bg-red-50 text-red-500 border border-red-200 rounded ${className}`}>
        <p className="text-sm">{error}</p>
      </div>
    );
  }
  
  // Cleanup object URLs when component is unmounted from DOM
  useEffect(() => {
    // Cleanup function that runs when component unmounts
    return () => {
      if (imageId) {
        cleanupImageObjectUrls(imageId);
      }
    };
  }, [imageId]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`max-w-full rounded ${className}`}
      onError={(e) => {
        console.error('Image failed to load:', e);
        setError(`Failed to load image (ID: ${imageId})`);
        if (onError) onError(e);
      }}
    />
  );
};

export default QuestionImage;
