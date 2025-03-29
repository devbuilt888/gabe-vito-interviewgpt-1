// Add this function inside your component to handle PDF uploads
const uploadFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Uploading file to Netlify function...', file.name);

    // Use the full URL for API calls when on Netlify
    const isProduction = window.location.hostname !== 'localhost'; 
    const apiUrl = isProduction
      ? `${window.location.origin}/api/extract-text`
      : '/api/extract-text';
      
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Extracted text:', data);
    return data.text;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}; 