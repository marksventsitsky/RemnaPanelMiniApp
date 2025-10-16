import {
	ActionIcon,
	Alert,
	Avatar,
	Badge,
	Button,
	Card,
	Center,
	Collapse,
	Divider,
	Group,
	Loader,
	Menu,
	Modal,
	Pagination,
	Progress,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Title,
	Tooltip,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
	IconActivity,
	IconAlertCircle,
	IconChevronDown,
	IconChevronUp,
	IconClock,
	IconCopy,
	IconDots,
	IconEdit,
	IconPlus,
	IconRefresh,
	IconSearch,
	IconShield,
	IconTrash,
	IconUser,
	IconWorld,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { UserFormModal } from '../components/UserFormModal'
import { usersApi } from '../services/api'
import type { User } from '../types'
import { formatBytes, formatDate } from '../utils/format'

const ITEMS_PER_PAGE = 20

interface UserCardProps {
	user: User
	onEdit: (user: User) => void
	onDelete: (user: User) => void
	onResetTraffic: (uuid: string) => void
	onCopySubscription: (url: string) => void
}

function UserCard({
	user,
	onEdit,
	onDelete,
	onResetTraffic,
	onCopySubscription,
}: UserCardProps) {
	const [expanded, { toggle }] = useDisclosure(false)

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'ACTIVE':
				return <IconActivity size={14} />
			case 'EXPIRED':
				return <IconClock size={14} />
			case 'DISABLED':
				return <IconShield size={14} />
			default:
				return <IconUser size={14} />
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'ACTIVE':
				return '#51cf66' // Яркий зеленый для активных
			case 'EXPIRED':
				return '#ff6b6b' // Красный для истекших
			case 'DISABLED':
				return '#868e96' // Серый для отключенных
			case 'LIMITED':
				return '#ffd43b' // Желтый для ограниченных
			default:
				return '#339af0'
		}
	}

	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'ACTIVE':
				return 'АКТИВНЫЙ'
			case 'EXPIRED':
				return 'ИСТЕКШИЙ'
			case 'DISABLED':
				return 'ОТКЛЮЧЕН'
			case 'LIMITED':
				return 'ОГРАНИЧЕН'
			default:
				return status.toUpperCase()
		}
	}

	const isOnline =
		user.onlineAt &&
		new Date(user.onlineAt) > new Date(Date.now() - 5 * 60 * 1000)

	const trafficUsagePercent =
		user.trafficLimitBytes > 0
			? (user.usedTrafficBytes / user.trafficLimitBytes) * 100
			: 0

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text)
		notifications.show({
			title: 'Скопировано',
			message: 'Ссылка скопирована в буфер обмена',
			color: 'green',
		})
	}

	return (
		<Card
			shadow='sm'
			padding='md'
			radius='md'
			style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
		>
			{/* Header - always visible */}
			<Group justify='space-between' align='flex-start' mb='md'>
				<Group gap='sm' style={{ flex: 1 }}>
					<Avatar size='sm' color={getStatusColor(user.status)}>
						{user.username.charAt(0).toUpperCase()}
					</Avatar>
					<div style={{ flex: 1, minWidth: 0 }}>
						<Text fw={600} size='sm' c='white' truncate>
							{user.username}
						</Text>
						<Group gap='xs'>
							<Badge
								size='sm'
								leftSection={getStatusIcon(user.status)}
								styles={{
									root: {
										backgroundColor: getStatusColor(user.status),
										border: 'none',
										borderRadius: '20px',
										padding: '4px 12px',
										fontWeight: 600,
										fontSize: '11px',
										textTransform: 'uppercase',
										letterSpacing: '0.5px',
									},
									label: {
										color: 'white',
										fontWeight: 600,
									},
								}}
							>
								{getStatusLabel(user.status)}
							</Badge>
							{isOnline && (
								<Badge
									size='sm'
									styles={{
										root: {
											backgroundColor: '#51cf66',
											border: 'none',
											borderRadius: '20px',
											padding: '4px 12px',
											fontWeight: 600,
											fontSize: '11px',
											textTransform: 'uppercase',
											letterSpacing: '0.5px',
										},
										label: {
											color: 'white',
											fontWeight: 600,
										},
									}}
								>
									Онлайн
								</Badge>
							)}
						</Group>
					</div>
				</Group>

				<Group gap='xs'>
					<Menu shadow='md' width={200}>
						<Menu.Target>
							<ActionIcon variant='subtle' color='gray'>
								<IconDots size={16} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								leftSection={<IconEdit size={14} />}
								onClick={() => onEdit(user)}
							>
								Редактировать
							</Menu.Item>
							<Menu.Item
								leftSection={<IconRefresh size={14} />}
								onClick={() => onResetTraffic(user.uuid)}
							>
								Сбросить трафик
							</Menu.Item>
							<Menu.Item
								leftSection={<IconCopy size={14} />}
								onClick={() => onCopySubscription(user.subscriptionUrl || '')}
								disabled={!user.subscriptionUrl}
							>
								Копировать ссылку на подписку
							</Menu.Item>
							<Menu.Divider />
							<Menu.Item
								color='red'
								leftSection={<IconTrash size={14} />}
								onClick={() => onDelete(user)}
							>
								Удалить
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
					<ActionIcon variant='subtle' onClick={toggle}>
						{expanded ? (
							<IconChevronUp size={16} />
						) : (
							<IconChevronDown size={16} />
						)}
					</ActionIcon>
				</Group>
			</Group>

			{/* Basic info - always visible */}
			<Group justify='space-between' mb='sm'>
				<div>
					<Text size='xs' c='dimmed'>
						Использовано
					</Text>
					<Text fw={500} size='sm' c='white'>
						{formatBytes(user.usedTrafficBytes)}
					</Text>
				</div>
				<div>
					<Text size='xs' c='dimmed'>
						Лимит
					</Text>
					<Text fw={500} size='sm' c='white'>
						{user.trafficLimitBytes > 0
							? formatBytes(user.trafficLimitBytes)
							: '∞'}
					</Text>
				</div>
				<div>
					<Text size='xs' c='dimmed'>
						Истекает
					</Text>
					<Text fw={500} size='sm' c='white'>
						{user.expireAt
							? formatDate(user.expireAt).split(',')[0]
							: 'Никогда'}
					</Text>
				</div>
			</Group>

			{/* Progress bar for traffic usage */}
			{user.trafficLimitBytes > 0 && (
				<Progress
					value={Math.min(trafficUsagePercent, 100)}
					color={
						trafficUsagePercent > 90
							? 'red'
							: trafficUsagePercent > 70
							? 'orange'
							: 'green'
					}
					size='xs'
					mb='sm'
				/>
			)}

			{/* Expandable details */}
			<Collapse in={expanded}>
				<Divider mb='md' />

				<Stack gap='sm'>
					{/* Subscription info */}
					{user.subscriptionUrl && (
						<div>
							<Text size='xs' c='dimmed' mb={4}>
								Ссылка подписки
							</Text>
							<Group gap='xs'>
								<Text
									size='xs'
									c='white'
									style={{ flex: 1, wordBreak: 'break-all' }}
								>
									{user.subscriptionUrl}
								</Text>
								<Tooltip label='Копировать'>
									<ActionIcon
										size='xs'
										variant='subtle'
										onClick={() => copyToClipboard(user.subscriptionUrl!)}
									>
										<IconCopy size={12} />
									</ActionIcon>
								</Tooltip>
							</Group>
						</div>
					)}

					{/* Last connection */}
					{user.lastConnectedNode && (
						<div>
							<Text size='xs' c='dimmed' mb={4}>
								Последнее подключение
							</Text>
							<Group gap='xs'>
								<IconWorld size={12} />
								<Text size='xs' c='white'>
									{user.lastConnectedNode.nodeName} (
									{user.lastConnectedNode.countryCode})
								</Text>
							</Group>
						</div>
					)}

					{/* Online status */}
					<div>
						<Text size='xs' c='dimmed' mb={4}>
							Последняя активность
						</Text>
						<Text size='xs' c='white'>
							{user.onlineAt ? formatDate(user.onlineAt) : 'Никогда'}
						</Text>
					</div>

					{/* Description */}
					{user.description && (
						<div>
							<Text size='xs' c='dimmed' mb={4}>
								Описание
							</Text>
							<Text size='xs' c='white'>
								{user.description}
							</Text>
						</div>
					)}

					{/* Internal squads */}
					{user.activeInternalSquads.length > 0 && (
						<div>
							<Text size='xs' c='dimmed' mb={4}>
								Группы
							</Text>
							<Group gap='xs'>
								{user.activeInternalSquads.map(squad => (
									<Badge key={squad.uuid} size='xs' variant='light'>
										{squad.name}
									</Badge>
								))}
							</Group>
						</div>
					)}
				</Stack>
			</Collapse>
		</Card>
	)
}

