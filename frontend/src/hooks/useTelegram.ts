import { useEffect, useState } from 'react'

interface TelegramWebApp {
	ready: () => void
	expand: () => void
	close: () => void
	initData: string
	MainButton: {
		text: string
		color: string
		textColor: string
		isVisible: boolean
		isActive: boolean
		show: () => void
		hide: () => void
		enable: () => void
		disable: () => void
		onClick: (callback: () => void) => void
		offClick: (callback: () => void) => void
	}
	BackButton: {
		isVisible: boolean
		show: () => void
		hide: () => void
		onClick: (callback: () => void) => void
		offClick: (callback: () => void) => void
	}
	initDataUnsafe: {
		user?: {
			id: number
			first_name: string
			last_name?: string
			username?: string
			language_code?: string
		}
	}
	colorScheme: 'light' | 'dark'
	themeParams: {
		bg_color?: string
		text_color?: string
		hint_color?: string
		link_color?: string
		button_color?: string
		button_text_color?: string
	}
}

declare global {
	interface Window {
		Telegram?: {
			WebApp: TelegramWebApp
		}
	}
}

export const useTelegram = () => {
	const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)

	useEffect(() => {
		const app = window.Telegram?.WebApp
		if (app) {
			app.ready()
			app.expand()
			setWebApp(app)
		}
	}, [])

	return {
		webApp,
		user: webApp?.initDataUnsafe?.user,
		colorScheme: webApp?.colorScheme || 'dark',
		themeParams: webApp?.themeParams || {},
	}
}
