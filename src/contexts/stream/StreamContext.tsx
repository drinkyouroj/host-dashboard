import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
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
    } catch (error) {
      console.error('Error accessing media devices:', error);
      showNotification({
        title: 'Error',
        message: 'Could not access camera or microphone',
        color: 'red',
      });
    }
  }, [isHost]);

  // Start streaming
  const startStream = useCallback(async () => {
    if (!localStream) {
      await initializeLocalStream();
    }
    setIsStreaming(true);
  }, [localStream, initializeLocalStream]);

  // Stop streaming
  const stopStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    if (screenShareStream.current) {
      screenShareStream.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      screenShareStream.current = null;
    }
    setLocalStream(null);
    setParticipants(prev => prev.filter(p => p.id === 'local'));
    setIsStreaming(false);
    setVideoEnabled(false);
    setAudioEnabled(false);
    setIsScreenSharing(false);
  }, [localStream]);

  // Add a participant
  const addParticipant = useCallback((id: string, name: string, stream: MediaStream, isHost = false) => {
    setParticipants(prev => [
      ...prev.filter(p => p.id !== id),
      { id, name, stream, isHost }
    ]);
  }, []);

  // Remove a participant
  const removeParticipant = useCallback((id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  }, []);

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

export function useStream() {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error('useStream must be used within a StreamProvider');
  }
  return context;
}
