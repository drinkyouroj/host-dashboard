import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useShow } from '../contexts/ShowContext';


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
  MantineTheme,
  GridColProps,
  TextProps,
  Tabs,
  rem as mantineRem
} from '@mantine/core';
import styles from './HostDashboard.module.css';
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

// Import our new components
import { CallerList, Caller } from '../components/callers/CallerList';
import { CallerDetails } from '../components/callers/CallerDetails';
import { showNotification } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { motion, AnimatePresence } from 'framer-motion';

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

// Convert the existing callers to the new Caller type format
const mapToCaller = (caller: any, status: Caller['status'] = 'waiting'): Caller => ({
  id: caller.id,
  name: caller.name,
  phoneNumber: caller.email || 'Unknown',
  status,
  waitTime: 0, // You might want to calculate this based on join time
  notes: caller.notes,
  isMuted: false,
  isPriority: false
});

export default function HostDashboard() {
  const { user, logout } = useAuth();
  const { 
    callers: oldCallers, 
    liveCallers: oldLiveCallers, 
    addCaller, 
    moveToLive, 
    removeCaller,
    startShow,
    endShow,
    isShowLive,
    currentShow
  } = useShow();
  
  // Get the current show name or use a default
  const currentShowName = currentShow || 'Untitled Show';
  
  const [activeTab, setActiveTab] = useState<string | null>('callers');
  const [selectedCaller, setSelectedCaller] = useState<Caller | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [showName, setShowName] = useState('My Awesome Show');
  const [newCallerName, setNewCallerName] = useState('');
  const [newCallerEmail, setNewCallerEmail] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Convert old callers to new format
  const callers = oldCallers.map(caller => mapToCaller(caller, 'waiting'));
  const liveCallers = oldLiveCallers.map(caller => mapToCaller(caller, 'on-air'));
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
      color: 'orange',
    });
  };

  const handleMuteToggle = (callerId: string, isMuted: boolean) => {
    // In a real app, this would update the caller's mute status via API
    console.log(`Caller ${callerId} muted: ${isMuted}`);
  };

  const handlePromoteToLive = (callerId: string) => {
    moveToLive(callerId);
    showNotification({
      title: 'Caller Promoted',
      message: 'Caller has been moved to live',
      color: 'green',
    });
  };

  const handleEndCall = (callerId: string) => {
    removeCaller(callerId);
    showNotification({
      title: 'Call Ended',
      message: 'Call has been ended',
      color: 'blue',
    });
  };

  const handleAddNote = (callerId: string, note: string) => {
    // In a real app, this would save the note to your backend
    console.log(`Added note to caller ${callerId}: ${note}`);
  };

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
                <Text>LIVE: {currentShowName}</Text>
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
                    callers={allCallers}
                    onSelectCaller={setSelectedCaller}
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
