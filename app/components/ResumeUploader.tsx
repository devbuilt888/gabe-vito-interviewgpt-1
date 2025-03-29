import React, { useState, useRef, DragEvent, useEffect } from "react";
import AudioChat from "./AudioChat";

const ResumeUploader = () => {
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialText, setInitialText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add a class to body when chat is shown
  useEffect(() => {
    if (showChat) {
      document.body.classList.add('chat-active');
    } else {
      document.body.classList.remove('chat-active');
    }
    
    return () => {
      document.body.classList.remove('chat-active');
    };
  }, [showChat]);

  const handleResumeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsLoading(true);
    setError(null);
    const file = event.target.files?.[0];
    if (!file) {
      console.error("No file selected");
      setError("No file selected");
      setIsLoading(false);
      return;
    }

    await processFile(file);
  };

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      setError("Please upload a PDF file");
      setIsLoading(false);
      return;
    }

    console.log('Processing file:', file.name, 'Size:', file.size);

    const formData = new FormData();
    formData.append("file", file);
    
    try {
      console.log('Sending file to server');
      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const { text: extractedText } = await response.json();
      console.log('Received extracted text, length:', extractedText?.length);

      if (!extractedText) {
        throw new Error('No text was extracted from the PDF');
      }

      setInitialText(extractedText);
      setShowChat(true);
    } catch (error) {
      console.error("Error processing resume:", error);
      setError(error instanceof Error ? error.message : 'Failed to process resume');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {!showChat ? (
        <div
          className={`w-full max-w-2xl p-8 text-center border-2 border-dashed rounded-lg ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf"
            onChange={handleResumeUpload}
          />
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Upload Your Resume
            </h1>
            <p className="text-gray-600">
              Drag and drop your PDF resume here, or click to select a file
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Select File
            </button>
            {isLoading && (
              <div className="mt-4">
                <div className="w-8 h-8 mx-auto border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Processing your resume...</p>
              </div>
            )}
            {error && (
              <div className="mt-4 p-4 text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>
      ) : (
        <AudioChat initialText={initialText} />
      )}
    </div>
  );
};

export default ResumeUploader;
