import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Card,
	Checkbox,
	Divider,
	Group,
	Modal,
	MultiSelect,
	NumberInput,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import {
	IconBrandTelegram,
	IconCalendar,
	IconChartBar,
	IconCopy,
	IconDeviceDesktop,
	IconLink,
	IconMail,
	IconShield,
	IconUser,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { statsApi, usersApi } from '../services/api'
import type { User, UserCreate, UserUpdate } from '../types'

interface UserFormModalProps {
	opened: boolean
	onClose: () => void
	onSuccess: () => void
	user?: User | null
}

interface Squad {
	uuid: string
	name: string
	info?: {
		membersCount?: number
		inboundsCount?: number
	}
}

// Шаблоны трафика в ГБ
const TRAFFIC_TEMPLATES = [
	{ value: 200, label: '200 ГБ' },
	{ value: 500, label: '500 ГБ' },
	{ value: 1000, label: '1 ТБ' },
]

// Шаблоны времени
const TIME_TEMPLATES = [
	{ days: 7, label: '+1 неделя' },
	{ days: 30, label: '+1 месяц' },
	{ days: 90, label: '+3 месяца' },
	{ days: 180, label: '+6 месяцев' },
	{ days: 365, label: '+1 год' },
]

export function UserFormModal({
	opened,
	onClose,
	onSuccess,
	user,
}: UserFormModalProps) {
	const isEdit = !!user
	const [squads, setSquads] = useState<Squad[]>([])
	const [loadingSquads, setLoadingSquads] = useState(false)

	const form = useForm({
		initialValues: {
			username: '',
			status: 'active',
			data_limit: 200, // Базовое значение 200 ГБ
			expire: null as Date | null,
			telegramId: '',
			email: '',
			description: '',
			tag: '',
			hwidDeviceLimit: 5 as number | null,
			activeInternalSquads: [] as string[],
			noTrafficLimit: false,
			noExpireLimit: false,
		},
		validate: {
			username: (value: string) =>
				!value ? 'Имя пользователя обязательно' : null,
		},
	})

	// Загрузка squad-ов из API /api/internal-squads
	useEffect(() => {
		if (opened) {
			loadSquads()
		}
	}, [opened])

	const loadSquads = async () => {
		setLoadingSquads(true)
		try {
			const response = await statsApi.getSquads()
			const squadsList = response.squads || []
			setSquads(squadsList)
		} catch (err) {
			console.error('Failed to load squads:', err)
			notifications.show({
				title: 'Предупреждение',
				message: 'Не удалось загрузить список squad-ов',
				color: 'yellow',
			})
		} finally {
			setLoadingSquads(false)
		}
	}

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text)
		notifications.show({
			title: 'Скопировано',
			message: `${label} скопировано в буфер обмена`,
			color: 'green',
		})
	}

	useEffect(() => {
		if (user) {
			form.setValues({
				username: user.username,
				status: user.status,
				data_limit:
					user.trafficLimitBytes > 0
						? user.trafficLimitBytes / (1024 * 1024 * 1024)
						: 200,
				expire: user.expireAt ? new Date(user.expireAt) : null,
				telegramId: user.telegramId || '',
				email: user.email || '',
				description: user.description || '',
				tag: user.tag || '',
				hwidDeviceLimit: user.hwidDeviceLimit ?? 5,
				activeInternalSquads: user.activeInternalSquads?.map(s => s.uuid) || [],
				noTrafficLimit: user.trafficLimitBytes === 0,
				noExpireLimit: !user.expireAt,
			})
		} else {
			form.reset()
			form.setFieldValue('data_limit', 200) // Базовое значение
			form.setFieldValue('activeInternalSquads', []) // Пустой массив, пользователь выберет squad сам
		}
	}, [user, opened])

	const handleSubmit = async (values: typeof form.values) => {
		try {
			// Конвертируем дату в ISO строку
			const expireAt =
				values.noExpireLimit || !values.expire
					? undefined
					: values.expire.toISOString()

			// Конвертируем трафик из ГБ в байты
			const dataLimitBytes = values.noTrafficLimit
				? undefined
				: values.data_limit * 1024 * 1024 * 1024

			if (isEdit && user) {
				const updateData: UserUpdate = {
					status: values.status,
					data_limit: dataLimitBytes,
					expire: expireAt,
					telegramId: values.telegramId || null,
					email: values.email || null,
					description: values.description || null,
					tag: values.tag || null,
					hwidDeviceLimit: values.hwidDeviceLimit ?? null,
					activeInternalSquads:
						values.activeInternalSquads.length > 0
							? values.activeInternalSquads
							: undefined,
				}
				console.log('🔍 Frontend updateData:', updateData)
				console.log('🔍 hwidDeviceLimit value:', values.hwidDeviceLimit)
				await usersApi.updateUser(user.uuid, updateData)
				notifications.show({
					title: 'Успешно',
					message: 'Пользователь обновлен',
					color: 'green',
				})
			} else {
				const createData: UserCreate = {
					username: values.username,
					proxies: {},
					data_limit: dataLimitBytes,
					expireAt: expireAt,
					telegramId: values.telegramId || null,
					email: values.email || null,
					description: values.description || null,
					tag: values.tag || null,
					hwidDeviceLimit: values.hwidDeviceLimit ?? null,
					activeInternalSquads:
						values.activeInternalSquads.length > 0
							? values.activeInternalSquads
							: undefined,
				}
				await usersApi.createUser(createData)
				notifications.show({
					title: 'Успешно',
					message: 'Пользователь создан',
					color: 'green',
				})
			}
			onSuccess()
			onClose()
		} catch (err: any) {
			notifications.show({
				title: 'Ошибка',
				message:
					err.response?.data?.detail || 'Не удалось сохранить пользователя',
				color: 'red',
			})
		}
	}

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Group gap='sm'>
					<Text size='lg' fw={600}>
						{isEdit ? 'Редактирование' : 'Создание'}
					</Text>
					{isEdit && user && (
						<Badge color={user.status === 'ACTIVE' ? 'green' : 'red'}>
							{user.status}
						</Badge>
					)}
				</Group>
			}
			size='xl'
			fullScreen
			centered
		>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='md'>
					{/* User Information */}
					<Card withBorder padding='md'>
						<Group gap='xs' mb='md'>
							<IconUser size={18} />
							<Text size='sm' fw={500}>
								Информация о пользователе
							</Text>
						</Group>

						<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
							<TextInput
								label='Имя пользователя'
								placeholder='username'
								disabled={isEdit}
								description={isEdit ? 'Username нельзя изменить' : undefined}
								required
								leftSection={<IconUser size={16} />}
								{...form.getInputProps('username')}
							/>

							{isEdit && user?.shortUuid && (
								<TextInput
									label='Short UUID подписки'
									value={user.shortUuid}
									readOnly
									rightSection={
										<Tooltip label='Копировать'>
											<ActionIcon
												variant='subtle'
												onClick={() =>
													copyToClipboard(user.shortUuid, 'Short UUID')
												}
											>
												<IconCopy size={14} />
											</ActionIcon>
										</Tooltip>
									}
								/>
							)}

							{isEdit && user?.subscriptionUrl && (
								<TextInput
									label='URL подписки'
									value={user.subscriptionUrl}
									readOnly
									leftSection={<IconLink size={16} />}
									rightSection={
										<Tooltip label='Копировать'>
											<ActionIcon
												variant='subtle'
												onClick={() =>
													copyToClipboard(user.subscriptionUrl!, 'URL подписки')
												}
											>
												<IconCopy size={14} />
											</ActionIcon>
										</Tooltip>
									}
								/>
							)}

							{isEdit && (
								<Select
									label='Статус'
									data={[
										{ value: 'ACTIVE', label: 'Активен' },
										{ value: 'DISABLED', label: 'Отключен' },
										{ value: 'LIMITED', label: 'Ограничен' },
										{ value: 'EXPIRED', label: 'Истёк' },
									]}
									{...form.getInputProps('status')}
								/>
							)}
						</SimpleGrid>
					</Card>

					{/* Contact Information */}
					<Card withBorder padding='md'>
						<Group gap='xs' mb='md'>
							<IconMail size={18} />
							<Text size='sm' fw={500}>
								Контактная информация
							</Text>
						</Group>

						<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
							<TextInput
								label='Telegram ID'
								placeholder='Введите Telegram ID (необязательно)'
								leftSection={<IconBrandTelegram size={16} />}
								{...form.getInputProps('telegramId')}
							/>

							<TextInput
								label='Email'
								placeholder='Введите email (необязательно)'
								type='email'
								leftSection={<IconMail size={16} />}
								{...form.getInputProps('email')}
							/>
						</SimpleGrid>
					</Card>

					{/* Traffic & Limits */}
					<Card withBorder padding='md'>
						<Group gap='xs' mb='md'>
							<IconChartBar size={18} />
							<Text size='sm' fw={500}>
								Трафик и лимиты
							</Text>
						</Group>

						<Box>
							<Group justify='space-between' mb='xs'>
								<Text size='sm' fw={500}>
									Лимит трафика
								</Text>
								<Checkbox
									label='Безлимит'
									checked={form.values.noTrafficLimit}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										form.setFieldValue(
											'noTrafficLimit',
											e.currentTarget.checked
										)
									}
								/>
							</Group>

							{!form.values.noTrafficLimit && (
								<>
									<NumberInput
										placeholder='Введите лимит данных в ГБ, 0 - безлимит.'
										min={0}
										suffix=' ГБ'
										leftSection={<IconChartBar size={16} />}
										{...form.getInputProps('data_limit')}
									/>

									<Text size='xs' c='dimmed' mt={4}>
										Шаблоны:
									</Text>
									<SimpleGrid
										cols={{ base: 2, sm: 3, md: 5 }}
										spacing='xs'
										mt={8}
									>
										{TRAFFIC_TEMPLATES.map(template => (
											<Button
												key={template.value}
												variant={
													form.values.data_limit === template.value
														? 'filled'
														: 'light'
												}
												size='xs'
												fullWidth
												onClick={() =>
													form.setFieldValue('data_limit', template.value)
												}
											>
												{template.label}
											</Button>
										))}
									</SimpleGrid>
								</>
							)}
						</Box>

						<Divider />

						<Box>
							<Group justify='space-between' mb='xs'>
								<Text size='sm' fw={500}>
									Дата истечения подписки
								</Text>
								<Checkbox
									label='Без срока'
									checked={form.values.noExpireLimit}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										form.setFieldValue('noExpireLimit', e.currentTarget.checked)
									}
								/>
							</Group>

							{!form.values.noExpireLimit && (
								<>
									<DateTimePicker
										placeholder='Дата и время истечения срока действия подписки пользователя.'
										leftSection={<IconCalendar size={16} />}
										valueFormat='DD.MM.YYYY HH:mm'
										locale='ru'
										{...form.getInputProps('expire')}
									/>

									<Text size='xs' c='dimmed' mt={4}>
										Шаблоны:
									</Text>
									<SimpleGrid
										cols={{ base: 2, sm: 3, md: 5 }}
										spacing='xs'
										mt={8}
									>
										{TIME_TEMPLATES.map(template => (
											<Button
												key={template.days}
												variant='light'
												size='xs'
												fullWidth
												onClick={() => {
													const newDate = dayjs()
														.add(template.days, 'day')
														.toDate()
													form.setFieldValue('expire', newDate)
												}}
											>
												{template.label}
											</Button>
										))}
									</SimpleGrid>
								</>
							)}
						</Box>

						<Divider />

						<Box>
							<Text size='sm' fw={500} mb='xs'>
								Стратегия сброса трафика
							</Text>
							<Select
								placeholder='Как часто следует сбрасывать трафик пользователя'
								data={[
									{ value: 'never', label: 'Никогда не сбрасывать' },
									{ value: 'daily', label: 'Ежедневно' },
									{ value: 'weekly', label: 'Еженедельно' },
									{ value: 'monthly', label: 'Ежемесячно' },
								]}
								defaultValue='never'
							/>
						</Box>
					</Card>

					{/* Access Settings */}
					<Card withBorder padding='md'>
						<Group gap='xs' mb='md'>
							<IconShield size={18} />
							<Text size='sm' fw={500}>
								Настройки доступа
							</Text>
						</Group>

						<SimpleGrid cols={{ base: 1, sm: 2 }} spacing='md'>
							<TextInput
								label='Описание'
								placeholder='Описание пользователя'
								{...form.getInputProps('description')}
							/>

							<TextInput
								label='Tag'
								placeholder='EXAMPLE_TAG_1'
								leftSection={<IconCopy size={16} />}
								{...form.getInputProps('tag')}
							/>
						</SimpleGrid>

						<Divider />

						<Box>
							<Text size='sm' fw={500} mb='xs'>
								Внутренние сквады
							</Text>
							<Text size='xs' c='dimmed' mb={8}>
								Выберите в каких внутренних группах будет состоять пользователь
							</Text>
							<MultiSelect
								placeholder='Поиск по squad-ам...'
								data={squads.map((squad: Squad) => ({
									value: squad.uuid,
									label: `${squad.name}${
										squad.info?.membersCount
											? ` (${squad.info.membersCount} чел.)`
											: ''
									}`,
								}))}
								searchable
								disabled={loadingSquads}
								description={
									loadingSquads
										? 'Загрузка squad-ов...'
										: `Доступно squad-ов: ${squads.length}`
								}
								{...form.getInputProps('activeInternalSquads')}
							/>
						</Box>

						<Divider />

						<Box>
							<Group justify='space-between' align='center' mb='xs'>
								<Box>
									<Text size='sm' fw={500}>
										Ограничение HWID устройств
									</Text>
									<Text size='xs' c='dimmed'>
										Эта функция доступна только если{' '}
										<Text component='span' c='blue' fw={500}>
											HWID_FALLBACK_DEVICE_LIMIT
										</Text>{' '}
										env переменная установлена в{' '}
										<Text component='span' c='blue' fw={500}>
											true
										</Text>
										.
									</Text>
								</Box>
								<Checkbox
									checked={(form.values.hwidDeviceLimit ?? 0) > 0}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
										form.setFieldValue(
											'hwidDeviceLimit',
											e.currentTarget.checked ? 5 : 0
										)
									}}
								/>
							</Group>

							<NumberInput
								placeholder='HWID_FALLBACK_DEVICE_LIMIT in use'
								min={0}
								leftSection={<IconDeviceDesktop size={16} />}
								style={{
									display: (form.values.hwidDeviceLimit ?? 0) > 0 ? 'block' : 'none',
								}}
								{...form.getInputProps('hwidDeviceLimit')}
							/>
						</Box>
					</Card>

					{/* Actions */}
					<Group justify='flex-end' mt='xl' gap='sm'>
						<Button variant='default' onClick={onClose} size='md'>
							Отмена
						</Button>
						<Button type='submit' size='md'>
							{isEdit ? 'Сохранить' : 'Создать пользователя'}
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	)
}
