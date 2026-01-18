export interface LastConnectedNode {
	nodeName?: string
	countryCode?: string
	connectedAt?: string
}

export interface ActiveInternalSquad {
	uuid: string
	name: string
}

export interface HappData {
	cryptoLink?: string
}

export interface User {
	uuid: string
	username: string
	shortUuid: string
	status: string
	expireAt?: string
	createdAt: string
	updatedAt: string
	usedTrafficBytes: number
	lifetimeUsedTrafficBytes: number
	trafficLimitBytes: number
	trafficLimitStrategy: string
	subLastUserAgent?: string
	subLastOpenedAt?: string
	onlineAt?: string
	subRevokedAt?: string
	lastTrafficResetAt?: string
	trojanPassword?: string
	vlessUuid?: string
	ssPassword?: string
	description?: string
	tag?: string
	telegramId?: string
	email?: string
	hwidDeviceLimit?: number
	firstConnectedAt?: string
	lastTriggeredThreshold?: number
	subscriptionUrl?: string
	activeInternalSquads: ActiveInternalSquad[]
	lastConnectedNode?: LastConnectedNode
	happ?: HappData

	// Computed fields for compatibility
	used_traffic: number
	data_limit: number | null
	expire: string | null
	created_at: string
}

export interface UsersListResponse {
	users: User[]
	total: number
}

export interface UserCreate {
	username: string
	proxies?: Record<string, any>
	data_limit?: number  // In GB
	expire?: string  // Date string
	expireAt?: string
	telegramId?: string | null
	email?: string | null
	description?: string | null
	tag?: string | null
	hwidDeviceLimit?: number | null
	activeInternalSquads?: string[]  // List of squad UUIDs
}

export interface UserUpdate {
	username?: string
	status?: string
	proxies?: Record<string, any>
	data_limit?: number
	expire?: string | null
	telegramId?: string | null
	email?: string | null
	description?: string | null
	tag?: string | null
	hwidDeviceLimit?: number | null
	activeInternalSquads?: string[]  // List of squad UUIDs
}

export interface UsageStats {
	total_users: number
	active_users: number
	disabled_users: number
	limited_users: number
	expired_users: number
	total_traffic: number
}

export interface SystemStats {
	version: string | null
	started: boolean | null
	logs_websocket: string | null
}

export interface StatsResponse {
	system: SystemStats | null
	usage: UsageStats
}

export interface HwidDevice {
	uuid: string
	userUuid: string
	hwid: string
	userAgent?: string
	createdAt: string
	lastUsedAt?: string
}

export interface HwidDevicesResponse {
	devices: HwidDevice[]
}
