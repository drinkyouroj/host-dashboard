import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Client, Conference, type IConferenceOptions } from '@datagram-network/conference-sdk';
import { useShow } from './ShowContext';
import { useAuth } from './AuthContext';

interface StreamContextType {
  isConnected: boolean;
  localStream: MediaStream | null;
  startStream: () => Promise<void>;
  stopStream: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  isMuted: boolean;
  isCameraOff: boolean;
  addGuest: (guestId: string) => Promise<void>;
  removeGuest: (guestId: string) => void;
}

const StreamContext = createContext<StreamContextType | null>(null);

export function StreamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { currentShow, addCaller } = useShow();
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const conferenceRef = useRef<Conference | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Datagram client
  useEffect(() => {
    if (!user || !currentShow) return;

    const initClient = async () => {
      try {
        // Create client with show ID as the room alias
        clientRef.current = Client.create({
          alias: `show-${currentShow.id}`,
          origin: process.env.REACT_APP_DATAGRAM_ORIGIN || window.location.origin,
        });

        // Initialize conference with default options
        const options: IConferenceOptions = {
          skipMediaSettings: true,
          turnOnMic: true,
          turnOnCam: true,
          metadata: {
            title: currentShow.name,
          },
        };

        conferenceRef.current = new Conference(clientRef.current, options);

        // Set up event listeners
        window.addEventListener('message', handleConferenceMessage);

        return () => {
          window.removeEventListener('message', handleConferenceMessage);
          stopStream();
        };
      } catch (error) {
        console.error('Failed to initialize Datagram client:', error);
      }
    };

    initClient();

    return () => {
      if (conferenceRef.current) {
        conferenceRef.current.dispose();
        conferenceRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current = null;
      }
    };
  }, [currentShow, user]);

  const handleConferenceMessage = (event: MessageEvent) => {
    if (!event.data) return;

    switch (event.data) {
      case 'call_ended':
        console.log('Call ended');
        setIsConnected(false);
        break;
      case 'call-ready':
        console.log('Call is ready');
        setIsConnected(true);
        break;
      case 'invalid_qr_code':
        console.error('Invalid or expired QR code');
        break;
      case 'conference-ready':
        console.log('Conference is ready');
        break;
      default:
        // Handle custom messages if needed
        break;
    }
  };

  const startStream = async () => {
    try {
      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      setLocalStream(stream);

      // Mount the conference to a hidden container
      const container = document.createElement('div');
      container.style.display = 'none';
      document.body.appendChild(container);

      if (conferenceRef.current) {
        await conferenceRef.current.mount(container);
      }

      // Apply initial mute/camera state
      toggleMute(true, true);
      toggleCamera(true, true);

    } catch (error) {
      console.error('Failed to start stream:', error);
      throw error;
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setLocalStream(null);
    }
    
    if (conferenceRef.current) {
      conferenceRef.current.dispose();
      conferenceRef.current = null;
    }
    
    setIsConnected(false);
  };

  const toggleMute = (forceState?: boolean, initialSetup = false) => {
    const shouldMute = forceState !== undefined ? forceState : !isMuted;
    
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !shouldMute;
      });
    }
    
    if (!initialSetup) {
      setIsMuted(shouldMute);
    }
  };

  const toggleCamera = (forceState?: boolean, initialSetup = false) => {
    const shouldTurnOff = forceState !== undefined ? forceState : !isCameraOff;
    
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !shouldTurnOff;
      });
    }
    
    if (!initialSetup) {
      setIsCameraOff(shouldTurnOff);
    }
  };

  const addGuest = async (guestId: string) => {
    if (!conferenceRef.current) {
      console.error('Conference not initialized');
      return;
    }

    try {
      // In a real app, you would generate a unique URL for the guest to join
      const guestUrl = `${window.location.origin}/guest/${guestId}`;
      
      // Here you would typically send this URL to the guest via your backend
      console.log('Guest join URL:', guestUrl);
      
      // Add to your show's caller list
      addCaller({
        id: guestId,
        name: `Guest ${guestId.slice(0, 6)}`,
        status: 'waiting',
        joinedAt: new Date(),
      });
      
    } catch (error) {
      console.error('Failed to add guest:', error);
      throw error;
    }
  };

  const removeGuest = (guestId: string) => {
    // In a real app, you would disconnect the guest from the conference
    console.log(`Removing guest ${guestId} from the conference`);
  };

  return (
    <StreamContext.Provider
      value={{
        isConnected,
        localStream,
        startStream,
        stopStream,
        toggleMute: () => toggleMute(),
        toggleCamera: () => toggleCamera(),
        isMuted,
        isCameraOff,
        addGuest,
        removeGuest,
      }}
    >
      {children}
    </StreamContext.Provider>
  );
}

export function useStream() {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error('useStream must be used within a StreamProvider');
  }
  return context;
}
