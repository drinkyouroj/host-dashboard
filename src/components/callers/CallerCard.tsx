import { Card, Text, Group, Button, Avatar, Badge } from '@mantine/core';
import { IconPhoneCall, IconPhoneOff, IconX } from '@tabler/icons-react';

interface CallerCardProps {
  caller: {
    id: string;
    name: string;
    email: string;
    joinedAt: Date;
    status: 'waiting' | 'live' | 'ended';
  };
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  isLive?: boolean;
}

export function CallerCard({ 
  caller, 
  onAccept, 
  onReject, 
  isLive = false 
}: CallerCardProps) {
  const waitTime = Math.floor((new Date().getTime() - new Date(caller.joinedAt).getTime()) / 60000);

  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between">
        <Group>
          <Avatar color={isLive ? 'blue' : 'gray'} radius="xl">
            {caller.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text fw={500} size="sm">
              {caller.name}
              {isLive && (
                <Badge color="red" ml="sm" size="xs">
                  LIVE
                </Badge>
              )}
            </Text>
            <Text size="xs" color="dimmed">
              {caller.email}
            </Text>
            <Text size="xs" color="dimmed">
              Waiting: {waitTime} min
            </Text>
          </div>
        </Group>
        
        {!isLive && onAccept && onReject && (
          <Group gap="xs">
            <Button 
              variant="outline" 
              size="xs" 
              leftSection={<IconPhoneCall size={14} />}
              onClick={() => onAccept(caller.id)}
            >
              Accept
            </Button>
            <Button 
              variant="subtle" 
              size="xs" 
              color="red"
              leftSection={<IconX size={14} />}
              onClick={() => onReject(caller.id)}
            >
              Reject
            </Button>
          </Group>
        )}
      </Group>
    </Card>
  );
}

export default CallerCard;
