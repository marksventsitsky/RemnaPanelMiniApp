import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import { DatesProvider } from '@mantine/dates'
import '@mantine/dates/styles.css'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import '@mantine/notifications/styles.css'
import 'dayjs/locale/ru'
import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AccessDenied } from './components/AccessDenied'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { SettingsPage } from './pages/SettingsPage'
import { UsersPage } from './pages/UsersPage'
import { statsApi } from './services/api'
import { theme } from './theme/theme'

function App() {
	const [accessGranted, setAccessGranted] = useState<boolean | null>(null)
	const [accessError, setAccessError] = useState<string | null>(null)
	const [userId, setUserId] = useState<number | null>(null)

	useEffect(() => {
		// Проверяем доступ при загрузке приложения
		const checkAccess = async () => {
			try {
				// Пытаемся получить статистику - если получится, значит доступ есть
				await statsApi.getStats()
				setAccessGranted(true)
			} catch (error: any) {
				console.error('Access check failed:', error)

				// Извлекаем Telegram User ID если доступен
				if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
					setUserId(window.Telegram.WebApp.initDataUnsafe.user.id)
				}

				// Сохраняем сообщение об ошибке
				if (error.response?.data?.detail) {
					setAccessError(error.response.data.detail)
				}

				setAccessGranted(false)
			}
		}

		checkAccess()
	}, [])

	// Показываем загрузку пока проверяем доступ
	if (accessGranted === null) {
		return null
	}

	// Показываем ошибку доступа
	if (!accessGranted) {
		return (
			<MantineProvider theme={theme} defaultColorScheme='dark'>
				<Notifications position='top-right' />
				<AccessDenied
					message={accessError || undefined}
					userId={userId || undefined}
				/>
			</MantineProvider>
		)
	}

	return (
		<MantineProvider theme={theme} defaultColorScheme='dark'>
			<DatesProvider
				settings={{ locale: 'ru', firstDayOfWeek: 1, weekendDays: [0, 6] }}
			>
				<ModalsProvider>
					<Notifications position='top-right' />
					<BrowserRouter>
						<Layout>
							<Routes>
								<Route path='/' element={<DashboardPage />} />
								<Route path='/users' element={<UsersPage />} />
								<Route path='/settings' element={<SettingsPage />} />
							</Routes>
						</Layout>
					</BrowserRouter>
				</ModalsProvider>
			</DatesProvider>
		</MantineProvider>
	)
}

export default App
