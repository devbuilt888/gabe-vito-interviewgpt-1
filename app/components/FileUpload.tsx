// Add this function somewhere appropriate in your component
async function handleFileUpload(file: File) {
  try {
    console.log('Uploading file:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Use relative path for API calls
    // This ensures it works both locally and on Netlify
    const response = await fetch('/api/extract-text', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Extracted text:', data.text);
    
    // Process the extracted text...
    return data.text;
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
} 