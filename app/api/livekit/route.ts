import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { roomName, participantName } = await req.json();
    console.log('Received request:', { roomName, participantName });

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL;

    console.log('Environment variables:', {
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      wsUrl
    });

    if (!apiKey || !apiSecret || !wsUrl) {
      console.error('Missing environment variables:', { apiKey: !!apiKey, apiSecret: !!apiSecret, wsUrl: !!wsUrl });
      return NextResponse.json(
        { error: 'Server misconfigured - missing environment variables' },
        { status: 500 }
      );
    }

    // Create room service client
    const roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret);

    // Create the room if it doesn't exist
    try {
      await roomService.createRoom({
        name: roomName,
        emptyTimeout: 10 * 60, // 10 minutes
      });
      console.log('Room created or already exists:', roomName);
    } catch (roomError) {
      console.error('Error creating room:', roomError);
      // Continue anyway as the room might already exist
    }

    // Generate token with proper configuration
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = at.toJwt();
    console.log('Token generated successfully for:', {
      roomName,
      participantName
    });

    // Return the token and room name
    return NextResponse.json({
      token,
      roomName,
      wsUrl
    });
  } catch (error) {
    console.error('Error in LiveKit token generation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate token' },
      { status: 500 }
    );
  }
} 