export function UsersPage() {
	const [users, setUsers] = useState<User[]>([])
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState('')
	const [statusFilter, setStatusFilter] = useState<string | null>(null)

	const [formOpened, { open: openForm, close: closeForm }] =
		useDisclosure(false)
	const [deleteOpened, { open: openDelete, close: closeDelete }] =
		useDisclosure(false)

	const [selectedUser, setSelectedUser] = useState<User | null>(null)

	useEffect(() => {
		loadUsers()
	}, [page, search, statusFilter])

	const loadUsers = async () => {
		try {
			setLoading(true)
			setError(null)
			const data = await usersApi.getUsers({
				offset: (page - 1) * ITEMS_PER_PAGE,
				limit: ITEMS_PER_PAGE,
				search: search || undefined,
				status: statusFilter || undefined,
			})
			setUsers(data.users)
			setTotal(data.total)
		} catch (err) {
			setError('Ошибка загрузки пользователей')
			console.error('Error loading users:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleEdit = (user: User) => {
		setSelectedUser(user)
		openForm()
	}

	const handleDelete = (user: User) => {
		setSelectedUser(user)
		openDelete()
	}

	const handleResetTraffic = async (uuid: string) => {
		try {
			await usersApi.resetTraffic(uuid)
			notifications.show({
				title: 'Успешно',
				message: 'Трафик сброшен',
				color: 'green',
			})
			loadUsers()
		} catch (err) {
			notifications.show({
				title: 'Ошибка',
				message: 'Не удалось сбросить трафик',
				color: 'red',
			})
		}
	}

	const handleCopySubscription = (url: string) => {
		navigator.clipboard
			.writeText(url)
			.then(() => {
				notifications.show({
					title: 'Успешно',
					message: 'Ссылка на подписку скопирована в буфер обмена',
					color: 'green',
				})
			})
			.catch(() => {
				notifications.show({
					title: 'Ошибка',
					message: 'Не удалось скопировать ссылку',
					color: 'red',
				})
			})
	}

	const confirmDelete = async () => {
		if (!selectedUser) return

		try {
			await usersApi.deleteUser(selectedUser.uuid)
			notifications.show({
				title: 'Успешно',
				message: 'Пользователь удален',
				color: 'green',
			})
			closeDelete()
			loadUsers()
		} catch (err) {
			notifications.show({
				title: 'Ошибка',
				message: 'Не удалось удалить пользователя',
				color: 'red',
			})
		}
	}

	const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

	return (
		<Stack gap='lg'>
			<div>
				<Title order={1} size='h2' c='white' mb={4}>
					Пользователи
				</Title>
				<Text size='sm' c='dimmed'>
					Панель управления {'>'} Пользователи
				</Text>
			</div>

			{/* Search and filters - mobile optimized */}
			<Stack gap='sm'>
				<TextInput
					placeholder='Поиск по имени...'
					leftSection={<IconSearch size={18} />}
					value={search}
					onChange={e => setSearch(e.currentTarget.value)}
					size='md'
				/>
				<Group gap='sm'>
					<Select
						placeholder='Статус'
						clearable
						data={[
							{ value: 'ACTIVE', label: 'Активные' },
							{ value: 'DISABLED', label: 'Отключенные' },
							{ value: 'EXPIRED', label: 'Истекшие' },
						]}
						value={statusFilter}
						onChange={setStatusFilter}
						style={{ flex: 1 }}
					/>
					<Button
						leftSection={<IconPlus size={18} />}
						onClick={() => {
							setSelectedUser(null)
							openForm()
						}}
						size='md'
						fullWidth
					>
						Добавить
					</Button>
				</Group>
			</Stack>

			{loading ? (
				<Center h={400}>
					<Loader size='lg' />
				</Center>
			) : error ? (
				<Alert icon={<IconAlertCircle />} title='Ошибка' color='red'>
					{error}
				</Alert>
			) : users.length === 0 ? (
				<Center h={200}>
					<Text c='dimmed'>Пользователи не найдены</Text>
				</Center>
			) : (
				<>
					{/* Mobile-first grid */}
					<SimpleGrid
						cols={{ base: 1, xs: 1, sm: 2, md: 3, lg: 4 }}
						spacing='md'
					>
						{users.map(user => (
							<UserCard
								key={user.uuid}
								user={user}
								onEdit={handleEdit}
								onDelete={handleDelete}
								onResetTraffic={handleResetTraffic}
								onCopySubscription={handleCopySubscription}
							/>
						))}
					</SimpleGrid>

					{totalPages > 1 && (
						<Center>
							<Pagination value={page} onChange={setPage} total={totalPages} />
						</Center>
					)}
				</>
			)}

			<UserFormModal
				opened={formOpened}
				onClose={() => {
					closeForm()
					setSelectedUser(null)
				}}
				onSuccess={() => {
					closeForm()
					setSelectedUser(null)
					loadUsers()
				}}
				user={selectedUser}
			/>

			<Modal
				opened={deleteOpened}
				onClose={closeDelete}
				title='Подтверждение удаления'
			>
				<Text mb='md'>
					Вы уверены, что хотите удалить пользователя {selectedUser?.username}?
				</Text>
				<Group justify='flex-end'>
					<Button variant='default' onClick={closeDelete}>
						Отмена
					</Button>
					<Button color='red' onClick={confirmDelete}>
						Удалить
					</Button>
				</Group>
			</Modal>
		</Stack>
	)
}
