import { useState, useEffect } from 'react';
import { showNotification } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';

// Mantine UI Components
import { 
  Container, 
  Title, 
  Button, 
  Group, 
  Badge, 
  Modal,
  TextInput,
  Stack,
  Tabs,
  Text,
  Box,
  Paper,
  useMantineTheme
} from '@mantine/core';

// Tabler Icons
import { 
  IconPhoneCall, 
  IconPhoneOff, 
  IconUserPlus, 
  IconBroadcast,
  IconUsers,
  IconUser
} from '@tabler/icons-react';

// Components
import { StreamProvider } from '../contexts/stream/StreamContext';
import { CallerCard } from '../components/callers/CallerCard';

// Types
interface Caller {
  id: string;
  name: string;
  email: string;
  joinedAt: Date;
  status: 'waiting' | 'live' | 'ended';
}

interface CallerState {
  isMuted: Record<string, boolean>;
  isPriority: Record<string, boolean>;
  notes: Record<string, string>;
}

const HostDashboard = () => {
  const theme = useMantineTheme();
  
  // State for the show
  const [isShowLive, setIsShowLive] = useState(false);
  const [isStartingShow, setIsStartingShow] = useState(false);
  const [isEndingShow, setIsEndingShow] = useState(false);
  
  // State for callers
  const [callers, setCallers] = useState<Caller[]>([]);
  const [liveCallers, setLiveCallers] = useState<Caller[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState<string | null>('callers');
  const [newCallerName, setNewCallerName] = useState('');
  const [newCallerEmail, setNewCallerEmail] = useState('');
  const [selectedCaller, setSelectedCaller] = useState<Caller | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  
  // Caller state management
  const [callerState, setCallerState] = useState<CallerState>({
    isMuted: {},
    isPriority: {},
    notes: {}
  });

  // Caller management functions
  const addCaller = (caller: Caller) => {
    setCallers(prev => [...prev, caller]);
  };

  const removeCaller = (callerId: string) => {
    setCallers(prev => prev.filter(caller => caller.id !== callerId));
  };

  const moveToLive = (callerId: string) => {
    const caller = callers.find(c => c.id === callerId);
    if (caller) {
      setLiveCallers(prev => [...prev, { ...caller, status: 'live' }]);
      removeCaller(callerId);
    }
  };

  const returnToQueue = (callerId: string) => {
    const caller = liveCallers.find(c => c.id === callerId);
    if (caller) {
      // Move caller back to waiting queue
      setCallers(prev => [...prev, { ...caller, status: 'waiting' }]);
      // Remove from live callers
      setLiveCallers(prev => prev.filter(c => c.id !== callerId));
      
      showNotification({
        title: 'Caller Returned',
        message: `${caller.name} has been returned to the waiting queue`,
        color: 'blue',
      });
    }
  };

  // Event handlers
  const handleAddCaller = () => {
    if (!newCallerName.trim()) return;
    
    const newCaller: Caller = {
      id: `caller-${Date.now()}`,
      name: newCallerName,
      email: newCallerEmail,
      joinedAt: new Date(),
      status: 'waiting',
    };
    
    addCaller(newCaller);
    setNewCallerName('');
    setNewCallerEmail('');
    close();
  };

  const handleAcceptCaller = (callerId: string) => {
    moveToLive(callerId);
  };

  const handleRejectCaller = (callerId: string) => {
    removeCaller(callerId);
  };

  // Show management functions
  const startShow = async () => {
    try {
      setIsStartingShow(true);
      // TODO: Implement actual show start logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsShowLive(true);
      showNotification({
        title: 'Show Started',
        message: 'Your show is now live!',
        color: 'green',
      });
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to start show. Please try again.',
        color: 'red',
      });
    } finally {
      setIsStartingShow(false);
    }
  };

  const endShow = async () => {
    try {
      setIsEndingShow(true);
      // TODO: Implement actual show end logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsShowLive(false);
      showNotification({
        title: 'Show Ended',
        message: 'Your show has ended successfully.',
        color: 'green',
      });
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to end show. Please try again.',
        color: 'red',
      });
    } finally {
      setIsEndingShow(false);
    }
  };

  return (
    <StreamProvider>
      <Container size="xl" py="md">
        {/* Header Section */}
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
          <Title order={2}>
            {isShowLive ? (
              <Group gap="xs">
                <Badge color="red" variant="filled" size="lg">LIVE</Badge>
                <Text>Show in Progress</Text>
              </Group>
            ) : (
              'Host Dashboard'
            )}
          </Title>
          
          <Group>
            <Button 
              leftSection={<IconUserPlus size={16} />}
              onClick={open}
              variant="outline"
            >
              Add Caller
            </Button>
            
            {isShowLive ? (
              <Button 
                variant="outline" 
                color="red" 
                leftSection={<IconPhoneOff size={16} />}
                onClick={endShow}
                loading={isEndingShow}
              >
                End Show
              </Button>
            ) : (
              <Button 
                leftSection={<IconBroadcast size={16} />}
                onClick={startShow}
                loading={isStartingShow}
              >
                Start Show
              </Button>
            )}
          </Group>
        </Box>
        
        {/* Main Content */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="callers" leftSection={<IconUsers size={14} />}>
              Callers
            </Tabs.Tab>
            <Tabs.Tab value="live" leftSection={<IconBroadcast size={14} />}>
              Live Stream
            </Tabs.Tab>
          </Tabs.List>
          
          <Tabs.Panel value="callers" pt="md">
            <Paper p="md" withBorder>
              {callers.length > 0 ? (
                <Stack gap="md">
                  {callers.map(caller => (
                    <CallerCard
                      key={caller.id}
                      caller={caller}
                      onAccept={() => handleAcceptCaller(caller.id)}
                      onReject={() => handleRejectCaller(caller.id)}
                    />
                  ))}
                </Stack>
              ) : (
                <Text ta="center" c="dimmed" py="xl">
                  No callers waiting
                </Text>
              )}
            </Paper>
          </Tabs.Panel>
          
          <Tabs.Panel value="live" pt="md">
            <Paper p="md" withBorder>
              {isShowLive ? (
                <Stack>
                  <Text>Live stream will be displayed here</Text>
                  {liveCallers.length > 0 && (
                    <div>
                      <Text size="sm" c="dimmed" mb="sm">Live Callers</Text>
                      <Stack gap="md">
                        {liveCallers.map(caller => (
                          <CallerCard
                            key={caller.id}
                            caller={caller}
                            isLive
                            onReturnToQueue={() => returnToQueue(caller.id)}
                          />
                        ))}
                      </Stack>
                    </div>
                  )}
                </Stack>
              ) : (
                <Text ta="center" c="dimmed" py="xl">
                  Start the show to go live
                </Text>
              )}
            </Paper>
          </Tabs.Panel>
        </Tabs>
        
        {/* Add Caller Modal */}
        <Modal 
          opened={opened} 
          onClose={close}
          title="Add Caller"
          size="md"
        >
          <Stack gap="md">
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
              <Button 
                onClick={handleAddCaller} 
                disabled={!newCallerName.trim()}
              >
                Add Caller
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Container>
    </StreamProvider>
  );
};

export default HostDashboard;
