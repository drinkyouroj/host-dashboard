import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode, type FC } from 'react';
import { showNotification } from '@mantine/notifications';

type IceServer = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

type StreamConstraints = {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
};

type Participant = {
  id: string;
  name: string;
  stream: MediaStream | null;
  isHost: boolean;
  connection?: RTCPeerConnection;
};

type StreamProviderProps = {
  children: ReactNode;
};

interface StreamContextType {
  localStream: MediaStream | null;
  participants: Participant[];
  isStreaming: boolean;
  isConnected: boolean;
  isHost: boolean;
  startStream: (constraints?: StreamConstraints) => Promise<void>;
  stopStream: () => void;
  connectToPeer: (peerId: string) => Promise<RTCPeerConnection | undefined>;
  disconnectFromPeer: (peerId: string) => void;
  addParticipant: (id: string, name: string, isHost?: boolean) => Promise<Participant>;
  removeParticipant: (id: string) => void;
  toggleVideo: (enabled: boolean) => void;
  toggleAudio: (enabled: boolean) => void;
  toggleScreenShare: () => Promise<void>;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isScreenSharing: boolean;
  getLocalStream: () => MediaStream | null;
}

const StreamContext = createContext<StreamContextType | null>(null);

// Default ICE servers (STUN/TURN)
const defaultIceServers: IceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  // Add your TURN servers here if needed
];

