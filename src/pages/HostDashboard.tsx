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
  createStyles,
} from '@mantine/core';
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
  IconSettings
} from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { motion, AnimatePresence } from 'framer-motion';

const useStyles = createStyles((theme) => ({
  callerCard: {
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    '&:hover': {
      transform: 'scale(1.01)',
      boxShadow: theme.shadows.md,
    },
  },
  liveBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  videoContainer: {
    position: 'relative',
    paddingBottom: '56.25%', // 16:9 aspect ratio
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[2],
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  queueList: {
    height: 400,
  },
}));

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
  const { classes } = useStyles();
  const theme = useMantineTheme();
  
  return (
    <Card withBorder p="md" radius="md" className={classes.callerCard}>
      <Group position="apart" noWrap>
        <Group spacing="sm" noWrap>
          <Avatar size={40} color="blue" radius="xl">
            {caller.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text size="sm" weight={500}>
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
          <Group spacing="xs">
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
        <Box mt="md" className={classes.videoContainer}>
          <video 
            className={classes.video}
            autoPlay 
            playsInline 
            muted 
            // In a real app, this would be the actual video stream
            // src={caller.stream}
          />
          <div className={classes.controls}>
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

export default function HostDashboard() {
  const { classes } = useStyles();
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
  
  const [opened, { open, close }] = useDisclosure(false);
  const [showName, setShowName] = useState('My Awesome Show');
  const [newCallerName, setNewCallerName] = useState('');
  const [newCallerEmail, setNewCallerEmail] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

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
      title: 'Caller Rejected',
      message: 'Caller has been removed from the queue',
      color: 'red',
    });
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
    <Container size="xl" py="md">
      <Group position="apart" mb="xl">
        <div>
          <Title order={2}>
            {isShowLive ? currentShow : 'Host Dashboard'}
          </Title>
          <Text color="dimmed">
            Welcome back, {user?.name}
          </Text>
        </div>
        <Group>
          {isShowLive ? (
            <Button 
              leftIcon={<IconBroadcast size={16} />} 
              color="red"
              onClick={handleEndShow}
              variant="light"
            >
              End Show
            </Button>
          ) : (
            <Button 
              leftIcon={<IconBroadcast size={16} />} 
              onClick={handleStartShow}
            >
              Start Show
            </Button>
          )}
          <Button 
            variant="default" 
            leftIcon={<IconSettings size={16} />}
            onClick={() => {}}
          >
            Settings
          </Button>
        </Group>
      </Group>

      {isShowLive ? (
        <Grid>
          {/* Main Stage */}
          <Grid.Col md={8}>
            <Card withBorder radius="md" h="100%">
              <div className={classes.videoContainer}>
                <video 
                  ref={videoRef}
                  className={classes.video}
                  autoPlay 
                  playsInline 
                  muted 
                  // This would be the host's camera feed
                />
                <div className={classes.controls}>
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
              </div>
              
              <Title order={4} mt="md">Live Participants</Title>
              <Grid mt="md">
                {liveCallers.map((caller) => (
                  <Grid.Col key={caller.id} span={12} md={6}>
                    <CallerCard 
                      caller={caller} 
                      isLive 
                      onReject={handleRejectCaller}
                    />
                  </Grid.Col>
                ))}
                
                {liveCallers.length === 0 && (
                  <Grid.Col span={12}>
                    <Paper p="xl" withBorder>
                      <Text align="center" color="dimmed">
                        No live participants. Add callers from the queue.
                      </Text>
                    </Paper>
                  </Grid.Col>
                )}
              </Grid>
            </Card>
          </Grid.Col>

          {/* Caller Queue */}
          <Grid.Col md={4}>
            <Card withBorder radius="md" h="100%">
              <Group position="apart" mb="md">
                <Title order={4}>Caller Queue</Title>
                <Button 
                  leftIcon={<IconUserPlus size={16} />} 
                  size="xs"
                  variant="light"
                  onClick={open}
                >
                  Add Caller
                </Button>
              </Group>
              
              <ScrollArea className={classes.queueList}>
                <Stack spacing="sm">
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
                    <Paper p="md" withBorder>
                      <Text align="center" color="dimmed">
                        No callers in queue
                      </Text>
                    </Paper>
                  )}
                </Stack>
              </ScrollArea>
            </Card>
          </Grid.Col>
        </Grid>
      ) : (
        <Paper p="xl" withBorder>
          <Stack align="center">
            <Title order={3}>Start a New Show</Title>
            <Text color="dimmed" align="center" mb="md">
              Begin your broadcast and manage callers in real-time
            </Text>
            <Group>
              <TextInput
                placeholder="Show name"
                value={showName}
                onChange={(e) => setShowName(e.target.value)}
              />
              <Button 
                leftIcon={<IconBroadcast size={16} />} 
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
        title="Add Caller to Queue"
      >
        <Stack>
          <TextInput
            label="Name"
            placeholder="Caller's name"
            value={newCallerName}
            onChange={(e) => setNewCallerName(e.target.value)}
            required
          />
          <TextInput
            label="Email (optional)"
            placeholder="Caller's email"
            value={newCallerEmail}
            onChange={(e) => setNewCallerEmail(e.target.value)}
          />
          <Group position="right" mt="md">
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
  );
}
