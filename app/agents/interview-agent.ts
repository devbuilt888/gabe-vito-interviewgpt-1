import say from 'say';

// Queue to store pending text chunks
let textQueue: string[] = [];
let isSpeaking = false;

// Function to speak text using the say package
const speakText = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log('Starting to speak:', text);
    
    // Calculate approximate duration based on word count and speaking rate
    // Assuming average speaking rate of 150 words per minute
    const words = text.split(' ').length;
    const durationMs = (words / 150) * 60 * 1000; // Convert to milliseconds
    
    say.speak(text, undefined, 1.0, (err) => {
      if (err) {
        console.error('Error speaking text:', err);
        reject(err);
        return;
      }
    });

    // Wait for the calculated duration plus a small buffer before resolving
    setTimeout(() => {
      console.log('Finished speaking chunk');
      resolve();
    }, durationMs + 2000); // Add 2 seconds buffer
  });
};

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
    // Get all command line arguments after the script name and join them
    const args = process.argv.slice(2);
    console.log('Received arguments:', args);
    
    const text = args.join(' ');
    if (!text) {
      throw new Error('No text provided to speak');
    }
    
    console.log('Starting text-to-speech with text:', text);
    console.log('Text length:', text.length, 'characters,', text.split(' ').length, 'words');
    
    // Add the text to the queue and wait for completion
    queueText(text);
    
    // Wait for the queue to be processed
    while (textQueue.length > 0 || isSpeaking) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('Text-to-speech completed successfully');
    
    // Add a small delay before exiting to ensure audio is fully played
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.exit(0);
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    process.exit(1);
  }
}

// Run the main function if this is the main module
if (require.main === module) {
  console.log('Starting interview agent...');
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

// Export the queueText function for external use
export { queueText }; 