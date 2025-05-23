import { Container, Title, Paper, Text, Button, Stack, TextInput, Box, Group } from '@mantine/core';
import { useEffect, useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { StreamView } from '../components/stream/StreamView';
import { StreamProvider } from '../contexts/stream/StreamContext';

export function GuestView() {
  const { showId } = useParams<{ showId: string }>();
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = () => {
    if (!name.trim()) return;
    setIsLoading(true);
    
    // In a real app, you would connect to the WebRTC server here
    // and join the show with the given ID
    setTimeout(() => {
      setJoined(true);
      setIsLoading(false);
    }, 1000);
  };

  if (!joined) {
    return (
      <Container size="sm" py="xl">
        <Paper p="xl" radius="md" withBorder>
          <Stack gap="md">
            <Title order={2} ta="center">Join Show</Title>
            <Text c="dimmed" ta="center">
              You're about to join the show as a guest
            </Text>
            
            <TextInput
              label="Your Name"
              placeholder="Enter your name"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
            />
            
            <Button 
              onClick={handleJoin} 
              loading={isLoading}
              fullWidth
              size="lg"
              mt="md"
            >
              Join Show
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <StreamProvider>
      <Container fluid p={0} style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box p="md" style={{ borderBottom: '1px solid #e9ecef' }}>
          <Group justify="space-between">
            <Title order={3}>Live Show</Title>
            <Button variant="outline" onClick={() => setJoined(false)}>
              Leave Show
            </Button>
          </Group>
        </Box>
        
        <Box style={{ flex: 1, overflow: 'auto' }}>
          <StreamView />
        </Box>
      </Container>
    </StreamProvider>
  );
}
