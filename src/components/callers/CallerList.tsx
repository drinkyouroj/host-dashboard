import { useState } from 'react';
import { Box, Text, Paper, Group, Avatar, Badge, ActionIcon, Tooltip } from '@mantine/core';
import { 
  IconPhone, 
  IconPhoneOff, 
  IconVolume, 
  IconVolumeOff, 
  IconStar, 
  IconUserPlus,
  IconMicrophone,
  IconMicrophoneOff,
  IconBroadcast,
  IconPhoneCall
} from '@tabler/icons-react';

import type { Caller } from '../../contexts/ShowContext';

// Create a UI-specific status type that maps to our status values
type UICallerStatus = 'waiting' | 'on-air' | 'completed' | 'rejected';

// Extend the Caller type with UI-specific properties
interface UICaller extends Omit<Caller, 'status'> {
  phoneNumber: string;
  waitTime: number;
  isMuted: boolean;
  isPriority: boolean;
  status: UICallerStatus;
}

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

  const handleCallerClick = (caller: Caller) => {
    setSelectedCallerId(caller.id);
    onSelectCaller(caller);
  };

  const formatWaitTime = (minutes: number): string => {
    if (minutes < 1) return 'Just joined';
    return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  };

  // Map the Caller to UICaller for display
  const mapToUICaller = (caller: Caller): UICaller => {
    const statusMap: Record<Caller['status'], UICallerStatus> = {
      'waiting': 'waiting',
      'live': 'on-air',
      'rejected': 'rejected'
    };

    return {
      ...caller,
      phoneNumber: caller.phone || 'Unknown',
      waitTime: Math.floor((new Date().getTime() - new Date(caller.joinedAt).getTime()) / 60000),
      status: statusMap[caller.status] || 'completed',
      isMuted: false,
      isPriority: false
    };
  };

  const uiCallers = callers.map(mapToUICaller);

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
