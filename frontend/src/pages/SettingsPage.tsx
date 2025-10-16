import { Stack, Title, Card, Text, Group, Badge } from '@mantine/core';
import { useTelegram } from '../hooks/useTelegram';

export function SettingsPage() {
  const { user, colorScheme } = useTelegram();

  return (
    <Stack gap="lg">
      <Title order={2}>Настройки</Title>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={4} mb="md">
          Информация о пользователе
        </Title>
        <Stack gap="xs">
          {user ? (
            <>
              <Group justify="space-between">
                <Text size="sm">ID:</Text>
                <Text size="sm" fw={600}>{user.id}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Имя:</Text>
                <Text size="sm" fw={600}>{user.first_name}</Text>
              </Group>
              {user.last_name && (
                <Group justify="space-between">
                  <Text size="sm">Фамилия:</Text>
                  <Text size="sm" fw={600}>{user.last_name}</Text>
                </Group>
              )}
              {user.username && (
                <Group justify="space-between">
                  <Text size="sm">Username:</Text>
                  <Text size="sm" fw={600}>@{user.username}</Text>
                </Group>
              )}
            </>
          ) : (
            <Text c="dimmed" size="sm">
              Запустите приложение через Telegram для просмотра информации
            </Text>
          )}
        </Stack>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={4} mb="md">
          Приложение
        </Title>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm">Версия:</Text>
            <Text size="sm" fw={600}>1.0.0</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm">Тема:</Text>
            <Badge color={colorScheme === 'dark' ? 'gray' : 'yellow'}>
              {colorScheme === 'dark' ? 'Темная' : 'Светлая'}
            </Badge>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}

