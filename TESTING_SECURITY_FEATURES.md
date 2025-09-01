# How to Test Exam Security Features

## Overview

This guide provides step-by-step instructions for testing the security features implemented in the exam system. These features are designed to prevent cheating during online exams by detecting and preventing various browser actions that could compromise exam integrity.

## Prerequisites

- NodeJS and npm installed
- Access to the Exam System Frontend repository
- A modern web browser (Chrome, Firefox, Edge, or Safari)

## Setup for Testing

1. Clone the repository (if you haven't already)
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Navigate to the exam page through the application UI

## Security Features to Test

### 1. Developer Tools Detection

**Test Steps:**
1. Start an exam session
2. Try to open developer tools using:
   - Right-click and select "Inspect" or "Inspect Element"
   - F12 key
   - Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac)
   - From browser menu: More tools > Developer tools

**Expected Results:**
- A modal should appear warning that developer tools have been detected
- After clicking OK, you should be redirected to the home page
- A toast notification should also appear

### 2. Visibility Detection (Strict Mode)

**Test Steps:**
1. Start an exam session
2. Try to switch to another tab or application:
   - Using Alt+Tab
   - Clicking on another application
   - Opening a new tab and switching to it
   - Minimizing the browser window

**Expected Results:**
- Immediate modal and toast notification indicating rule violation
- After clicking OK on the modal, redirection to home page

### 3. Keyboard Shortcut Prevention

**Test Steps:**
1. Start an exam session
2. Try the following keyboard shortcuts:
   - Ctrl+C, Ctrl+X, Ctrl+V (copy, cut, paste)
   - Ctrl+P (print)
   - Ctrl+S (save)
   - Ctrl+N, Ctrl+T (new window/tab)
   - Ctrl+U (view source)
   - F1, F3-F7, F10-F11 (function keys)
   - Alt+Tab (switch application)
   - Windows key
   - Ctrl+A (select all)

**Expected Results:**
- Shortcuts should be prevented
- A modal notification warning that shortcuts are disabled

### 4. Right-Click and Text Selection Prevention

**Test Steps:**
1. Start an exam session
2. Try to right-click on the page
3. Try to select text on the page (except in input fields)
4. Try to drag elements on the page

**Expected Results:**
- Right-click context menu should not appear
- Text selection should be prevented outside of input fields
- Modal notifications should warn about these actions being disabled

### 5. Browser Navigation Prevention

**Test Steps:**
1. Start an exam session
2. Try to navigate using the browser's back/forward buttons
3. Try to manually change the URL

**Expected Results:**
- Navigation should be prevented
- You should remain on the exam page
- A modal notification should warn about navigation being disabled

### 6. Print and Screen Capture Prevention

**Test Steps:**
1. Start an exam session
2. Try to print the page (Ctrl+P or browser menu)
3. Try to use the PrintScreen key

**Expected Results:**
- Print dialog should not appear
- A modal notification should warn that printing is disabled
- When using PrintScreen, a modal should warn that screen capture is disabled

## Troubleshooting

If any of the security features are not working as expected:

1. Check the browser console for errors (before starting the exam)
2. Verify that the security module is properly imported and initialized in the exam component
3. Try using a different browser to rule out browser-specific issues
4. Check if any browser extensions might be interfering with the security features

## Reporting Issues

If you encounter any issues with the security features, please report them with the following information:

1. Which security feature is not working
2. Steps to reproduce the issue
3. Browser name and version
4. Any error messages or unusual behavior
5. Screenshots if applicable

## Important Notes

- These security measures are not foolproof and should be combined with other anti-cheating measures
- Different browsers may handle these security features differently
- Students with legitimate accessibility needs may require accommodations
