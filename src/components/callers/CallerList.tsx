import { useState } from 'react';
import { Box, Text, Paper, Group, Avatar, Badge, ActionIcon } from '@mantine/core';
import { IconPhone, IconPhoneOff, IconVolume, IconVolumeOff, IconStar, IconUserPlus } from '@tabler/icons-react';

export interface Caller {
  id: string;
  name: string;
  phoneNumber: string;
  status: 'waiting' | 'on-air' | 'completed' | 'rejected';
  waitTime: number; // in minutes
  notes?: string;
  isMuted?: boolean;
  isPriority?: boolean;
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

  if (callers.length === 0) {
    return (
      <Box p="md" style={{ textAlign: 'center' }}>
        <Text size="sm" c="dimmed">No callers in the queue</Text>
      </Box>
    );
  }

  return (
    <Box style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
      {callers.map((caller) => (
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
