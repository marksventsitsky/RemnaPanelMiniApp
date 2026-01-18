import { AppShell, Burger, Group, NavLink, Title, Badge, Text, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChartBar, IconUsers, IconSettings, IconRipple } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Статистика', icon: IconChartBar, path: '/' },
    { label: 'Пользователи', icon: IconUsers, path: '/users' },
    { label: 'Настройки', icon: IconSettings, path: '/settings' },
  ];

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      styles={{
        main: {
          backgroundColor: '#0a0e14',
          backgroundImage: 'linear-gradient(to bottom, rgba(51, 154, 240, 0.03), rgba(10, 14, 20, 0.8))',
          minHeight: '100vh',
        },
        header: {
          backgroundColor: 'rgba(22, 27, 34, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(51, 154, 240, 0.1)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        },
        navbar: {
          backgroundColor: 'rgba(22, 27, 34, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(51, 154, 240, 0.1)',
        }
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="lg" justify="space-between">
          <Group gap="md">
            <Burger 
              opened={opened} 
              onClick={toggle} 
              hiddenFrom="sm" 
              size="sm" 
              color="white" 
            />
            <Group gap="xs">
              <IconRipple size={24} color="#339af0" stroke={1.5} />
              <Title order={3} c="white" fw={600}>
                Remna Panel
              </Title>
            </Group>
          </Group>
          <Badge 
            size="sm" 
            variant="gradient" 
            gradient={{ from: '#339af0', to: '#1c7ed6', deg: 45 }}
            style={{ 
              fontFamily: 'monospace',
              letterSpacing: '0.5px'
            }}
          >
            v2.1.0
          </Badge>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap={4}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              active={location.pathname === item.path}
              label={<Text size="sm" fw={500}>{item.label}</Text>}
              leftSection={<item.icon size={20} stroke={1.5} />}
              onClick={() => {
                navigate(item.path);
                toggle();
              }}
              mb="xs"
              style={{
                borderRadius: '8px',
                transition: 'all 0.2s ease',
              }}
              styles={{
                root: {
                  '&[data-active]': {
                    backgroundColor: 'rgba(51, 154, 240, 0.15)',
                    borderLeft: '3px solid #339af0',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(51, 154, 240, 0.1)',
                  },
                },
              }}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

