/**
 * Shared types between backend and frontend
 */

export interface User {
  uuid: string;
  username: string;
  shortUuid: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXPIRED';
  expireAt: string | null;
  createdAt: string;
  updatedAt: string;
  usedTrafficBytes: number;
  lifetimeUsedTrafficBytes: number;
  trafficLimitBytes: number | null;
  trafficLimitStrategy: 'NO_RESET' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  subLastUserAgent: string | null;
  subLastOpenedAt: string | null;
  onlineAt: string | null;
  subRevokedAt: string | null;
  lastTrafficResetAt: string | null;
  trojanPassword: string;
  vlessUuid: string;
  ssPassword: string;
  description: string | null;
  tag: string | null;
  telegramId: string | null;
  email: string | null;
  hwidDeviceLimit: number | null;
  firstConnectedAt: string | null;
  lastTriggeredThreshold: number;
  subscriptionUrl: string;
  activeInternalSquads: InternalSquad[];
  lastConnectedNode: Node | null;
  happ: {
    cryptoLink: string;
  };
}

export interface InternalSquad {
  uuid: string;
  name: string;
}

export interface Node {
  uuid: string;
  name: string;
  address: string;
  status: string;
}

export interface UserCreate {
  username: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  trafficLimitBytes?: number | null;
  expireAt?: string | null;
  activeInternalSquads?: string[];
  hwidDeviceLimit?: number | null;
}

export interface UserUpdate {
  username?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  trafficLimitBytes?: number | null;
  expireAt?: string | null;
  activeInternalSquads?: string[];
  hwidDeviceLimit?: number | null;
}

export interface UsersListResponse {
  users: User[];
  total: number;
}

export interface SystemStats {
  memoryUsage: number;
  cpuUsage: number;
  usersCount: number;
  activeUsers: number;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_dev?: boolean;
}

