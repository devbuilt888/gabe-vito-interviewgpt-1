import React, { useState } from "react";
import AudioChat from "./AudioChat";

const ResumeUploader = () => {
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialText, setInitialText] = useState("");

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

    const formData = new FormData();
    formData.append("file", file);
    console.log("formdata", formData);
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

  return (
    <div>
      <p className="instructions-text">
        {!showChat
          ? "Upload your resume to start the interview."
          : "Answer Bob's questions using your microphone."}
      </p>
      {!showChat ? (
        <>
          <div className="file-upload-btn-container">
            <input
              type="file"
              id="file-upload"
              onChange={handleResumeUpload}
              accept="application/pdf"
              hidden
            />
            <label htmlFor="file-upload" className="file-upload-btn">
              ⚡️ Upload Resume
            </label>
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
