import { useState } from 'react';
import { Container, Title, Grid, Paper, Text, Button, Group } from '@mantine/core';
import { CallerList } from '../components/callers/CallerList';
import { CallerDetails } from '../components/callers/CallerDetails';
import type { Caller } from '../contexts/ShowContext';

// Mock data for testing
const mockCallers: Caller[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+1 (555) 123-4567',
    status: 'waiting',
    joinedAt: new Date(Date.now() - 5 * 60 * 1000),
    notes: 'Regular caller, interested in topic #3'
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '+1 (555) 987-6543',
    status: 'waiting',
    joinedAt: new Date(Date.now() - 2 * 60 * 1000),
    notes: 'First-time caller'
  },
  {
    id: '3',
    name: 'Robert Johnson',
    phone: '+1 (555) 456-7890',
    status: 'live',
    joinedAt: new Date(Date.now() - 10 * 60 * 1000),
    notes: 'Expert on today\'s topic'
  }
];

export function CallersTestPage() {
  const [callers, setCallers] = useState<Caller[]>(mockCallers);
  const [selectedCaller, setSelectedCaller] = useState<Caller | null>(null);

  const handleSelectCaller = (caller: Caller) => {
    setSelectedCaller(caller);
  };

  const handleMuteToggle = (callerId: string, isMuted: boolean) => {
    // In a real app, this would call your API to update the mute status
    console.log(`Caller ${callerId} muted: ${isMuted}`);
    
    // In a real app, this would call your API to update the mute status
    console.log(`Caller ${callerId} muted: ${isMuted}`);
  };

  const handlePromoteToLive = (callerId: string) => {
    setCallers(callers.map(caller => {
      if (caller.id === callerId) {
        return { ...caller, status: 'live' as const };
      } else if (caller.status === 'live') {
        return { ...caller, status: 'waiting' as const };
      }
      return caller;
    }));
    
    const promotedCaller = callers.find(c => c.id === callerId);
    if (promotedCaller) {
      setSelectedCaller({ ...promotedCaller, status: 'live' });
    }
    
    // In a real app, this would connect the caller to the live show
    console.log(`Promoted caller ${callerId} to live`);
  };

  const handleEndCall = (callerId: string) => {
    setCallers(callers.map(caller => 
      caller.id === callerId 
        ? { ...caller, status: 'rejected' as const }
        : caller
    ));
    
    if (selectedCaller?.id === callerId) {
      setSelectedCaller({ ...selectedCaller, status: 'rejected' });
    }
    
    // In a real app, this would end the call
    console.log(`Ended call with ${callerId}`);
  };

  const handleAddNote = (callerId: string, note: string) => {
    // In a real app, this would save the note to your backend
    console.log(`Added note to caller ${callerId}: ${note}`);
    
    // In a real app, this would save the note to your backend
    console.log(`Added note to caller ${callerId}: ${note}`);
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl">Caller Management</Title>
      
      <Grid>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper p="md" withBorder h="100%">
            <Group justify="space-between" mb="md">
              <Text fw={600}>Call Queue</Text>
              <Text size="sm" c="dimmed">{callers.filter(c => c.status === 'waiting').length} waiting</Text>
            </Group>
            <CallerList 
              callers={callers}
              onSelectCaller={handleSelectCaller}
              onMuteToggle={handleMuteToggle}
              onPromoteToLive={handlePromoteToLive}
              onEndCall={handleEndCall}
            />
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper p="md" withBorder h="100%">
            <Text fw={600} mb="md">Caller Details</Text>
            <CallerDetails
              caller={selectedCaller}
              onMuteToggle={handleMuteToggle}
              onPromoteToLive={handlePromoteToLive}
              onEndCall={handleEndCall}
              onAddNote={handleAddNote}
            />
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default CallersTestPage;
