'use client';

import Image from 'next/image';
import ResumeUploader from './components/ResumeUploader';
import BackgroundAnimation from './components/BackgroundAnimation';

export default function Home() {
  return (
    <main className="App">
      <BackgroundAnimation />
      <div className='container'>
        <h1 className="app-title">
          Interview<span className="span-primary">Pro</span>
        </h1>
        <p className="instructions-text">
          Upload your resume and start a personalized interview session with our AI interviewer.
          Get real-time feedback and improve your interview skills.
        </p>
        <ResumeUploader />
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎙️</div>
            <h3>Voice Interaction</h3>
            <p>Natural conversation with advanced speech recognition</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>AI Feedback</h3>
            <p>Personalized guidance based on your responses</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Resume Analysis</h3>
            <p>Questions tailored to your experience and skills</p>
          </div>
        </div>
      </div>
    </main>
  )
}