import { createTheme, MantineColorsTuple } from '@mantine/core'

const remnaBlue: MantineColorsTuple = [
	'#e3f2ff',
	'#c7dcf5',
	'#8ab4e6',
	'#4a8ad8',
	'#1665cc',
	'#004ebf',
	'#0043b3',
	'#00359e',
	'#002e8e',
	'#00267d',
]

export const theme = createTheme({
	primaryColor: 'remnaBlue',
	colors: {
		remnaBlue,
	},
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
	defaultRadius: 'md',
	cursorType: 'pointer',
	luminanceThreshold: 0.3,
	primaryShade: 6,
	defaultGradient: {
		from: '#339af0',
		to: '#1c7ed6',
		deg: 45,
	},
	other: {
		// Remnawave-style colors
		remnaColors: {
			primary: '#339af0',
			success: '#51cf66',
			warning: '#ffd43b',
			danger: '#ff6b6b',
			info: '#74c0fc',
			muted: '#868e96',
		},
	},
})
