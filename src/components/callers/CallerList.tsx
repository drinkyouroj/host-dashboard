import { useState } from 'react';
import { 
  Box, 
  Paper, 
  Text, 
  Group, 
  ActionIcon, 
  Badge,
  Stack,
  Tooltip,
  Avatar
} from '@mantine/core';
import { 
  IconMicrophone, 
  IconMicrophoneOff, 
  IconPhoneCall, 
  IconPhoneOff, 
  IconStar, 
  IconUserPlus,
  IconVolume,
  IconVolumeOff,
  IconPhone,
  IconBroadcast
} from '@tabler/icons-react';

import type { Caller } from '../../contexts/ShowContext';

export type { Caller };

// Import the UICaller type from the HostDashboard
import type { UICaller } from '../../pages/HostDashboard';

// Create a UI-specific status type that maps to our status values
type UICallerStatus = UICaller['status'];

// Extend the Caller type with UI-specific properties
type UICallerExtended = UICaller & {
  phoneNumber: string;
  waitTime: number;
  isMuted: boolean;
  isPriority: boolean;
};

interface CallerListProps {
  callers: Caller[];
  onSelectCaller: (caller: Caller) => void;
  onMuteToggle: (callerId: string, isMuted: boolean) => void;
  onPromoteToLive: (callerId: string) => void;
  onEndCall: (callerId: string) => void;
}

export function CallerList({
  callers,
  onSelectCaller,
  onMuteToggle,
  onPromoteToLive,
  onEndCall,
}: CallerListProps) {
  const [selectedCallerId, setSelectedCallerId] = useState<string | null>(null);

  const handleCallerClick = (uiCaller: UICaller) => {
    // Find the original caller from the callers array
    const originalCaller = callers.find(c => c.id === uiCaller.id);
    if (originalCaller) {
      setSelectedCallerId(uiCaller.id);
      // Call the onSelectCaller with the UI caller data
      onSelectCaller({
        ...originalCaller,
        phoneNumber: uiCaller.phoneNumber,
        waitTime: uiCaller.waitTime,
        isMuted: uiCaller.isMuted,
        isPriority: uiCaller.isPriority,
        status: uiCaller.status,
        notes: uiCaller.notes
      });
    }
  };
  
  const handleMuteToggle = (e: React.MouseEvent, caller: UICaller) => {
    e.stopPropagation();
    onMuteToggle(caller.id, !caller.isMuted);
  };
  
  const handlePriorityToggle = (e: React.MouseEvent, caller: UICaller) => {
    e.stopPropagation();
    onMuteToggle(caller.id, caller.isMuted); // Just to update the UI for now
  };

  const formatWaitTime = (minutes: number): string => {
    if (minutes < 1) return 'Just joined';
    return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  };

  // Map the Caller to UICaller for display
  const mapToUICaller = (caller: Caller): UICaller => {
    // Map the status to our UI status
    let uiStatus: UICallerStatus;
    switch (caller.status) {
      case 'live':
        uiStatus = 'on-air';
        break;
      case 'waiting':
      case 'rejected':
        uiStatus = caller.status;
        break;
      default:
        uiStatus = 'completed';
    }

    // Create a new object with only the properties that match the UICaller interface
    const uiCaller: UICaller = {
      ...caller,
      phoneNumber: caller.phone || 'Unknown',
      waitTime: Math.floor((new Date().getTime() - new Date(caller.joinedAt).getTime()) / 60000),
      status: uiStatus,
      isMuted: false,
      isPriority: false
    };
    
    return uiCaller;
  };

  // Map the callers to UI callers and sort by status (on-air first, then waiting, then others)
  const uiCallers = callers.map(mapToUICaller).sort((a, b) => {
    const statusOrder: Record<UICallerStatus, number> = {
      'on-air': 0,
      'waiting': 1,
      'rejected': 2,
      'completed': 3
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

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

  if (uiCallers.length === 0) {
    return (
      <Box p="md" style={{ textAlign: 'center' }}>
        <Text size="sm" c="dimmed">No callers in the queue</Text>
      </Box>
    );
  }

  return (
    <Box style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
      {uiCallers.map((caller) => (
        <Paper
          key={caller.id}
          p="sm"
          mb="xs"
          withBorder
          shadow={selectedCallerId === caller.id ? 'md' : 'xs'}
          style={{
            cursor: 'pointer',
            backgroundColor: selectedCallerId === caller.id ? 'var(--mantine-color-blue-0)' : 'transparent',
            transition: 'all 0.2s',
          }}
          onClick={() => handleCallerClick(caller)}
        >
          <Group justify="space-between">
            <Group>
              <Avatar color={caller.isPriority ? 'yellow' : 'blue'} radius="xl">
                {caller.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Group gap={4} align="center">
                  <Text fw={500}>{caller.name}</Text>
                  {caller.isPriority && <IconStar size={16} color="var(--mantine-color-yellow-6)" />}
                </Group>
                <Text size="xs" c="dimmed">{caller.phoneNumber}</Text>
                <Text size="xs" c="dimmed">{formatWaitTime(caller.waitTime)}</Text>
              </Box>
            </Group>
            
            <Group gap={4}>
              <Badge color={getStatusColor(caller.status)} variant="light">
                {caller.status}
              </Badge>
              
              {caller.status === 'on-air' && (
                <ActionIcon
                  variant="subtle"
                  color={caller.isMuted ? 'red' : 'blue'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMuteToggle(caller.id, !caller.isMuted);
                  }}
                >
                  {caller.isMuted ? <IconVolumeOff size={18} /> : <IconVolume size={18} />}
                </ActionIcon>
              )}
              
              {caller.status === 'waiting' && (
                <ActionIcon
                  variant="filled"
                  color="green"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPromoteToLive(caller.id);
                  }}
                >
                  <IconPhone size={18} />
                </ActionIcon>
              )}
              
              {caller.status === 'on-air' && (
                <ActionIcon
                  variant="outline"
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEndCall(caller.id);
                  }}
                >
                  <IconPhoneOff size={18} />
                </ActionIcon>
              )}
            </Group>
          </Group>
        </Paper>
      ))}
    </Box>
  );
}
