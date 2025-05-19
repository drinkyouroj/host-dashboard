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

import type { UICaller } from '../../types/caller';

export type { UICaller };

interface CallerListProps {
  callers: UICaller[];
  onSelectCaller: (caller: UICaller) => void;
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
    setSelectedCallerId(uiCaller.id);
    onSelectCaller(uiCaller);
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

  // Sort callers by status (live first, then waiting, then rejected)
  const sortedCallers = [...callers].sort((a, b) => {
    // Create a mapping of status to sort order
    const statusOrder: Record<'live' | 'waiting' | 'rejected', number> = {
      'live': 0,      // live callers first
      'waiting': 1,   // waiting callers second
      'rejected': 2   // rejected callers last
    };
    
    return statusOrder[a.status] - statusOrder[b.status];
  });
  
  // Filter out any callers with unexpected status values
  const uiCallers = sortedCallers.filter((caller): caller is UICaller & 
    { status: 'live' | 'waiting' | 'rejected' } => 
    ['live', 'waiting', 'rejected'].includes(caller.status)
  );

  const getStatusDisplay = (status: 'live' | 'waiting' | 'rejected'): { text: string; color: string } => {
    // Map status to display text and color
    const statusMap = {
      'live': { text: 'On Air' as const, color: 'green' as const },
      'waiting': { text: 'Waiting' as const, color: 'yellow' as const },
      'rejected': { text: 'Rejected' as const, color: 'red' as const }
    };
    
    return statusMap[status] || { text: status, color: 'gray' };
  };

  if (callers.length === 0) {
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
              <Avatar 
                color={caller.isPriority ? 'yellow' : 'blue'} 
                radius="xl"
                style={{
                  transition: 'all 0.2s',
                  border: caller.isPriority ? '2px solid var(--mantine-color-yellow-6)' : 'none'
                }}
              >
                {caller.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Group gap={4} align="center">
                  <Text fw={500} style={{ transition: 'color 0.2s' }}>
                    {caller.name}
                  </Text>
                  {caller.isPriority && (
                    <IconStar 
                      size={16} 
                      fill="currentColor" 
                      color="var(--mantine-color-yellow-6)"
                    />
                  )}
                </Group>
                <Text size="xs" c="dimmed">{caller.phoneNumber}</Text>
                <Text size="xs" c="dimmed">{formatWaitTime(caller.waitTime)}</Text>
              </Box>
            </Group>
            
            <Group gap={4}>
              <Badge 
                color={getStatusDisplay(caller.status).color}
                variant="light"
                size="sm"
              >
                {caller.displayStatus || caller.status}
              </Badge>
              
              {caller.status === 'live' && (
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
              
              {caller.status === 'live' && (
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
