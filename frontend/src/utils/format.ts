/**
 * Format bytes to human readable string
 */
export const formatBytes = (bytes: number | null | undefined): string => {
	// Handle null, undefined, NaN, or invalid numbers
	if (bytes == null || isNaN(bytes) || !isFinite(bytes)) {
		return '0 B'
	}

	// Ensure it's a number
	const numBytes = Number(bytes)
	if (numBytes === 0) {
		return '0 B'
	}

	const k = 1024
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
	const i = Math.floor(Math.log(numBytes) / Math.log(k))

	// Ensure index is valid
	const sizeIndex = Math.min(i, sizes.length - 1)
	return `${(numBytes / Math.pow(k, sizeIndex)).toFixed(2)} ${sizes[sizeIndex]}`
}

/**
 * Format timestamp or date string to date string
 */
export const formatDate = (
	value: number | string | null | undefined
): string => {
	if (!value) return 'N/A'

	const date =
		typeof value === 'number' ? new Date(value * 1000) : new Date(value)
	return date.toLocaleDateString('ru-RU', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

/**
 * Get status badge color
 */
export const getStatusColor = (status: string): string => {
	switch (status.toLowerCase()) {
		case 'active':
			return 'green'
		case 'disabled':
			return 'red'
		case 'limited':
			return 'orange'
		case 'expired':
			return 'gray'
		default:
			return 'blue'
	}
}

/**
 * Get status label in Russian
 */
export const getStatusLabel = (status: string): string => {
	switch (status.toLowerCase()) {
		case 'active':
			return 'Активен'
		case 'disabled':
			return 'Отключен'
		case 'limited':
			return 'Ограничен'
		case 'expired':
			return 'Истёк'
		default:
			return status
	}
}
