'use client';

import { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
  useTracks,
  RoomAudioRenderer,
  ControlBar,
  useLocalParticipant,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

type AudioChatProps = {
  initialText?: string;
};

const AudioChat: React.FC<AudioChatProps> = ({ initialText }) => {
  const [token, setToken] = useState('');
  const [roomName, setRoomName] = useState('');
  const [wsUrl, setWsUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'system', content: initialText ?? 'Hello, I am Bob the Interviewer. How can I help you?' }
  ]);

  useEffect(() => {
    const setupRoom = async () => {
      try {
        // Generate a unique room name
        const newRoomName = `interview-${Math.random().toString(36).substring(7)}`;
        const participantName = 'user-' + Math.random().toString(36).substring(7);

        console.log('Setting up room:', { newRoomName, participantName });

        // Get token from our API
        const response = await fetch('/api/livekit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomName: newRoomName,
            participantName,
          }),
        });

        const data = await response.json();
        console.log('API Response:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get token');
        }

        // Validate token
        if (!data.token || typeof data.token !== 'string') {
          console.error('Invalid token received:', data);
          throw new Error('Invalid token received from server');
        }

        if (!data.wsUrl) {
          throw new Error('Missing WebSocket URL from server');
        }

        setToken(data.token);
        setRoomName(data.roomName);
        setWsUrl(data.wsUrl);
        setIsConnected(true);
      } catch (err) {
        console.error('Error setting up room:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect to interview room');
      }
    };

    setupRoom();
  }, []);

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry Connection</button>
      </div>
    );
  }

  if (!isConnected || !token || !roomName || !wsUrl) {
    return <div className="loading-container">Connecting to interview room...</div>;
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={wsUrl}
      connect={true}
      audio={true}
      video={false}
      onError={(error) => {
        console.error('LiveKit error:', error);
        setError(error.message);
      }}
      onConnected={() => {
        console.log('Connected to LiveKit room:', roomName);
      }}
      onDisconnected={() => {
        console.log('Disconnected from LiveKit room:', roomName);
      }}
    >
      <div className="audio-chat-container">
        <div className="messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role === 'system' ? 'system' : 'user'}`}
            >
              {message.content}
            </div>
          ))}
        </div>
        <div className="controls-container">
          <RoomAudioRenderer />
          <ControlBar />
        </div>
      </div>
    </LiveKitRoom>
  );
};

export default AudioChat; 