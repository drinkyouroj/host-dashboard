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
  playsInline?: boolean;
  style?: React.CSSProperties;
}

export function VideoStream({ 
  isHost = false, 
  participantName, 
  onMediaChange, 
  className = '',
  stream: externalStream,
  muted = false,
  autoPlay = true,
  playsInline = true,
  style = {}
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
    <Paper withBorder p="md" className={className} style={style}>
      <Box style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', backgroundColor: '#1a1b1e', borderRadius: '8px', overflow: 'hidden' }}>
        <video
          ref={videoRef}
          autoPlay={autoPlay}
          playsInline={playsInline}
          muted={muted}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            backgroundColor: '#1a1b1e',
            transform: videoEnabled ? 'none' : 'scaleX(-1)',
            ...style
          }}
        />
        <Box 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '8px',
            background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text size="sm" fw={500}>
            {participantName} {isHost && '(You)'}
          </Text>
          <Group gap="xs">
            {!videoEnabled && (
              <Box style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px' }}>
                <IconCameraOff size={16} />
              </Box>
            )}
            {!audioEnabled && (
              <Box style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px' }}>
                <IconMicrophoneOff size={16} />
              </Box>
            )}
          </Group>
        </Box>
      </Box>
      
      {onMediaChange && (
        <Group mt="xs" justify="center" gap="xs">
          <Button
            variant={videoEnabled ? 'filled' : 'outline'}
            size="xs"
            leftSection={videoEnabled ? <IconCamera size={16} /> : <IconCameraOff size={16} />}
            onClick={() => {
              const newState = !videoEnabled;
              setVideoEnabled(newState);
              onMediaChange({ video: newState, audio: audioEnabled });
            }}
          >
            {videoEnabled ? 'Camera On' : 'Camera Off'}
          </Button>
          <Button
            variant={audioEnabled ? 'filled' : 'outline'}
            size="xs"
            leftSection={audioEnabled ? <IconMicrophone size={16} /> : <IconMicrophoneOff size={16} />}
            onClick={() => {
              const newState = !audioEnabled;
              setAudioEnabled(newState);
              onMediaChange({ video: videoEnabled, audio: newState });
            }}
          >
            {audioEnabled ? 'Mute' : 'Unmute'}
          </Button>
          <Button
            variant={screenSharing ? 'filled' : 'outline'}
            color={screenSharing ? 'red' : undefined}
            size="xs"
            leftSection={screenSharing ? <IconScreenShareOff size={16} /> : <IconScreenShare size={16} />}
            onClick={toggleScreenShare}
          >
            {screenSharing ? 'Stop Sharing' : 'Share Screen'}
          </Button>
        </Group>
      )}
    </Paper>
  );
}
