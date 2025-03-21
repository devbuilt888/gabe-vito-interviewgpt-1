import { AccessToken } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { roomName, participantName } = await req.json();

    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !process.env.LIVEKIT_WS_URL) {
      throw new Error('Missing required environment variables');
    }

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity: participantName }
    );

    at.addGrant({ 
      roomJoin: true, 
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    // Create agent token
    const agentAt = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity: 'agent' }
    );

    agentAt.addGrant({ 
      roomJoin: true, 
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const agentToken = await agentAt.toJwt();

    // Set environment variables for the agent process
    process.env.AGENT_TOKEN = agentToken;
    process.env.ROOM_NAME = roomName;

    // Start the agent process
    const agentPath = path.resolve(process.cwd(), 'app', 'agents', 'interview-agent.ts');
    
    console.log('Starting agent with:', {
      agentPath
    });

    // Function to start the agent with text
    const startAgentWithText = async (text: string) => {
      return new Promise((resolve, reject) => {
        // Construct the full command
        const command = `yarn ts-node --project "${path.resolve(process.cwd(), 'tsconfig.json')}" --transpile-only "${agentPath}" "${text}"`;
        console.log('Executing command:', command);

        const agentProcess = spawn(command, {
          shell: true,
          env: {
            ...process.env,
            NODE_ENV: process.env.NODE_ENV || 'development',
            TS_NODE_COMPILER_OPTIONS: '{"module":"commonjs"}'
          },
          cwd: process.cwd()
        });

        let stdout = '';
        let stderr = '';

        agentProcess.stdout.on('data', (data) => {
          stdout += data;
          console.log(`Agent stdout: ${data}`);
        });

        agentProcess.stderr.on('data', (data) => {
          stderr += data;
          console.error(`Agent stderr: ${data}`);
        });

        agentProcess.on('error', (error) => {
          console.error('Failed to start agent process:', error);
          reject(error);
        });

        agentProcess.on('close', (code) => {
          if (code === 0) {
            resolve({ stdout, stderr });
          } else {
            reject(new Error(`Process exited with code ${code}`));
          }
        });
      });
    };

    // Start the agent with initial message
    const initialMessage = "Hello! I'm your interviewer today. I'll be reviewing your resume and asking you some questions.";
    await startAgentWithText(initialMessage);

    return NextResponse.json({
      token,
      roomName,
      wsUrl: process.env.LIVEKIT_WS_URL,
    });

  } catch (error) {
    console.error('Error in /api/agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 