import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TextInput, PasswordInput, Button, Paper, Title, Container, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconLock, IconAt, IconUser } from '@tabler/icons-react';

export default function Login() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      email: 'host@example.com',
      password: 'password',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      await login(values.email, values.password);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title align="center" sx={{ fontWeight: 900 }}>
        Welcome back!
      </Title>
      <Text color="dimmed" size="sm" align="center" mt={5}>
        Sign in to your host dashboard
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="your@email.com"
              icon={<IconAt size={16} />}
              required
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              icon={<IconLock size={16} />}
              required
              {...form.getInputProps('password')}
            />
            <Button fullWidth type="submit" loading={loading} mt="xl">
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
      
      <Text color="dimmed" size="sm" align="center" mt={20}>
        Demo credentials: host@example.com / password
      </Text>
    </Container>
  );
}
