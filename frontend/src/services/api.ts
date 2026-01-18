import axios from 'axios'
import type {
	StatsResponse,
	User,
	UserCreate,
	UsersListResponse,
	UserUpdate,
	HwidDevice,
	HwidDevicesResponse,
} from '../types'

// API URL из переменной окружения (по умолчанию /api)
const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
		'ngrok-skip-browser-warning': 'true',
	},
})

// Add interceptor to include Telegram init data in every request
api.interceptors.request.use((config: any) => {
	// Get Telegram WebApp init data
	if (window.Telegram?.WebApp?.initData) {
		config.headers['X-Telegram-Init-Data'] = window.Telegram.WebApp.initData
	}
	return config
})

// Add response interceptor to handle auth errors
api.interceptors.response.use(
	response => response,
	error => {
		if (error.response?.status === 401 || error.response?.status === 403) {
			const message = error.response?.data?.detail || 'Access denied'
			console.error('Auth error:', message)
		}
		return Promise.reject(error)
	}
)

// Users API
export const usersApi = {
	getUsers: async (params?: {
		offset?: number
		limit?: number
		search?: string
		status?: string
	}): Promise<UsersListResponse> => {
		const { data } = await api.get('/users', { params })
		return data
	},

	getUser: async (identifier: string): Promise<User> => {
		const { data } = await api.get(`/users/${identifier}`)
		return data
	},

	createUser: async (userData: UserCreate): Promise<User> => {
		const { data } = await api.post('/users', userData)
		return data
	},

	updateUser: async (
		identifier: string,
		userData: UserUpdate
	): Promise<User> => {
		const { data } = await api.patch(`/users/${identifier}`, userData)
		return data
	},

	deleteUser: async (identifier: string): Promise<void> => {
		await api.delete(`/users/${identifier}`)
	},

	resetTraffic: async (identifier: string): Promise<void> => {
		await api.post(`/users/${identifier}/reset`)
	},

	revokeSubscription: async (identifier: string): Promise<void> => {
		await api.post(`/users/${identifier}/revoke`)
	},
}

// Devices API
export const devicesApi = {
	getUserDevices: async (userUuid: string): Promise<HwidDevice[]> => {
		const { data } = await api.get<HwidDevicesResponse>(`/devices/${userUuid}`)
		return data.devices
	},

	deleteDevice: async (userUuid: string, deviceHwid: string): Promise<void> => {
		// DELETE /api/devices with body containing userUuid and hwid
		await api.delete('/devices', {
			data: {
				userUuid,
				hwid: deviceHwid,
			},
		})
	},
}

// Stats API
export const statsApi = {
	getStats: async (): Promise<StatsResponse> => {
		const { data } = await api.get('/stats')
		return data
	},

	getNodes: async (): Promise<any> => {
		const { data } = await api.get('/stats/nodes')
		return data
	},

	getSquads: async (): Promise<any> => {
		const { data } = await api.get('/stats/squads')
		return data
	},
}

export default api
