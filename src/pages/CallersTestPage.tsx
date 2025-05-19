import { useState } from 'react';
import { Container, Title, Grid, Paper, Text, Button } from '@mantine/core';
import { CallerList, Caller } from '../components/callers/CallerList';
import { CallerDetails } from '../components/callers/CallerDetails';

// Mock data for testing
const mockCallers: Caller[] = [
  {
    id: '1',
    name: 'John Doe',
    phoneNumber: '+1 (555) 123-4567',
    status: 'waiting',
    waitTime: 5,
    isPriority: true,
    notes: 'Regular caller, interested in topic #3',
  },
  {
    id: '2',
    name: 'Jane Smith',
    phoneNumber: '+1 (555) 987-6543',
    status: 'waiting',
    waitTime: 2,
    notes: 'First-time caller',
  },
  {
    id: '3',
    name: 'Robert Johnson',
    phoneNumber: '+1 (555) 456-7890',
    status: 'on-air',
    waitTime: 10,
    isMuted: false,
    notes: 'Expert on today\'s topic',
  },
];

export function CallersTestPage() {
  const [callers, setCallers] = useState<Caller[]>(mockCallers);
  const [selectedCaller, setSelectedCaller] = useState<Caller | null>(null);

  const handleSelectCaller = (caller: Caller) => {
    setSelectedCaller(caller);
  };

  const handleMuteToggle = (callerId: string, isMuted: boolean) => {
    setCallers(callers.map(caller => 
      caller.id === callerId ? { ...caller, isMuted } : caller
    ));
    
    if (selectedCaller?.id === callerId) {
      setSelectedCaller({ ...selectedCaller, isMuted });
    }
    
    // In a real app, this would call your API to update the mute status
    console.log(`Caller ${callerId} muted: ${isMuted}`);
  };

  const handlePromoteToLive = (callerId: string) => {
    setCallers(callers.map(caller => 
      caller.id === callerId 
        ? { ...caller, status: 'on-air' as const }
        : caller.status === 'on-air' 
          ? { ...caller, status: 'waiting' as const }
          : caller
    ));
    
    const promotedCaller = callers.find(c => c.id === callerId);
    if (promotedCaller) {
      setSelectedCaller({ ...promotedCaller, status: 'on-air' });
    }
    
    // In a real app, this would connect the caller to the live show
    console.log(`Promoted caller ${callerId} to live`);
  };

  const handleEndCall = (callerId: string) => {
    setCallers(callers.map(caller => 
      caller.id === callerId 
        ? { ...caller, status: 'completed' as const }
        : caller
    ));
    
    if (selectedCaller?.id === callerId) {
      setSelectedCaller({ ...selectedCaller, status: 'completed' });
    }
    
    // In a real app, this would end the call
    console.log(`Ended call with ${callerId}`);
  };

  const handleAddNote = (callerId: string, note: string) => {
    const updatedCallers = callers.map(caller => 
      caller.id === callerId 
        ? { ...caller, notes: note }
        : caller
    );
    
    setCallers(updatedCallers);
    
    if (selectedCaller?.id === callerId) {
      setSelectedCaller({ ...selectedCaller, notes: note });
    }
    
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
