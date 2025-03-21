import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    // Start the agent process with the text
    const agentPath = path.resolve(process.cwd(), 'app', 'agents', 'interview-agent.ts');
    
    console.log('Starting agent with:', {
      agentPath,
      text
    });

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
          resolve(NextResponse.json({ success: true, stdout, stderr }));
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });
    }).catch((error) => {
      console.error('Error in agent process:', error);
      return NextResponse.json(
        { error: 'Failed to execute agent' },
        { status: 500 }
      );
    });

  } catch (error) {
    console.error('Error in /api/speak:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 