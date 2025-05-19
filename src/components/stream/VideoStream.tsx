import { useState, useRef, useEffect } from 'react';
import { Box, Button, Group, Stack, Text, Paper } from '@mantine/core';
import { IconCamera, IconCameraOff, IconMicrophone, IconMicrophoneOff, IconScreenShare, IconScreenShareOff } from '@tabler/icons-react';

interface VideoStreamProps {
  isHost?: boolean;
  participantName: string;
  onMediaChange?: (constraints: MediaStreamConstraints) => void;
  className?: string;
  stream?: MediaStream | null;
  muted?: boolean;
  autoPlay?: boolean;
}

export function VideoStream({ 
  isHost = false, 
  participantName, 
  onMediaChange, 
  className = '',
  stream: externalStream,
  muted = false,
  autoPlay = true
}: VideoStreamProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<MediaStream | null>(null);

  // Use external stream if provided, otherwise use local stream
  const stream = externalStream || localStream;

  // Initialize media stream if no external stream is provided
  useEffect(() => {
    if (externalStream) return;

    const enableStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        setLocalStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        if (onMediaChange) {
          onMediaChange({ video: true, audio: true });
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
      }
    };

    enableStream();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenShareRef.current) {
        screenShareRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [externalStream]);

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = screenSharing && screenShareRef.current 
        ? screenShareRef.current 
        : stream;
    }
  }, [stream, screenSharing]);

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (screenSharing) {
        // Stop screen sharing
        if (screenShareRef.current) {
          screenShareRef.current.getTracks().forEach(track => track.stop());
          screenShareRef.current = null;
        }
        // Restore camera if we have a local stream
        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.enabled = true;
            setVideoEnabled(true);
          }
        }
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });

        // Pause camera if we have a local stream
        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.enabled = false;
          }
        }

        screenShareRef.current = screenStream;
        
        // Handle screen share ending
        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
      }
      setScreenSharing(!screenSharing);
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };

  if (!stream && !externalStream) {
    return (
      <Paper withBorder radius="md" p="md" className={className}>
        <Text>Loading video...</Text>
      </Paper>
    );
  }

  return (
    <Stack gap="xs" className={className}>
      <Paper withBorder radius="md" p="xs" style={{ position: 'relative', paddingTop: '56.25%' }}>
        <Box 
          component="video" 
          ref={videoRef} 
          autoPlay={autoPlay}
          playsInline 
          muted={muted}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '8px',
            backgroundColor: '#1a1b1e',
          }}
        />
        <Box 
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {participantName} {isHost ? '(Host)' : ''}
        </Box>
      </Paper>
      
      <Group justify="center" gap="xs">
        <Button 
          variant={videoEnabled ? 'filled' : 'outline'} 
          size="sm" 
          leftSection={videoEnabled ? <IconCamera size={16} /> : <IconCameraOff size={16} />}
          onClick={toggleVideo}
          disabled={screenSharing || !!externalStream}
        >
          {videoEnabled ? 'Camera On' : 'Camera Off'}
        </Button>
        
        <Button 
          variant={audioEnabled ? 'filled' : 'outline'} 
          size="sm" 
          color="red"
          leftSection={audioEnabled ? <IconMicrophone size={16} /> : <IconMicrophoneOff size={16} />}
          onClick={toggleAudio}
          disabled={!!externalStream}
        >
          {audioEnabled ? 'Mute' : 'Unmute'}
        </Button>
        
        {isHost && !externalStream && (
          <Button 
            variant={screenSharing ? 'filled' : 'outline'} 
            size="sm" 
            color="violet"
            leftSection={screenSharing ? <IconScreenShareOff size={16} /> : <IconScreenShare size={16} />}
            onClick={toggleScreenShare}
          >
            {screenSharing ? 'Stop Sharing' : 'Share Screen'}
          </Button>
        )}
      </Group>
    </Stack>
  );
}
