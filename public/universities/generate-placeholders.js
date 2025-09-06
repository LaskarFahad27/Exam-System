function createImage(width, height, backgroundColor, textColor, text, filename) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Text
    ctx.fillStyle = textColor;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    
    // Save the image
    const dataUrl = canvas.toDataURL('image/jpeg');
    
    // Create download link
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
}

// Generate university placeholder images
createImage(800, 450, '#003366', '#ffffff', 'North South University (NSU)', 'nsu.jpg');
createImage(800, 450, '#2a4d69', '#ffffff', 'BRAC University (BRACU)', 'bracu.jpg');
createImage(800, 450, '#006838', '#ffffff', 'Ahsanullah University (AUST)', 'aust.jpg');
createImage(800, 450, '#7b1113', '#ffffff', 'East West University (EWU)', 'ewu.jpg');
createImage(800, 450, '#272361', '#ffffff', 'United International University (UIU)', 'uiu.jpg');
