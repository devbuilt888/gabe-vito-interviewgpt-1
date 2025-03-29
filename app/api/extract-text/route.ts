// import formidable from "formidable";
import { NextResponse } from 'next/server';

// Use Node.js runtime instead of Edge for better compatibility with Netlify
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    console.log('Extracting text from PDF...');
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`File received: ${file.name}, type: ${file.type}, size: ${file.size}`);

    // For PDF files, we'll use a simplified approach for text extraction
    if (file.type === 'application/pdf') {
      const buffer = await file.arrayBuffer();
      const binary = new Uint8Array(buffer);
      
      console.log(`Processing binary data of size: ${binary.length}`);
      
      // Extract text from binary PDF data
      // This is a simplified approach that works in Node.js runtime
      let text = '';
      const excludeMarkers = ['/Font', '/XObject', '/Image', '/Page', '/Contents'];
      
      // Convert binary to string for simple text extraction
      const content = Array.from(binary)
        .map(b => String.fromCharCode(b))
        .join('');
      
      // Simple regex to extract text between parentheses after text markers
      const regex = /\/Text[^(]*\(([^)]+)\)/g;
      const regex2 = /\/T[^(]*\(([^)]+)\)/g;
      
      let match: RegExpExecArray | null;
      
      // Extract text using the first regex pattern
      while ((match = regex.exec(content)) !== null) {
        if (match && match[1]) {
          text += match[1] + ' ';
        }
      }
      
      // Extract text using the second regex pattern
      while ((match = regex2.exec(content)) !== null) {
        if (match && match[1]) {
          text += match[1] + ' ';
        }
      }
      
      // Fall back to any text in parentheses if nothing found
      if (text.trim() === '') {
        console.log('No text found with primary patterns, trying fallback...');
        const parensRegex = /\(([^\)]+)\)/g;
        while ((match = parensRegex.exec(content)) !== null) {
          if (match && match[1]) {
            // Check if this might be text and not metadata
            const isMaybeText = match[1].length > 2 && 
              !excludeMarkers.some(marker => match[1].includes(marker));
            
            if (isMaybeText) {
              text += match[1] + ' ';
            }
          }
        }
      }
      
      // Clean up text
      text = text
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\\\/g, '\\')
        .replace(/\\/g, '')
        .replace(/\s+/g, ' ');
      
      console.log(`Extracted text length: ${text.length}`);
      return NextResponse.json({ text }, { status: 200 });
    }
    
    // For other file types, just return an error
    console.log(`Unsupported file type: ${file.type}`);
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type}` },
      { status: 400 }
    );
  } catch (error) {
    console.error('File extraction error:', error);
    return NextResponse.json(
      { error: `Failed to extract text from file: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}