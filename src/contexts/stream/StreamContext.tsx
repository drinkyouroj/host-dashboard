import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { showNotification } from '@mantine/notifications';

type Participant = {
  id: string;
  name: string;
  stream: MediaStream | null;
  isHost: boolean;
};

interface StreamContextType {
  localStream: MediaStream | null;
  participants: Participant[];
  isStreaming: boolean;
  startStream: () => Promise<void>;
  stopStream: () => void;
  addParticipant: (id: string, name: string, stream: MediaStream, isHost?: boolean) => void;
  removeParticipant: (id: string) => void;
  toggleVideo: (enabled: boolean) => void;
  toggleAudio: (enabled: boolean) => void;
  toggleScreenShare: () => Promise<void>;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isScreenSharing: boolean;
}

const StreamContext = createContext<StreamContextType | null>(null);

export function StreamProvider({ children, isHost = false }: { children: ReactNode; isHost?: boolean }) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenShareStream = useRef<MediaStream | null>(null);

  // Initialize local stream
  const initializeLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      
      if (isHost) {
        // Add host as a participant
        setParticipants(prev => [
          ...prev.filter(p => p.id !== 'local'),
          { id: 'local', name: 'Host', stream, isHost: true }
        ]);
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      showNotification({
        title: 'Error',
        message: 'Could not access camera or microphone',
        color: 'red',
      });
      return null;
    }
  }, [isHost]);

  // Start streaming
  const startStream = useCallback(async () => {
    if (isStreaming) return;
    
    const stream = localStream || await initializeLocalStream();
    if (!stream) return;
    
    setIsStreaming(true);
    // In a real app, you would connect to your WebRTC server here
    // and set up peer connections with other participants
  }, [isStreaming, localStream, initializeLocalStream]);

  // Stop streaming
  const stopStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenShareStream.current) {
      screenShareStream.current.getTracks().forEach(track => track.stop());
      screenShareStream.current = null;
    }
    setLocalStream(null);
    setParticipants(prev => prev.filter(p => p.id === 'local'));
    setIsStreaming(false);
    setVideoEnabled(false);
    setAudioEnabled(false);
    setIsScreenSharing(false);
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback((enabled: boolean) => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
      setVideoEnabled(enabled);
    }
  }, [localStream]);

  // Toggle audio
  const toggleAudio = useCallback((enabled: boolean) => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      setAudioEnabled(enabled);
    }
  }, [localStream]);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (screenShareStream.current) {
          screenShareStream.current.getTracks().forEach(track => track.stop());
          screenShareStream.current = null;
        }
        // Restore camera
        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.enabled = true;
          }
        }
      } else {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });

        // Pause camera
        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.enabled = false;
          }
        }

        screenShareStream.current = stream;
        
        // Handle screen share ending
        stream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  }, [isScreenSharing, localStream]);

  // Add participant
  const addParticipant = useCallback((id: string, name: string, stream: MediaStream, isHost = false) => {
    setParticipants(prev => [
      ...prev.filter(p => p.id !== id),
      { id, name, stream, isHost }
    ]);
  }, []);

  // Remove participant
  const removeParticipant = useCallback((id: string) => {
    setParticipants(prev => {
      const participant = prev.find(p => p.id === id);
      if (participant?.stream) {
        participant.stream.getTracks().forEach(track => track.stop());
      }
      return prev.filter(p => p.id !== id);
    });
  }, []);

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
        startStream,
        stopStream,
        addParticipant,
        removeParticipant,
        toggleVideo,
        toggleAudio,
        toggleScreenShare,
        videoEnabled,
        audioEnabled,
        isScreenSharing,
      }}
    >
      {children}
    </StreamContext.Provider>
  );
}

export const useStream = () => {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error('useStream must be used within a StreamProvider');
  }
  return context;
};
