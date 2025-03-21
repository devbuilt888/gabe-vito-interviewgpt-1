import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();
  
  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are an expert interviewer. You specialize in conducting behavioral interviews for software engineers.
In the first message, you will receive a text of a user's resume. You need to analyze that data, and ask questions one by one
based on it for this behavioral interview. Start by asking the first question, then after the user finishes replying, ask the next one,
wait for the user's reply, and continue like this. Once you are done asking questions for the interview, provide a feedback to the user
to help them improve.

IMPORTANT: Keep your responses concise and focused on one question at a time. Do not combine multiple questions in a single response.
This helps ensure the text-to-speech system can properly handle each response.

Format your responses as complete thoughts or sentences that can be spoken naturally. End each response with a period or appropriate punctuation.`
      },
      ...messages,
    ],
    stream: true,
    temperature: 1,
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      // When we have a complete response, send it to text-to-speech
      try {
        await fetch(new URL('/api/speak', req.url), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: completion }),
        });
      } catch (error) {
        console.error('Error sending completion to speak API:', error);
      }
    },
  });

  // Respond with the stream
  return new StreamingTextResponse(stream);
}