import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { showNotification } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { motion, AnimatePresence } from 'framer-motion';

// Mantine UI Components
import { 
  Container, 
  Grid, 
  Card, 
  Text, 
  Title, 
  Button, 
  Group, 
  Avatar, 
  Badge, 
  ActionIcon,
  Modal,
  TextInput,
  Stack,
  ScrollArea,
  Divider,
  Paper,
  Box,
  useMantineTheme,
  rem,
  SimpleGrid,
  Tabs,
  type MantineTheme,
  type GridColProps,
  type TextProps
} from '@mantine/core';

// Tabler Icons
import { 
  IconPhoneCall, 
  IconPhoneOff, 
  IconUserPlus, 
  IconBroadcast, 
  IconX,
  IconVolume,
  IconMicrophoneOff,
  IconVideo,
  IconVideoOff,
  IconScreenShare,
  IconSettings,
  IconList,
  IconUser,
  IconUsers
} from '@tabler/icons-react';

// App Components and Contexts
import { useAuth } from '../contexts/AuthContext';
import { useShow, type Caller } from '../contexts/ShowContext';
import { CallerList } from '../components/callers/CallerList';
import { CallerDetails } from '../components/callers/CallerDetails';

// Styles
import styles from './HostDashboard.module.css';

// Import shared types
import type { UICaller } from '../types/caller';

