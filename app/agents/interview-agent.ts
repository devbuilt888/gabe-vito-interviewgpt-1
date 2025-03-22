import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import say from 'say';

// Queue to store pending text chunks
let textQueue: string[] = [];
let isSpeaking = false;

// Function to speak text using say
async function speakText(text: string): Promise<void> {
  try {
    console.log('Starting text-to-speech with text:', text);
    console.log('Text length:', text.length, 'characters,', text.split(' ').length, 'words');

    // Return a promise that resolves when the speech is complete
    return new Promise((resolve, reject) => {
      say.speak(text, undefined, 1.0, (err) => {
        if (err) {
          console.error('Error in text-to-speech:', err);
          reject(err);
        } else {
          console.log('Finished speaking chunk');
          console.log('Text-to-speech completed successfully');
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    throw error;
  }
}

// Function to process the text queue
async function processQueue() {
  if (isSpeaking || textQueue.length === 0) return;
  
  isSpeaking = true;
  while (textQueue.length > 0) {
    const text = textQueue.shift()!;
    try {
      await speakText(text);
    } catch (error) {
      console.error('Error speaking text chunk:', error);
    }
  }
  isSpeaking = false;
}

// Function to add text to the queue and process it
function queueText(text: string) {
  textQueue.push(text);
  processQueue().catch(console.error);
}

// Main function to start speaking
async function main() {
  try {
    console.log('Starting interview agent...');
    
    // Get command line arguments
    const args = process.argv.slice(2);
    console.log('Received arguments:', args);

    if (args.length > 0) {
      const text = args[0];
      await speakText(text);
    }
  } catch (error) {
    console.error('Error in interview agent:', error);
    process.exit(1);
  }
}

// Run the main function if this is the main module
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

// Export the queueText function for external use
export { queueText };

// Export the speakText function for external use
export { speakText }; 