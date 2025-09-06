import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, BookOpen, X } from 'lucide-react';
import './PassageBar.css';

/**
 * PassageBar Component - Renders a collapsible passage bar for reading sections
 * @param {Object} props - Component props
 * @param {string} props.passageText - The text of the reading passage
 * @param {string} props.passageTitle - The title of the reading passage (optional)
 */
const PassageBar = ({ passageText, passageTitle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  // For initial state, truncate the passage to 100 characters
  const truncatedPassage = passageText && passageText.length > 100 
    ? `${passageText.substring(0, 100)}...` 
    : passageText;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleVisibility = (e) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  // If there's no passage text, don't render anything
  if (!passageText) return null;

  return (
    <div className={`passage-bar ${isVisible ? 'visible' : 'hidden'}`}>
      {isVisible ? (
        <>
          <div 
            className="passage-header" 
            onClick={toggleExpand}
          >
            <div className="passage-header-content">
              <BookOpen className="passage-icon" />
              <span className="passage-title">
                {passageTitle ? `${passageTitle}: ` : ''}
                Reading Passage
              </span>
              {isExpanded ? (
                <ChevronUp className="passage-chevron" />
              ) : (
                <ChevronDown className="passage-chevron" />
              )}
            </div>
            <button 
              className="passage-close-button" 
              onClick={toggleVisibility}
              aria-label="Close passage"
            >
              <X className="passage-close-icon" />
            </button>
          </div>
          <div className={`passage-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
            {isExpanded ? (
              <div className="passage-full-text">{passageText}</div>
            ) : (
              <div className="passage-preview">
                {truncatedPassage}
                {passageText.length > 100 && (
                  <button 
                    className="see-more-button" 
                    onClick={toggleExpand}
                  >
                    See More
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <button 
          className="passage-show-button"
          onClick={toggleVisibility}
          aria-label="Show passage"
        >
          <BookOpen className="passage-show-icon" />
          <span>Show Reading Passage</span>
        </button>
      )}
    </div>
  );
};

export default PassageBar;
