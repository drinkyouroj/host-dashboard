import { Box, Grid, Paper, Stack, Text, Group, ActionIcon, Tooltip, Badge } from '@mantine/core';
import { VideoStream } from './VideoStream';
import { useStream } from '../../contexts/stream/StreamContext';
import { 
  IconScreenShare, 
  IconScreenShareOff, 
  IconMicrophone, 
  IconMicrophoneOff, 
  IconVideo, 
  IconVideoOff,
  IconBroadcastOff,
  IconBroadcast
} from '@tabler/icons-react';
import { useCallback, useState } from 'react';

interface StreamViewProps {
  isHost?: boolean;
  className?: string;
  showControls?: boolean;
  onStreamStart?: () => void;
  onStreamStop?: () => void;
}

export function StreamView({ 
  isHost = false, 
  className = '',
  showControls = true,
  onStreamStart,
  onStreamStop
}: StreamViewProps) {
  const { 
    participants, 
    videoEnabled, 
    audioEnabled, 
    isScreenSharing,
    isStreaming,
    isConnected,
    startStream,
    stopStream,
    toggleVideo,
    toggleAudio,
    toggleScreenShare
  } = useStream();

  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  // Handle stream start/stop
  const handleStartStream = useCallback(async () => {
    try {
      setIsStarting(true);
      await startStream();
      onStreamStart?.();
    } catch (error) {
      console.error('Failed to start stream:', error);
    } finally {
      setIsStarting(false);
    }
  }, [startStream, onStreamStart]);

  const handleStopStream = useCallback(async () => {
    try {
      setIsStopping(true);
      stopStream();
      onStreamStop?.();
    } catch (error) {
      console.error('Failed to stop stream:', error);
    } finally {
      setIsStopping(false);
    }
  }, [stopStream, onStreamStop]);

  // Filter out the local participant from the remote participants
  const remoteParticipants = participants.filter(p => p.id !== 'local');
  const hostParticipant = participants.find(p => p.isHost);
  const localParticipant = participants.find(p => p.id === 'local');

  // If there's a host broadcasting, show them in the main view
  const mainParticipant = hostParticipant || (remoteParticipants.length > 0 ? remoteParticipants[0] : null);

  // Show connection status badge
  const renderStatusBadge = () => (
    <Badge 
      color={isConnected ? 'green' : 'red'} 
      variant="light" 
      size="sm"
      style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
    >
      {isConnected ? 'Live' : 'Offline'}
    </Badge>
  );

  // Render control buttons
  const renderControls = () => (
    <Group 
      gap="xs" 
      style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '6px 12px',
        borderRadius: '20px',
        backdropFilter: 'blur(4px)'
      }}
    >
      {isStreaming ? (
        <>
          <Tooltip label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}>
            <ActionIcon
              variant={videoEnabled ? 'filled' : 'default'}
              color={videoEnabled ? 'blue' : 'gray'}
              onClick={() => toggleVideo(!videoEnabled)}
              size="lg"
            >
              {videoEnabled ? <IconVideo size={20} /> : <IconVideoOff size={20} />}
            </ActionIcon>
          </Tooltip>
          
          <Tooltip label={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}>
            <ActionIcon
              variant={audioEnabled ? 'filled' : 'default'}
              color={audioEnabled ? 'blue' : 'gray'}
              onClick={() => toggleAudio(!audioEnabled)}
              size="lg"
            >
              {audioEnabled ? <IconMicrophone size={20} /> : <IconMicrophoneOff size={20} />}
            </ActionIcon>
          </Tooltip>
          
          <Tooltip label={isScreenSharing ? 'Stop sharing' : 'Share screen'}>
            <ActionIcon
              variant={isScreenSharing ? 'filled' : 'default'}
              color={isScreenSharing ? 'red' : 'gray'}
              onClick={toggleScreenShare}
              size="lg"
            >
              {isScreenSharing ? <IconScreenShareOff size={20} /> : <IconScreenShare size={20} />}
            </ActionIcon>
          </Tooltip>
          
          <Tooltip label="End stream">
            <ActionIcon
              variant="filled"
              color="red"
              onClick={handleStopStream}
              loading={isStopping}
              size="lg"
            >
              <IconBroadcastOff size={20} />
            </ActionIcon>
          </Tooltip>
        </>
      ) : (
        <Tooltip label="Start stream">
          <ActionIcon
            variant="filled"
            color="green"
            onClick={handleStartStream}
            loading={isStarting}
            size="lg"
          >
            <IconBroadcast size={20} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );

  return (
    <Stack gap="md" style={{ position: 'relative' }} className={className}>
      {/* Main video area */}
      <Paper 
        withBorder 
        radius="md" 
        style={{ 
          position: 'relative',
          overflow: 'hidden',
          aspectRatio: '16/9',
          backgroundColor: '#1a1b1e',
        }}
      >
        {mainParticipant ? (
          <>
            <VideoStream
              stream={mainParticipant.stream}
              participantName={mainParticipant.name}
              isHost={mainParticipant.isHost}
              muted={mainParticipant.id === 'local'}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {renderStatusBadge()}
            {showControls && renderControls()}
          </>
        ) : (
          <Box style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            minHeight: '400px',
            color: 'white',
            textAlign: 'center',
            padding: '20px',
          }}>
            <Text>No active stream. The host will appear here when they go live.</Text>
          </Box>
        )}
      </Paper>
      
      {/* Participants grid */}
      {remoteParticipants.length > 0 && (
        <Grid mt="md" gutter="md">
          {remoteParticipants.map((participant) => (
            <Grid.Col key={participant.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <VideoStream
                stream={participant.stream}
                participantName={participant.name}
                isHost={participant.isHost}
                muted={false}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  objectFit: 'cover',
                }}
              />
            </Grid.Col>
          ))}
        </Grid>
      )}
      
      {/* Local participant (if exists) */}
      {localParticipant && (
        <Paper withBorder radius="md" p="md">
          <Text size="lg" fw={500} mb="sm">Your Stream</Text>
          <VideoStream
            stream={localParticipant.stream}
            participantName={localParticipant.name}
            isHost={isHost}
            muted={true}
            autoPlay
            playsInline
            style={{
              width: '100%',
              aspectRatio: '16/9',
              objectFit: 'cover',
            }}
          />
        </Paper>
      )}
    </Stack>
  );
}
