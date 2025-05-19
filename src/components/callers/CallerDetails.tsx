import { useState } from 'react';
import { Box, Text, Paper, Group, Avatar, Badge, Stack, Textarea, Button, Divider } from '@mantine/core';
import { IconPhone, IconPhoneOff, IconVolume, IconVolumeOff, IconStar, IconUserPlus, IconNote } from '@tabler/icons-react';
import type { Caller } from '../../contexts/ShowContext';

// Types for UI representation
type UICallerStatus = 'waiting' | 'on-air' | 'completed' | 'rejected';

// Base interface for both Caller and UICaller
type BaseCaller = Omit<Caller, 'status'> & {
  status: Caller['status'] | UICallerStatus;
  phoneNumber?: string;
  waitTime?: number;
  isMuted?: boolean;
  isPriority?: boolean;
  notes?: string;
};

interface CallerDetailsProps {
  caller: BaseCaller | null;
  onMuteToggle: (callerId: string, isMuted: boolean) => void;
  onPromoteToLive: (callerId: string) => void;
  onEndCall: (callerId: string) => void;
  onAddNote: (callerId: string, note: string) => void;
}

export function CallerDetails({
  caller,
  onMuteToggle,
  onPromoteToLive,
  onEndCall,
  onAddNote,
}: CallerDetailsProps) {
  const [note, setNote] = useState('');

  if (!caller) {
    return (
      <Box p="md" style={{ textAlign: 'center' }}>
        <Text size="sm" c="dimmed">Select a caller to view details</Text>
      </Box>
    );
  }

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-air':
        return 'green';
      case 'waiting':
        return 'yellow';
      case 'completed':
        return 'blue';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Provide default values for optional properties
  const {
    phoneNumber = 'Unknown',
    waitTime = 0,
    isMuted = false,
    isPriority = false,
    notes = '',
    status = 'waiting',
    name = 'Unknown Caller',
    phone = '',
    joinedAt = new Date().toISOString()
  } = caller;

  const formatWaitTime = (minutes: number): string => {
    if (minutes < 1) return 'Just joined';
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  };

  const handleAddNote = () => {
    if (note.trim()) {
      onAddNote(caller.id, note);
      setNote('');
    }
  };

  return (
    <Stack gap="md">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Group>
            <Avatar size="lg" color={caller.isPriority ? 'yellow' : 'blue'} radius="xl">
              {caller.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Group gap={4} align="center">
                <Text fw={700} size="lg">{caller.name}</Text>
                {caller.isPriority && <IconStar size={20} color="var(--mantine-color-yellow-6)" />}
              </Group>
              <Text size="sm" c="dimmed">{caller.phoneNumber}</Text>
            </Box>
          </Group>
          <Badge color={getStatusColor(status)}>{status}</Badge>
        </Group>

        <Group mt="md" grow>
          <Box>
            <Text size="xs" c="dimmed">Status</Text>
            <Text fw={500}>{caller.status.charAt(0).toUpperCase() + caller.status.slice(1)}</Text>
          </Box>
          <Box>
            <Text size="sm" c="dimmed">Phone: {phoneNumber}</Text>
            <Text size="sm" c="dimmed">Wait Time: {formatWaitTime(waitTime)}</Text>
          </Box>
        </Group>
      </Paper>

      <Paper p="md" withBorder>
        <Text fw={600} mb="md">Caller Information</Text>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Caller ID</Text>
            <Text size="sm">{caller.phoneNumber}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Call Duration</Text>
            <Text size="sm">5:32</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Call Start</Text>
            <Text size="sm">2:45 PM</Text>
          </Group>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Text fw={600} mb="md">Notes</Text>
        {caller.notes ? (
          <Text size="sm">{caller.notes}</Text>
        ) : (
          <Text size="sm" c="dimmed" fs="italic">No notes for this caller</Text>
        )}
        
        <Textarea
          placeholder="Add notes about this caller..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          minRows={3}
          mb="md"
        />
        <Button 
          leftSection={<IconStar size={16} />} 
          variant={isPriority ? 'filled' : 'outline'}
          color="yellow"
          onClick={() => {}}
        >
          {isPriority ? 'Priority' : 'Make Priority'}
        </Button>
      </Paper>

      <Group grow>
        {caller.status === 'on-air' ? (
          <>
            <Button 
              leftSection={<IconVolume size={16} />} 
              variant={isMuted ? 'filled' : 'outline'}
              onClick={() => onMuteToggle(caller.id, !isMuted)}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
            <Button
              leftSection={<IconPhoneOff size={16} />}
              color="red"
              onClick={() => onEndCall(caller.id)}
            >
              End Call
            </Button>
          </>
        ) : (
          <Button
            leftSection={<IconPhone size={16} />}
            color="green"
            onClick={() => onPromoteToLive(caller.id)}
            fullWidth
          >
            Put On Air
          </Button>
        )}
      </Group>
    </Stack>
  );
}
