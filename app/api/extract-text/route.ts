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

    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      fullText += strings.join(' ') + '\n';
    }

    return NextResponse.json({ text: fullText }, { status: 200 });
  } catch (error) {
    console.error('PDF extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from PDF' },
      { status: 500 }
    );
  }
}