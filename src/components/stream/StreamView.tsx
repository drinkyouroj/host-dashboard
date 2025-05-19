import { Box, Grid, Paper, Stack, Text } from '@mantine/core';
import { VideoStream } from './VideoStream';
import { useStream } from '../../contexts/stream/StreamContext';

interface StreamViewProps {
  isHost?: boolean;
  className?: string;
}

export function StreamView({ isHost = false, className = '' }: StreamViewProps) {
  const { 
    localStream, 
    participants, 
    videoEnabled, 
    audioEnabled, 
    isScreenSharing,
    toggleVideo,
    toggleAudio,
    toggleScreenShare
  } = useStream();

  // Filter out the local participant from the remote participants
  const remoteParticipants = participants.filter(p => p.id !== 'local');
  const hostParticipant = participants.find(p => p.isHost);
  const localParticipant = participants.find(p => p.id === 'local');

  // If there's a host broadcasting, show them in the main view
  const mainParticipant = hostParticipant || (remoteParticipants.length > 0 ? remoteParticipants[0] : null);

  return (
    <Stack spacing="md" className={className}>
      {/* Main video area */}
      <Paper withBorder radius="md" p="md" style={{ flex: 1, minHeight: '60vh' }}>
        {mainParticipant ? (
          <VideoStream
            stream={mainParticipant.stream}
            participantName={mainParticipant.name}
            isHost={mainParticipant.isHost}
            muted={mainParticipant.id === 'local'}
          />
        ) : (
          <Box style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            minHeight: '400px',
            backgroundColor: '#1a1b1e',
            borderRadius: '8px',
            color: 'white',
          }}>
            <Text>No active stream. The host will appear here when they go live.</Text>
          </Box>
        )}
      </Paper>

      {/* Local participant (if exists) */}
      {localParticipant && (
        <Paper withBorder radius="md" p="md">
          <Text size="sm" weight={500} mb="sm">Your Camera</Text>
          <VideoStream
            stream={localStream}
            participantName="You"
            muted={true}
            autoPlay={true}
          />
        </Paper>
      )}

      {/* Other participants grid */}
      {remoteParticipants.length > 1 && (
        <>
          <Text size="sm" weight={500}>Other Participants ({remoteParticipants.length - 1})</Text>
          <Grid>
            {remoteParticipants
              .filter(p => p !== mainParticipant)
              .map(participant => (
                <Grid.Col key={participant.id} span={12} md={6} lg={4}>
                  <VideoStream
                    stream={participant.stream}
                    participantName={participant.name}
                    muted={participant.id === 'local'}
                  />
                </Grid.Col>
              ))}
          </Grid>
        </>
      )}
    </Stack>
  );
}