const CallerCard = ({ 
  caller, 
  onAccept, 
  onReject, 
  isLive = false 
}: { 
  caller: any, 
  onAccept?: (id: string) => void, 
  onReject?: (id: string) => void,
  isLive?: boolean
}) => {
  const theme = useMantineTheme();
  
  return (
    <Card withBorder p="md" radius="md" className={styles.callerCard}>
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <Avatar size={40} color="blue" radius="xl">
            {caller.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text size="sm" fw={500}>
              {caller.name}
            </Text>
            <Text size="xs" color="dimmed">
              {caller.email || 'No email provided'}
            </Text>
          </div>
        </Group>
        {isLive ? (
          <Badge color="red" variant="filled">
            LIVE
          </Badge>
        ) : (
          <Group gap="xs">
            <ActionIcon 
              color="green" 
              variant="light"
              onClick={() => onAccept?.(caller.id)}
            >
              <IconPhoneCall size={16} />
            </ActionIcon>
            <ActionIcon 
              color="red" 
              variant="light"
              onClick={() => onReject?.(caller.id)}
            >
              <IconPhoneOff size={16} />
            </ActionIcon>
          </Group>
        )}
      </Group>
      
      {isLive && (
        <Box mt="md" className={styles.videoContainer}>
          <video 
            className={styles.video}
            autoPlay 
            playsInline 
            muted 
            // In a real app, this would be the actual video stream
            // src={caller.stream}
          />
          <div className={styles.controls}>
            <ActionIcon variant="filled" size="lg" radius="xl">
              <IconVolume size={20} />
            </ActionIcon>
            <ActionIcon variant="filled" size="lg" radius="xl">
              <IconMicrophoneOff size={20} />
            </ActionIcon>
            <ActionIcon variant="filled" size="lg" radius="xl">
              <IconVideoOff size={20} />
            </ActionIcon>
            <ActionIcon variant="filled" size="lg" radius="xl">
              <IconScreenShare size={20} />
            </ActionIcon>
          </div>
        </Box>
      )}
    </Card>
  );
};

  // Helper function to calculate wait time in minutes
  const calculateWaitTime = (joinedAt: Date): number => {
    return Math.floor((new Date().getTime() - new Date(joinedAt).getTime()) / 60000);
  };

export default function HostDashboard() {
  const { user, logout } = useAuth();
  const { 
    callers, 
    liveCallers, 
    addCaller, 
    moveToLive, 
    removeCaller,
    startShow,
    endShow,
    isShowLive,
    currentShow
  } = useShow();
  
  // UI State
  const [selectedCaller, setSelectedCaller] = useState<UICaller | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('callers');
  const [opened, { open, close }] = useDisclosure(false);
  
  // Caller State
  const [callerState, setCallerState] = useState<{
    notes: Record<string, string>;
    isMuted: Record<string, boolean>;
    isPriority: Record<string, boolean>;
  }>({
    notes: {},
    isMuted: {},
    isPriority: {}
  });
  
  // Form State
  const [showName, setShowName] = useState(currentShow || 'My Awesome Show');
  const [newCallerName, setNewCallerName] = useState('');
  const [newCallerEmail, setNewCallerEmail] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Combine callers from the context
  const allCallers = [...liveCallers, ...callers];

  const handleStartShow = () => {
    if (!showName.trim()) {
      showNotification({
        title: 'Error',
        message: 'Please enter a show name',
        color: 'red',
      });
      return;
    }
    startShow(showName);
    showNotification({
      title: 'Show Started',
      message: `Your show "${showName}" is now live!`,
      color: 'green',
    });
  };

  const handleEndShow = () => {
    endShow();
    showNotification({
      title: 'Show Ended',
      message: 'Your show has ended. Thanks for broadcasting!',
      color: 'blue',
    });
  };

  const handleAddCaller = () => {
    if (!newCallerName.trim()) return;
    
    const caller = addCaller({
      name: newCallerName,
      email: newCallerEmail,
    });
    
    showNotification({
      title: 'Caller Added',
      message: `${newCallerName} has been added to the queue`,
      color: 'green',
    });
    
    setNewCallerName('');
    setNewCallerEmail('');
    close();
  };

  const handleAcceptCaller = (callerId: string) => {
    moveToLive(callerId);
    showNotification({
      title: 'Caller Added',
      message: 'Caller has been moved to live',
      color: 'green',
    });
  };

  const handleRejectCaller = (callerId: string) => {
    removeCaller(callerId);
    showNotification({
      title: 'Caller Removed',
      message: 'Caller has been removed from the queue',
    });
  };

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [callerMuteStatus, setCallerMuteStatus] = useState<Record<string, boolean>>({});
  const [callerPriorityStatus, setCallerPriorityStatus] = useState<Record<string, boolean>>({});

  const updateCallerState = useCallback((updates: Partial<typeof callerState>) => {
    setCallerState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const handleMuteToggle = useCallback((callerId: string, isMuted: boolean) => {
    updateCallerState({
      isMuted: {
        ...callerState.isMuted,
        [callerId]: isMuted
      }
    });
    
    // Update selected caller if it's the one being muted/unmuted
    if (selectedCaller?.id === callerId) {
      setSelectedCaller(prev => prev ? { 
        ...prev, 
        isMuted 
      } : null);
    }
  }, [callerState.isMuted, selectedCaller, updateCallerState]);

  const handlePriorityToggle = useCallback((callerId: string) => {
    const newPriority = !callerState.isPriority[callerId];
    updateCallerState({
      isPriority: {
        ...callerState.isPriority,
        [callerId]: newPriority
      }
    });
    
    // Update selected caller if it's the one being prioritized
    if (selectedCaller?.id === callerId) {
      setSelectedCaller(prev => prev ? { 
        ...prev, 
        isPriority: newPriority
      } : null);
    }
  }, [callerState.isPriority, selectedCaller, updateCallerState]);

  const handlePromoteToLive = useCallback((callerId: string) => {
    moveToLive(callerId);
    showNotification({
      title: 'Caller Promoted',
      message: 'Caller has been moved to live',
      color: 'green',
    });
  }, [moveToLive]);

  const handleEndCall = useCallback((callerId: string) => {
    // Remove the caller from the list
    removeCaller(callerId);
    
    // Clean up local state
    const { [callerId]: _, ...remainingMuted } = callerState.isMuted;
    const { [callerId]: __, ...remainingPriority } = callerState.isPriority;
    const { [callerId]: ___, ...remainingNotes } = callerState.notes;
    
    updateCallerState({
      isMuted: remainingMuted,
      isPriority: remainingPriority,
      notes: remainingNotes
    });
    
    // If the selected caller is the one being removed, clear selection
    if (selectedCaller?.id === callerId) {
      setSelectedCaller(null);
    }
    
    const caller = allCallers.find(c => c.id === callerId);
    if (caller) {
      showNotification({
        title: 'Call Ended',
        message: `Call with ${caller.name} has been ended`,
        color: 'blue',
      });
    }
  }, [allCallers, callerState.isMuted, callerState.isPriority, callerState.notes, removeCaller, selectedCaller, updateCallerState]);

  const handleAddNote = useCallback((callerId: string, note: string) => {
    updateCallerState({
      notes: {
        ...callerState.notes,
        [callerId]: note
      }
    });
    
    // Update selected caller's note if it's the one being updated
    if (selectedCaller?.id === callerId) {
      setSelectedCaller(prev => prev ? { 
        ...prev, 
        notes: note 
      } : null);
    }
    
    showNotification({
      title: 'Note Added',
      message: 'Note has been saved',
      color: 'green',
    });
  }, [callerState.notes, selectedCaller, updateCallerState]);

  // Helper function to convert Caller to UICaller for display
  const toUICaller = useCallback((caller: Caller | UICaller): UICaller => {
    // If it's already a UICaller, return it with updated waitTime
    if ('phoneNumber' in caller) {
      return {
        ...caller,
        waitTime: Math.floor((new Date().getTime() - new Date(caller.joinedAt).getTime()) / 60000),
        displayStatus: caller.displayStatus || 
          (caller.status === 'live' ? 'On Air' : 
           caller.status === 'waiting' ? 'Waiting' :
           caller.status === 'rejected' ? 'Rejected' :
           caller.status)
      };
    }

    // Convert from Caller to UICaller
    const statusMap = {
      'live': 'On Air',
      'waiting': 'Waiting',
      'rejected': 'Rejected'
    } as const;

    // Ensure the status is one of the expected values
    const status: 'live' | 'waiting' | 'rejected' = 
      (caller.status === 'live' || caller.status === 'waiting' || caller.status === 'rejected')
        ? caller.status
        : 'waiting';

    return {
      // Required Caller properties
      id: caller.id,
      name: caller.name,
      email: caller.email,
      joinedAt: caller.joinedAt,
      status: status,
      connectionId: caller.connectionId,
      
      // UICaller specific properties
      phoneNumber: caller.phone || 'Unknown',
      waitTime: Math.floor((new Date().getTime() - new Date(caller.joinedAt).getTime()) / 60000),
      displayStatus: statusMap[status] || status,
      isMuted: false,
      isPriority: false,
      notes: ''
    };
  }, []);
  
  // Convert all callers to UICaller objects
  const allUICallers = useMemo(() => {
    return allCallers.map(caller => toUICaller(caller));
  }, [allCallers, toUICaller]);

  const handleSelectCaller = useCallback((caller: UICaller) => {
    setSelectedCaller(caller);
  }, []);

  // In a real app, we would set up WebRTC connections here
  useEffect(() => {
    // This is where we would initialize the Datagram SDK
    // and set up the video streams
    
    // For demo purposes, we'll just log the current state
    console.log('Live callers:', liveCallers);
    
    return () => {
      // Clean up any resources
    };
  }, [liveCallers]);

  return (
    <Container size="xl" py="md" className={styles.dashboardContainer}>
      <header className={styles.header}>
        <Group justify="space-between" align="center">
          <Title order={2} className={styles.title}>
            {isShowLive ? (
              <Group gap="xs">
                <Box className={styles.liveIndicator} />
                <Text>LIVE: {currentShow || 'Untitled Show'}</Text>
              </Group>
            ) : (
              'Host Dashboard'
            )}
          </Title>
          <Group>
            {isShowLive ? (
              <Button 
                leftSection={<IconBroadcast size={18} />} 
                color="red"
                onClick={handleEndShow}
                variant="outline"
              >
                End Show
              </Button>
            ) : (
              <Button 
                leftSection={<IconBroadcast size={18} />} 
                onClick={handleStartShow}
              >
                Start Show
              </Button>
            )}
            <Button 
              leftSection={<IconUserPlus size={18} />} 
              variant="outline"
              onClick={open}
            >
              Add Caller
            </Button>
            <Button 
              variant="subtle" 
              onClick={logout}
              leftSection={<IconSettings size={18} />}
            >
              Settings
            </Button>
          </Group>
        </Group>
      </header>

      {isShowLive ? (
        <Tabs 
          value={activeTab} 
          onChange={setActiveTab}
          defaultValue="callers"
          mt="md"
        >
          <Tabs.List>
            <Tabs.Tab value="callers" leftSection={<IconUsers size={14} />}>
              Call Management
            </Tabs.Tab>
            <Tabs.Tab value="legacy" leftSection={<IconList size={14} />}>
              Legacy View
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="callers" pt="md">
            <Grid>
              <Grid.Col span={{ base: 12, md: 5 }}>
                <Paper p="md" withBorder h="100%">
                  <Group justify="space-between" mb="md">
                    <Text fw={600}>Call Queue</Text>
                    <Text size="sm" c="dimmed">
                      {callers.length} waiting • {liveCallers.length} on air
                    </Text>
                  </Group>
                  <CallerList 
                    callers={allUICallers}
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
                  {selectedCaller && (
                  <CallerDetails 
                    caller={toUICaller(selectedCaller)}
                    onMuteToggle={handleMuteToggle}
                    onPromoteToLive={handlePromoteToLive}
                    onEndCall={handleEndCall}
                    onAddNote={handleAddNote}
                  />
                )}
                </Paper>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="legacy" pt="md">
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Card withBorder h="100%">
                  <Text fw={500} mb="md">Call Queue ({callers.length})</Text>
                  <ScrollArea h={300}>
                    <Stack gap="xs">
                      {callers.length > 0 ? (
                        callers.map((caller) => (
                          <CallerCard 
                            key={caller.id} 
                            caller={caller} 
                            onAccept={handleAcceptCaller}
                            onReject={handleRejectCaller}
                          />
                        ))
                      ) : (
                        <Text size="sm" c="dimmed" ta="center" py="md">
                          No callers in queue
                        </Text>
                      )}
                    </Stack>
                  </ScrollArea>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, lg: 8 }}>
                <Card withBorder h="100%">
                  <Text fw={500} mb="md">Live Callers ({liveCallers.length})</Text>
                  <SimpleGrid 
                    cols={{ base: 1, sm: 2 }} 
                    spacing="md"
                  >
                    {liveCallers.length > 0 ? (
                      liveCallers.map((caller) => (
                        <CallerCard 
                          key={caller.id} 
                          caller={caller} 
                          isLive 
                          onReject={handleRejectCaller}
                        />
                      ))
                    ) : (
                      <Text size="sm" c="dimmed">
                        No live callers. Start a show and accept callers to see them here.
                      </Text>
                    )}
                  </SimpleGrid>
                </Card>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>
        </Tabs>
      ) : (
        <Paper p="xl" withBorder mt="md">
          <Stack align="center">
            <Title order={3}>Start a New Show</Title>
            <Text c="dimmed" ta="center" mb="md">
              Begin your broadcast and manage callers in real-time
            </Text>
            <Group>
              <TextInput
                placeholder="Show name"
                value={showName}
                onChange={(e) => setShowName(e.target.value)}
              />
              <Button 
                leftSection={<IconBroadcast size={16} />}
                onClick={handleStartShow}
              >
                Start Show
              </Button>
            </Group>
          </Stack>
        </Paper>
      )}

      {/* Add Caller Modal */}
      <Modal 
        opened={opened} 
        onClose={close} 
        title="Add New Caller"
        size="md"
      >
        <Stack>
          <TextInput
            label="Caller Name"
            placeholder="Enter caller's name"
            value={newCallerName}
            onChange={(e) => setNewCallerName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Email or Phone"
            placeholder="Enter email or phone number"
            value={newCallerEmail}
            onChange={(e) => setNewCallerEmail(e.currentTarget.value)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={close}>
              Cancel
            </Button>
            <Button onClick={handleAddCaller} disabled={!newCallerName.trim()}>
              Add Caller
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
