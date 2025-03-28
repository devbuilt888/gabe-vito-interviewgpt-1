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
        Try to ask about several previous jobs and experiences, listed in the user's resume.
        Keep your responses concise and suitable for text-to-speech processing.
        Ask one question at a time and wait for the user's response.
        After the user responds, provide feedback and ask the next question.
        After the interview, provide a summary of the interview and the user's strengths and weaknesses, but don't give the strenghts and weaknesses as a numbered list, instead as a short paragraph for each
        After the interview give a score out of 100, and a short paragraph explaining the score. The last sentence should be "Thank you for your time, have a great day!" and should only be said once at the end of the interview.`
      },
      // another version where the interviewer is more technical and focused on technical questions
    //   content: `You are Bob, an AI interviewer conducting a technical interview. 
    //   Ask questions based on the user's resume and experience. 
    //   Try to ask about several previous jobs and experiences, listed in the user's resume.
    //   Keep your responses concise and suitable for text-to-speech processing.
    //   Ask one question at a time and wait for the user's response.
    //   After the user responds, provide feedback and ask the next question.
    //   After the interview, provide a summary of the interview and the user's strengths and weaknesses.`
    // },
      ...messages
    ],
    stream: true,
  });

  // Create a stream of the response
  const stream = OpenAIStream(response, {
    onCompletion: async (completion: string) => {
      // The completion is the full response
      console.log('Stream completed:', completion);
    },
    onToken: async (token: string) => {
      // Each token is a piece of the response
      console.log('Received token:', token);
    },
  });

  return new StreamingTextResponse(stream);
}