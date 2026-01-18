import {
	Alert,
	Card,
	Center,
	Group,
	Loader,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import {
	IconActivity,
	IconAlertCircle,
	IconChartBar,
	IconClock,
	IconCloudDownload,
	IconCpu,
	IconDeviceDesktop,
	IconServer,
	IconUserExclamation,
	IconUserOff,
	IconUsers,
	IconUserX,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { statsApi } from '../services/api'
import type { StatsResponse } from '../types'
import { formatBytes } from '../utils/format'

interface CompactStatCardProps {
	title: string
	value: string
	icon: React.ReactNode
	color?: string
}

function CompactStatCard({
	title,
	value,
	icon,
	color = '#339af0',
}: CompactStatCardProps) {
	return (
		<Card
			shadow='md'
			padding='md'
			radius='lg'
			style={{ 
				backgroundColor: 'rgba(255, 255, 255, 0.03)',
				border: '1px solid rgba(51, 154, 240, 0.1)',
				transition: 'all 0.2s ease',
				cursor: 'pointer',
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
				e.currentTarget.style.borderColor = color
				e.currentTarget.style.transform = 'translateY(-2px)'
				e.currentTarget.style.boxShadow = `0 4px 12px rgba(51, 154, 240, 0.2)`
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'
				e.currentTarget.style.borderColor = 'rgba(51, 154, 240, 0.1)'
				e.currentTarget.style.transform = 'translateY(0)'
				e.currentTarget.style.boxShadow = 'none'
			}}
		>
			<Group justify='space-between' align='center'>
				<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
					<div 
						style={{ 
							color, 
							opacity: 0.9, 
							fontSize: '16px',
							padding: '8px',
							borderRadius: '8px',
							backgroundColor: `${color}15`,
						}}
					>
						{icon}
					</div>
					<Text size='xs' c='dimmed' fw={500}>
						{title}
					</Text>
				</div>
				<Text fw={700} size='md' c='white'>
					{value}
				</Text>
			</Group>
		</Card>
	)
}

export function DashboardPage() {
	const [stats, setStats] = useState<StatsResponse | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		loadStats()
	}, [])

	const loadStats = async () => {
		try {
			setLoading(true)
			setError(null)
			const data = await statsApi.getStats()
			setStats(data)
		} catch (err) {
			setError('Ошибка загрузки статистики')
			console.error('Error loading stats:', err)
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return (
			<Center h={400}>
				<Loader size='lg' />
			</Center>
		)
	}

	if (error) {
		return (
			<Alert icon={<IconAlertCircle />} title='Ошибка' color='red'>
				{error}
			</Alert>
		)
	}

	if (!stats) {
		return null
	}

	// Safe access to nested properties
	const systemData = stats.system || {}
	const nodesData = (systemData as any).nodes || {}
	const memoryData = (systemData as any).memory || {}
	const onlineData = (systemData as any).onlineStats || {}

	return (
		<Stack gap='xl'>
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
					Краткая статистика
				</Title>
				<Text size='sm' c='dimmed'>
					Панель управления {'>'} Главная
				</Text>
			</div>

			{/* Remnawave Usage */}
			<div>
				<Title order={3} size='h4' c='white' mb='lg' fw={600}>
					Remnawave Usage
				</Title>
				<SimpleGrid cols={{ base: 2, xs: 4 }} spacing='sm'>
					<CompactStatCard
						title='Все процессы'
						value='3'
						icon={<IconServer size={16} />}
						color='#339af0'
					/>
					<CompactStatCard
						title='Всего памяти'
						value='505 MiB'
						icon={<IconDeviceDesktop size={16} />}
						color='#51cf66'
					/>
					<CompactStatCard
						title='Средний CPU'
						value='0.7%'
						icon={<IconCpu size={16} />}
						color='#ffd43b'
					/>
					<CompactStatCard
						title='Heaviest Process'
						value='REST API-0'
						icon={<IconActivity size={16} />}
						color='#ff6b6b'
					/>
				</SimpleGrid>
			</div>

			{/* Система */}
			<div>
				<Title order={3} size='h4' c='white' mb='lg' fw={600}>
					Система
				</Title>
				<SimpleGrid cols={{ base: 2, xs: 3 }} spacing='sm'>
					<CompactStatCard
						title='Всего онлайн на нодах'
						value={nodesData.totalOnline?.toString() || '0'}
						icon={<IconCpu size={16} />}
						color='#339af0'
					/>
					<CompactStatCard
						title='Общий трафик'
						value={formatBytes(stats.usage.total_traffic)}
						icon={<IconChartBar size={16} />}
						color='#51cf66'
					/>
					<CompactStatCard
						title='Использование RAM'
						value={`${memoryData.used ? formatBytes(memoryData.used) : '0'} / ${
							memoryData.total ? formatBytes(memoryData.total) : '0'
						}`}
						icon={<IconDeviceDesktop size={16} />}
						color='#ffd43b'
					/>
				</SimpleGrid>
			</div>

			{/* Онлайн */}
			<div>
				<Title order={3} size='h4' c='white' mb='lg' fw={600}>
					Онлайн
				</Title>
				<SimpleGrid cols={{ base: 2, xs: 4 }} spacing='sm'>
					<CompactStatCard
						title='В сети'
						value={onlineData.onlineNow?.toString() || '0'}
						icon={<IconActivity size={16} />}
						color='#339af0'
					/>
					<CompactStatCard
						title='Сегодня'
						value={onlineData.lastDay?.toString() || '0'}
						icon={<IconClock size={16} />}
						color='#51cf66'
					/>
					<CompactStatCard
						title='На этой неделе'
						value={onlineData.lastWeek?.toString() || '0'}
						icon={<IconUsers size={16} />}
						color='#ffd43b'
					/>
					<CompactStatCard
						title='Никогда'
						value={onlineData.neverOnline?.toString() || '0'}
						icon={<IconUserOff size={16} />}
						color='#868e96'
					/>
				</SimpleGrid>
			</div>

			{/* Пользователи */}
			<div>
				<Title order={3} size='h4' c='white' mb='lg' fw={600}>
					Пользователи
				</Title>
				<SimpleGrid cols={{ base: 2, xs: 5 }} spacing='sm'>
					<CompactStatCard
						title='Всего'
						value={stats.usage.total_users.toString()}
						icon={<IconUsers size={16} />}
						color='#339af0'
					/>
					<CompactStatCard
						title='Active'
						value={stats.usage.active_users.toString()}
						icon={<IconActivity size={16} />}
						color='#51cf66'
					/>
					<CompactStatCard
						title='Expired'
						value={stats.usage.expired_users.toString()}
						icon={<IconClock size={16} />}
						color='#ff6b6b'
					/>
					<CompactStatCard
						title='Limited'
						value={stats.usage.limited_users.toString()}
						icon={<IconUserExclamation size={16} />}
						color='#ffd43b'
					/>
					<CompactStatCard
						title='Disabled'
						value={stats.usage.disabled_users.toString()}
						icon={<IconUserX size={16} />}
						color='#868e96'
					/>
				</SimpleGrid>
			</div>

			{/* Дополнительная информация */}
			{stats.system && (
				<div>
					<Title order={3} size='h4' c='white' mb='lg' fw={600}>
						Детали по процессам
					</Title>
					<SimpleGrid cols={{ base: 1, xs: 3 }} spacing='sm'>
						<CompactStatCard
							title='REST API-0'
							value='2% / 173.45 MiB'
							icon={<IconCloudDownload size={16} />}
							color='#339af0'
						/>
						<CompactStatCard
							title='Scheduler-0'
							value='0% / 160.79 MiB'
							icon={<IconClock size={16} />}
							color='#51cf66'
						/>
						<CompactStatCard
							title='Jobs-0'
							value='0% / 170.84 MiB'
							icon={<IconServer size={16} />}
							color='#ffd43b'
						/>
					</SimpleGrid>
				</div>
			)}
		</Stack>
	)
}
