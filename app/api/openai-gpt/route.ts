import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // If this is the first message (system message), don't send it to OpenAI
  if (messages.length === 1 && messages[0].role === 'system') {
    return new Response(JSON.stringify({ message: messages[0].content }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `You are Bob, an AI interviewer conducting a behavioral interview. 
        Ask questions based on the user's resume and experience. 
        Keep your responses concise and suitable for text-to-speech processing.
        Ask one question at a time and wait for the user's response.`
      },
      ...messages
    ],
    stream: true,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}