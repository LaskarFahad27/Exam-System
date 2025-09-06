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
  const [isSticky, setIsSticky] = useState(false);
  
  // For initial state, truncate the passage to 100 characters
  const truncatedPassage = passageText && passageText.length > 100 
    ? `${passageText.substring(0, 100)}...` 
    : passageText;
    
  // Handle scroll events to detect when header should become sticky
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const headerHeight = 64; // Adjust based on your header height
      const shouldBeSticky = scrollPosition > headerHeight;
      if (shouldBeSticky !== isSticky) {
        setIsSticky(shouldBeSticky);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSticky]);

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
    <React.Fragment>
      {/* Sticky header that appears when scrolling */}
      {isSticky && isVisible && (
        <div className="sticky-passage-header">
          <div className="sticky-header-container">
            <div className="passage-header" onClick={toggleExpand}>
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
              {/* <button 
                className="passage-close-button" 
                onClick={toggleVisibility}
                aria-label="Close passage"
              >
                <X className="passage-close-icon" />
              </button> */}
            </div>
          </div>
          {isExpanded && (
            <div className="passage-content expanded">
              <div className="passage-full-text">{passageText}</div>
            </div>
          )}
        </div>
      )}
      
      {/* Regular passage bar that appears in the normal document flow */}
      <div className={`passage-bar ${isVisible ? 'visible' : 'hidden'} ${isSticky ? 'header-hidden' : ''}`}>
        {isVisible ? (
          <React.Fragment>
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
              {/* <button 
                className="passage-close-button" 
                onClick={toggleVisibility}
                aria-label="Close passage"
              >
                <X className="passage-close-icon" />
              </button> */}
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
          </React.Fragment>
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
    </React.Fragment>
  );
};

export default PassageBar;
