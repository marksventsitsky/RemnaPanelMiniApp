import { AppShell, Burger, Group, NavLink, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChartBar, IconUsers, IconSettings } from '@tabler/icons-react';
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
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      styles={{
        main: {
          backgroundColor: '#0d1117', // GitHub dark background
          minHeight: '100vh',
        },
        header: {
          backgroundColor: '#161b22', // Darker header
          borderBottom: '1px solid #21262d',
        },
        navbar: {
          backgroundColor: '#161b22', // Darker navbar
          borderRight: '1px solid #21262d',
        }
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="white" />
          <Title order={3} c="white">Remna Panel</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            active={location.pathname === item.path}
            label={item.label}
            leftSection={<item.icon size={20} />}
            onClick={() => {
              navigate(item.path);
              toggle();
            }}
            mb="xs"
            c="white"
            style={{
              color: 'white',
            }}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

