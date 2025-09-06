/**
 * Navigation utility functions
 */

/**
 * Scrolls the window to the top with smooth behavior
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

/**
 * Navigate to a path and scroll to top
 * @param {function} navigate - The navigate function from useNavigate hook
 * @param {string} path - The path to navigate to
 * @param {object} options - Additional options for the navigate function
 */
export const navigateAndScrollToTop = (navigate, path, options = {}) => {
  navigate(path, options);
  scrollToTop();
};
