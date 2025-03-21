'use client';

import Image from 'next/image';
import ResumeUploader from './components/ResumeUploader';

export default function Home() {
  return (
    <main className="App">
      <div className='container'>
        {/* <div className='logoBox'>
          <Image src="/logo.png" alt="InterviewGPT logo" width="400" height="75" />
        </div> */}
        <h1 className="app-title">
          Tech Interview <span className="span-primary">Pro</span>
        </h1>
        <ResumeUploader />
      </div>
    </main>
  )
}