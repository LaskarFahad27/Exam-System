# Exam Security Modal Implementation

## Overview

This document provides an overview of the modal-based security notifications implemented in the exam system.

## Key Features

1. **Modern UI Modals**: Replaced basic browser alerts with styled, responsive modal dialogs
2. **Explicit Dismissal**: Users must acknowledge violations by clicking the "OK" button
3. **Visual Distinction**: Different styling for errors (red) vs warnings (amber)
4. **Automatic Redirection**: For serious violations, navigation occurs after modal dismissal
5. **React Portal Implementation**: Modals are rendered outside the normal component hierarchy

## Implementation Details

### Components

1. **SecurityViolationModal**: The actual modal UI component
   - Accepts props for title, message, and severity
   - Uses React Portal for proper rendering

2. **SecurityModalManager**: Singleton class for global modal management
   - Methods to open and close modals
   - Subscription system for components to listen to modal state changes

3. **SecurityModalContainer**: Container component included in exam pages
   - Subscribes to the modal manager
   - Renders the modal when needed

### Usage Flow

When a security violation is detected:

1. Security code calls `securityModalManager.openModal()` with:
   - Title (e.g., "Developer Tools Detected")
   - Message (detailed explanation of the violation)
   - Severity ("error" for serious violations, "warning" for minor ones)
   - Optional callback function (e.g., navigation after dismissal)

2. The modal manager notifies all subscribers of the new modal state

3. The SecurityModalContainer renders the modal with the provided information

4. When the user clicks "OK":
   - The modal is closed
   - Any callback function is executed (e.g., navigating away from the exam)

## Visual Design

### Error Modals (Serious Violations)
- Red header with XCircle icon
- Clear explanation of the violation
- "OK" button to acknowledge and proceed with consequences

### Warning Modals (Minor Violations)
- Amber header with AlertTriangle icon
- Explanation of why the action is not allowed
- "OK" button to dismiss and continue the exam

## Integration with Security Module

The modal system is fully integrated with the exam security module:
- Developer tools detection shows an error modal
- Tab/window visibility loss shows an error modal
- Keyboard shortcuts show warning modals
- Navigation attempts show warning modals
- Print/screen capture attempts show warning modals

## Benefits Over Previous Implementation

1. **Better User Experience**: Modern styled interface instead of jarring browser alerts
2. **More Informative**: Provides clearer explanations of violations
3. **Controlled Flow**: Navigation occurs after user acknowledgment
4. **Consistent Design**: Matches the overall exam system UI
5. **Scalability**: Can easily add more types of notifications as needed
