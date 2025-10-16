import { Container, Title, Text, Stack, Button, Paper } from '@mantine/core'
import { IconLock } from '@tabler/icons-react'

interface AccessDeniedProps {
	message?: string
	userId?: number
}

export function AccessDenied({ message, userId }: AccessDeniedProps) {
	const defaultMessage =
		'У вас нет доступа к этой панели. Обратитесь к администратору.'

	return (
		<Container size='sm' py='xl'>
			<Paper p='xl' radius='md' withBorder>
				<Stack align='center' gap='md'>
					<IconLock size={64} color='var(--mantine-color-red-6)' />
					<Title order={2} ta='center'>
						Доступ запрещен
					</Title>
					<Text c='dimmed' ta='center'>
						{message || defaultMessage}
					</Text>
					{userId && (
						<Text size='sm' c='dimmed' ta='center'>
							Ваш Telegram ID: <strong>{userId}</strong>
						</Text>
					)}
					<Button
						variant='light'
						onClick={() => window.Telegram?.WebApp?.close()}
					>
						Закрыть приложение
					</Button>
				</Stack>
			</Paper>
		</Container>
	)
}

