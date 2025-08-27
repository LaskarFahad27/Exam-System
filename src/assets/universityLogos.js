import nsuImg from './NSU.jpg';
import bracu from './BRACU.jpg';
import aust from './AUST.jpg';
import ewu from './EWU.jpg';
import uiu from './UIU.jpg';
/**
 * These are base64-encoded SVG logos for universities
 * They're compact, high-quality, and vector-based for sharp rendering at any size
 */

// North South University Logo (NSU)
const nsuLogo = nsuImg;
// BRAC University Logo (BRACU)
const bracuLogo = bracu;
// Ahsanullah University of Science and Technology Logo (AUST)
const austLogo = aust;

// East West University Logo (EWU)
const ewuLogo = ewu;

// United International University Logo (UIU)
const uiuLogo = uiu;

/**
 * This function converts base64 SVG to an image and saves it to a file
 * For simplicity, we're creating a function that would run in a browser environment
 * In a real application, you would use a Node.js approach or a build tool plugin
 */
function saveImageToFile(base64Data, filename) {
  // This code would run in a browser to download the image
  const link = document.createElement('a');
  link.href = base64Data;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export the logos for use in your project
export { nsuLogo, bracuLogo, austLogo, ewuLogo, uiuLogo };
