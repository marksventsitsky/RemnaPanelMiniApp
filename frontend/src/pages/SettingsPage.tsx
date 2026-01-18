import { Stack, Title, Card, Text, Group, Badge, Divider } from '@mantine/core';
import { IconInfoCircle, IconBrandTelegram } from '@tabler/icons-react';
import { useTelegram } from '../hooks/useTelegram';

export function SettingsPage() {
  const { user, colorScheme } = useTelegram();

  return (
    <Stack gap="xl">
      <div>
        <Title 
          order={1} 
          size='h1' 
          c='white' 
          mb={8}
          style={{
            background: 'linear-gradient(135deg, #339af0 0%, #1c7ed6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Настройки
        </Title>
        <Text size='sm' c='dimmed'>
          Панель управления {'>'} Настройки
        </Text>
      </div>

      <Card 
        shadow="md" 
        padding="lg" 
        radius="lg"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(51, 154, 240, 0.1)',
        }}
      >
        <Group gap="xs" mb="md">
          <IconBrandTelegram size={20} color="#339af0" />
          <Title order={4} c="white" fw={600}>
            Информация о пользователе Telegram
          </Title>
        </Group>
        <Divider mb="md" color="rgba(51, 154, 240, 0.2)" />
        <Stack gap="md">
          {user ? (
            <>
              <Group justify="space-between" p="xs" style={{ borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <Text size="sm" c="dimmed">Telegram ID:</Text>
                <Badge variant="light" color="blue">{user.id}</Badge>
              </Group>
              <Group justify="space-between" p="xs" style={{ borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <Text size="sm" c="dimmed">Имя:</Text>
                <Text size="sm" fw={600} c="white">{user.first_name}</Text>
              </Group>
              {user.last_name && (
                <Group justify="space-between" p="xs" style={{ borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                  <Text size="sm" c="dimmed">Фамилия:</Text>
                  <Text size="sm" fw={600} c="white">{user.last_name}</Text>
                </Group>
              )}
              {user.username && (
                <Group justify="space-between" p="xs" style={{ borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                  <Text size="sm" c="dimmed">Username:</Text>
                  <Badge variant="light" color="blue">@{user.username}</Badge>
                </Group>
              )}
            </>
          ) : (
            <Text c="dimmed" size="sm" p="md" style={{ 
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '8px',
            }}>
              Запустите приложение через Telegram для просмотра информации
            </Text>
          )}
        </Stack>
      </Card>

      <Card 
        shadow="md" 
        padding="lg" 
        radius="lg"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(51, 154, 240, 0.1)',
        }}
      >
        <Group gap="xs" mb="md">
          <IconInfoCircle size={20} color="#339af0" />
          <Title order={4} c="white" fw={600}>
            Информация о приложении
          </Title>
        </Group>
        <Divider mb="md" color="rgba(51, 154, 240, 0.2)" />
        <Stack gap="md">
          <Group justify="space-between" p="xs" style={{ borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
            <Text size="sm" c="dimmed">Версия:</Text>
            <Badge 
              variant="gradient" 
              gradient={{ from: '#339af0', to: '#1c7ed6', deg: 45 }}
              style={{ fontFamily: 'monospace' }}
            >
              2.1.0
            </Badge>
          </Group>
          <Group justify="space-between" p="xs" style={{ borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
            <Text size="sm" c="dimmed">Тема:</Text>
            <Badge color={colorScheme === 'dark' ? 'blue' : 'yellow'} variant="light">
              {colorScheme === 'dark' ? '🌙 Темная' : '☀️ Светлая'}
            </Badge>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}

