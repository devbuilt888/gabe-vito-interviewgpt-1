// import formidable from "formidable";
import { NextResponse } from 'next/server';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import type { TextContent, TextItem } from 'pdfjs-dist/types/src/display/api';

export const runtime = 'edge';
export const maxDuration = 60;

function mergeTextContent(textContent: TextContent) {
  return textContent.items.map(item => {
    const { str, hasEOL } = item as TextItem
    return str + (hasEOL ? '\n' : '')
  }).join('')
}

async function fetchOpenAIResponse(extractedText: string) {
  try {
    const response = await fetch('/api/openai-gpt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: [{role: 'user', content: `Here is my resume:
------
${extractedText}` }]}),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch OpenAI response');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    let chunks = [];

    // Read the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
    }

    // Convert the Uint8Array chunks to string
    const decoder = new TextDecoder('utf-8');
    const text = chunks.map(chunk => decoder.decode(chunk)).join('');

    return text;
  } catch (error) {
    console.error('Error in fetchOpenAIResponse:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // For PDF files, we'll use a simplified approach for text extraction
    if (file.type === 'application/pdf') {
      const buffer = await file.arrayBuffer();
      const binary = new Uint8Array(buffer);
      
      // Extract text from binary PDF data
      // This is a simplified approach that won't work perfectly for all PDFs
      // but will be compatible with Edge runtime
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
      
      return NextResponse.json({ text }, { status: 200 });
    }
    
    // For other file types, just return an error
    return NextResponse.json(
      { error: 'Unsupported file type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('File extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from file' },
      { status: 500 }
    );
  }
}