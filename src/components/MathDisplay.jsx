import React from 'react';
import PropTypes from 'prop-types';
import { renderContent, renderMathContent } from '../utils/mathUtils';
import './MathDisplay.css';

/**
 * Component for displaying mathematical content
 * Automatically detects and renders math expressions within text
 */
const MathDisplay = ({ content, block = false, className = '' }) => {
  return (
    <div className={`math-display ${className}`}>
      {block ? renderMathContent(content, true) : renderContent(content)}
    </div>
  );
};

MathDisplay.propTypes = {
  content: PropTypes.string.isRequired,
  block: PropTypes.bool,
  className: PropTypes.string
};

export default MathDisplay;