// StreamProvider component
export const StreamProvider: React.FC<StreamProviderProps> = ({ children }) => {
  const [isHost, setIsHost] = useState(window.location.pathname === '/');
  
  // Update isHost when the route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setIsHost(window.location.pathname === '/');
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  // Error state is kept for future error handling
  const [, setError] = useState<string | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenShareStream = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
  const dataChannels = useRef<Record<string, RTCDataChannel>>({});

  // Create a new RTCPeerConnection
  const createPeerConnection = useCallback((peerId: string): RTCPeerConnection => {
    const configuration: RTCConfiguration = {
      iceServers: defaultIceServers,
    };

    const pc = new RTCPeerConnection(configuration);
    peerConnections.current[peerId] = pc;

    // Add local stream tracks to the connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        if (!localStream) return;
        pc.addTrack(track, localStream);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // In a real app, send this to the signaling server
        console.log('ICE candidate:', event.candidate);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state for ${peerId}:`, pc.connectionState);
      if (pc.connectionState === 'connected') {
        setIsConnected(true);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setIsConnected(false);
        // Remove the participant when connection fails
        setParticipants(prev => prev.filter(p => p.id !== peerId));
        if (peerConnections.current[peerId]) {
          peerConnections.current[peerId].close();
          delete peerConnections.current[peerId];
        }
        if (dataChannels.current[peerId]) {
          dataChannels.current[peerId].close();
          delete dataChannels.current[peerId];
        }
      }
    };

    // Handle incoming tracks
    pc.ontrack = (event) => {
      setParticipants(prev => prev.map(p => {
        if (p.id === peerId) {
          const stream = new MediaStream();
          event.streams[0].getTracks().forEach(track => {
            stream.addTrack(track);
          });
          return { ...p, stream };
        }
        return p;
      }));
    };

    return pc;
  }, [localStream]);

  // Initialize local media stream
  const initializeLocalStream = useCallback(async (constraints: StreamConstraints = { video: true, audio: true }) => {
    try {
      console.log('Requesting media with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: constraints.video,
        audio: constraints.audio,
      });
      
      console.log('Successfully got media stream');
      setLocalStream(stream);
      setVideoEnabled(true);
      setAudioEnabled(true);
      
      // Add host as a participant
      if (isHost) {
        setParticipants(prev => [
          ...prev.filter(p => p.id !== 'local'),
          { 
            id: 'local', 
            name: 'Host', 
            stream, 
            isHost: true,
            connection: createPeerConnection('local')
          }
        ]);
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showNotification({
        title: 'Media Error',
        message: `Could not access camera or microphone: ${errorMessage}`,
        color: 'red',
      });
      throw error; // Re-throw to allow handling in the startStream function
    }
  }, [isHost, createPeerConnection]);

  // Start streaming
  const startStream = useCallback(async () => {
    try {
      console.log('Starting stream...');
      
      // Always initialize a new stream to ensure we have the latest permissions
      const stream = await initializeLocalStream();
      
      // Set the stream and update state
      setLocalStream(stream);
      setIsStreaming(true);
      
      // Add the host as a participant if not already added
      const hostExists = participants.some(p => p.id === 'local');
      if (isHost && !hostExists && stream) {
        console.log('Adding host as participant');
        await addParticipant('local', 'Host', true);
      }
      
      showNotification({
        title: 'Success',
        message: 'Stream started successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to start stream:', error);
      // Re-throw to allow error handling in the UI
      throw error;
      showNotification({
        title: 'Stream Error',
        message: 'Failed to start stream. Please check your camera and microphone permissions.',
        color: 'red',
      });
      throw error;
    }
  }, [initializeLocalStream, localStream]);

  // Stop streaming
  const stopStream = useCallback(() => {
    // Close all peer connections
    Object.values(peerConnections.current).forEach(pc => {
      pc.close();
    });
    peerConnections.current = {};
    dataChannels.current = {};

    // Stop all tracks in the local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Stop screen sharing if active
    if (screenShareStream.current) {
      screenShareStream.current.getTracks().forEach(track => track.stop());
      screenShareStream.current = null;
      setIsScreenSharing(false);
    }

    setIsStreaming(false);
    setIsConnected(false);
    setParticipants([]);
    showNotification({
      title: 'Stream Stopped',
      message: 'Your live stream has ended',
      color: 'blue',
    });
  }, [localStream]);

  // Connect to a peer
  const connectToPeer = useCallback(async (peerId: string) => {
    if (!localStream) {
      console.error('Cannot connect to peer: local stream not available');
      return;
    }

    try {
      const pc = createPeerConnection(peerId);
      
      // Create data channel for signaling
      const dataChannel = pc.createDataChannel('signaling');
      dataChannels.current[peerId] = dataChannel;
      
      // Handle data channel events
      dataChannel.onopen = () => {
        console.log(`Data channel opened with ${peerId}`);
      };
      
      dataChannel.onmessage = (event) => {
        console.log('Received message:', event.data);
        // Handle signaling messages here
      };
      
      // Create and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // In a real app, send the offer to the peer via signaling server
      console.log('Created offer:', offer);
      
      return pc;
    } catch (error) {
      console.error('Error connecting to peer:', error);
      throw error;
    }
  }, [localStream, createPeerConnection]);

  // Disconnect from a peer
  const disconnectFromPeer = useCallback((peerId: string) => {
    const pc = peerConnections.current[peerId];
    if (pc) {
      pc.close();
      delete peerConnections.current[peerId];
    }
    
    const dc = dataChannels.current[peerId];
    if (dc) {
      dc.close();
      delete dataChannels.current[peerId];
    }
    
    removeParticipant(peerId);
  }, []);

  // Add a participant
  const addParticipant = useCallback(async (id: string, name: string, isHost = false) => {
    // Check if participant already exists
    const existingParticipant = participants.find(p => p.id === id);
    if (existingParticipant) {
      return existingParticipant;
    }

    const newParticipant: Participant = {
      id,
      name,
      stream: null,
      isHost,
    };

    setParticipants(prev => [...prev, newParticipant]);
    
    // If we're the host, connect to the new participant
    if (isHost && id !== 'local') {
      try {
        const pc = await connectToPeer(id);
        if (pc) {
          newParticipant.connection = pc;
        }
      } catch (error) {
        console.error('Failed to connect to participant:', error);
      }
    }
    
    return newParticipant;
  }, [participants, connectToPeer]);

  // Remove a participant
  const removeParticipant = useCallback((id: string) => {
    // Close the peer connection if it exists
    if (peerConnections.current[id]) {
      peerConnections.current[id].close();
      delete peerConnections.current[id];
    }
    
    // Close the data channel if it exists
    if (dataChannels.current[id]) {
      dataChannels.current[id].close();
      delete dataChannels.current[id];
    }
    
    setParticipants(prev => prev.filter(p => p.id !== id));
  }, []);

  // Get the local stream
  const getLocalStream = useCallback(() => localStream, [localStream]);

  // Toggle video
  const toggleVideo = useCallback((enabled: boolean) => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = enabled;
        setVideoEnabled(enabled);
        
        // Notify peers about video state change
        Object.values(dataChannels.current).forEach(dc => {
          if (dc.readyState === 'open') {
            dc.send(JSON.stringify({
              type: 'video',
              enabled
            }));
          }
        });
      }
    }
  }, [localStream]);

  // Toggle audio
  const toggleAudio = useCallback((enabled: boolean) => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = enabled;
        setAudioEnabled(enabled);
        
        // Notify peers about audio state change
        Object.values(dataChannels.current).forEach(dc => {
          if (dc.readyState === 'open') {
            dc.send(JSON.stringify({
              type: 'audio',
              enabled
            }));
          }
        });
      }
    }
  }, [localStream]);
  
  // Handle remote control messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case 'video':
            setVideoEnabled(message.enabled);
            break;
          case 'audio':
            setAudioEnabled(message.enabled);
            break;
          // Add more message types as needed
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    };
    
    // Set up message handlers for all data channels
    Object.values(dataChannels.current).forEach(dc => {
      dc.onmessage = handleMessage;
    });
    
    return () => {
      // Clean up message handlers
      Object.values(dataChannels.current).forEach(dc => {
        dc.onmessage = null;
      });
    };
  }, []);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (screenShareStream.current) {
          screenShareStream.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
          screenShareStream.current = null;
        }
        // Restore camera
        if (localStream) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          setLocalStream(stream);
        }
      } else {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        screenShareStream.current = stream;
        setLocalStream(stream);
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error('Error toggling screen share:', error);
      showNotification({
        title: 'Error',
        message: 'Could not share screen',
        color: 'red',
      });
    }
  }, [isScreenSharing, localStream]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenShareStream.current) {
        screenShareStream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return (
    <StreamContext.Provider
      value={{
        localStream,
        participants,
        isStreaming,
        isConnected,
        isHost,
        startStream,
        stopStream,
        connectToPeer,
        disconnectFromPeer,
        addParticipant,
        removeParticipant,
        toggleVideo,
        toggleAudio,
        toggleScreenShare,
        videoEnabled,
        audioEnabled,
        isScreenSharing,
        getLocalStream,
      }}
    >
      {children}
    </StreamContext.Provider>
  );
}

// Export the context
export { StreamContext };

// useStream hook
export function useStream() {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error(
      'useStream must be used within a StreamProvider. ' +
      'Make sure you have a StreamProvider higher up in your component tree.'
    );
  }
  return context;
}

export default StreamProvider;
