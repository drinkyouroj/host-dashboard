import { useState, useCallback } from 'react';
import { Container, Title, Grid, Paper, Text, Button, Group } from '@mantine/core';
import { CallerList } from '../components/callers/CallerList';
import { CallerDetails } from '../components/callers/CallerDetails';
import type { Caller } from '../contexts/ShowContext';
import type { UICaller } from '../types/caller';

// Helper function to convert Caller to UICaller
const toUICaller = (caller: Caller): UICaller => {
  const statusMap = {
    'live': 'On Air',
    'waiting': 'Waiting',
    'rejected': 'Rejected'
  } as const;

  const status: 'live' | 'waiting' | 'rejected' = 
    (caller.status === 'live' || caller.status === 'waiting' || caller.status === 'rejected')
      ? caller.status
      : 'waiting';

  return {
    ...caller,
    phoneNumber: caller.phone || 'Unknown',
    waitTime: Math.floor((new Date().getTime() - new Date(caller.joinedAt).getTime()) / 60000),
    displayStatus: statusMap[status] || status,
    isMuted: false,
    isPriority: false,
    notes: ''
  };
};

// Mock data for testing
const mockCallers: Caller[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+1 (555) 123-4567',
    status: 'waiting',
    joinedAt: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '+1 (555) 987-6543',
    status: 'waiting',
    joinedAt: new Date(Date.now() - 2 * 60 * 1000)
  },
  {
    id: '3',
    name: 'Robert Johnson',
    phone: '+1 (555) 456-7890',
    status: 'live',
    joinedAt: new Date(Date.now() - 10 * 60 * 1000)
  }
];

export function CallersTestPage() {
  const [callers, setCallers] = useState<UICaller[]>(mockCallers.map(toUICaller));
  const [selectedCaller, setSelectedCaller] = useState<UICaller | null>(null);

  const handleSelectCaller = useCallback((caller: UICaller) => {
    setSelectedCaller(caller);
  }, []);

  const handleMuteToggle = useCallback((callerId: string, isMuted: boolean) => {
    setCallers(prevCallers => 
      prevCallers.map(caller => 
        caller.id === callerId 
          ? { ...caller, isMuted }
          : caller
      )
    );
    
    if (selectedCaller?.id === callerId) {
      setSelectedCaller(prev => prev ? { ...prev, isMuted } : null);
    }
  }, [selectedCaller]);

  const handlePromoteToLive = useCallback((callerId: string) => {
    setCallers(prev => 
      prev.map(caller => {
        if (caller.id === callerId) {
          // Promote the selected caller to live
          return { 
            ...caller, 
            status: 'live' as const, 
            displayStatus: 'On Air' 
          };
        } else if (caller.status === 'live') {
          // Demote any other live caller to waiting
          return { 
            ...caller, 
            status: 'waiting' as const, 
            displayStatus: 'Waiting' 
          };
        }
        return caller;
      })
    );
    
    // Update the selected caller if it's the one being promoted
    setSelectedCaller(prev => {
      if (!prev) return null;
      if (prev.id === callerId) {
        return { 
          ...prev, 
          status: 'live' as const, 
          displayStatus: 'On Air' 
        };
      }
      return prev;
    });
    
    // In a real app, this would connect the caller to the live show
    console.log(`Promoted caller ${callerId} to live`);
  }, [selectedCaller]);

  const handleTakeOffAir = useCallback((callerId: string) => {
    setCallers(prev => 
      prev.map(c => 
        c.id === callerId ? { ...c, status: 'waiting' } : c
      )
    );
    setSelectedCaller(null);
  }, []);

  const handleEndCall = useCallback((callerId: string) => {
    setCallers(prev => prev.filter(c => c.id !== callerId));
    setSelectedCaller(null);
  }, []);

  const handlePriorityToggle = useCallback((callerId: string, isPriority: boolean) => {
    setCallers(prev => 
      prev.map(caller => 
        caller.id === callerId 
          ? { ...caller, isPriority }
          : caller
      )
    );
    
    if (selectedCaller?.id === callerId) {
      setSelectedCaller(prev => prev ? { ...prev, isPriority } : null);
    }
    
    console.log(`Caller ${callerId} priority set to: ${isPriority}`);
  }, [selectedCaller]);

  const handleAddNote = (callerId: string, note: string) => {
    setCallers(prev => 
      prev.map(caller => 
        caller.id === callerId 
          ? { ...caller, notes: note }
          : caller
      )
    );
    
    if (selectedCaller?.id === callerId) {
      setSelectedCaller(prev => prev ? { ...prev, notes: note } : null);
    }
    
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
              onPriorityToggle={handlePriorityToggle}
              onPromoteToLive={handlePromoteToLive}
              onTakeOffAir={handleTakeOffAir}
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
