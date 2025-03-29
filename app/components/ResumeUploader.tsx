import React, { useState, useRef, DragEvent, useEffect } from "react";
import AudioChat from "./AudioChat";

const ResumeUploader = () => {
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialText, setInitialText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
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
    const file = event.target.files?.[0];
    if (!file) {
      console.error("No file selected");
      setIsLoading(false);
      return;
    }

    await processFile(file);
  };

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const { text: extractedText } = await response.json();

      setInitialText(extractedText);
      setShowChat(true);
    } catch (error) {
      console.error("Error processing resume:", error);
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
    setIsLoading(true);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <p className="instructions-text">
        {!showChat
          ? "Upload your resume to start the interview."
          : "Answer Bob's questions using your microphone."}
      </p>
      {!showChat ? (
        <>
          <div 
            className={`file-upload-btn-container ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              onChange={handleResumeUpload}
              accept="application/pdf"
              hidden
              ref={fileInputRef}
            />
            <label htmlFor="file-upload" className="file-upload-btn">
              📄 {isDragging ? 'Drop Resume Here' : 'Upload Resume'}
            </label>
            <p className="drag-drop-hint">or drag and drop a PDF file here</p>
          </div>
          {isLoading && <div className="loading-spinner"></div>}
        </>
      ) : (
        <AudioChat initialText={initialText} />
      )}
    </div>
  );
};

export default ResumeUploader;
