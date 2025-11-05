import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { config } from './config';
import { User, UserCreate, UserUpdate, InternalSquad } from './types';

export class RemnaClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: `${config.remnaPanelUrl.replace(/\/$/, '')}/api`,
      headers: {
        'Authorization': `Bearer ${config.remnaApiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }
  
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    console.log(`🔍 Making ${config.method?.toUpperCase()} request to ${config.url}`);
    if (config.data) {
      console.log(`🔍 Request data:`, config.data);
    }
    if (config.params) {
      console.log(`🔍 Request params:`, config.params);
    }
    
    try {
      const response = await this.client.request<T>(config);
      console.log(`🔍 Response status: ${response.status}`);
      console.log(`🔍 Response data:`, response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`❌ Request failed:`, error.response?.data || error.message);
        throw error;
      }
      throw error;
    }
  }
  
  // User Management
  async getUsers(params: {
    offset?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{ users: User[]; total?: number }> {
    const response = await this.request<{ response: { users: User[] } }>({
      method: 'GET',
      url: '/users',
      params: {
        offset: params.offset || 0,
        limit: params.limit || 100,
        ...(params.search && { search: params.search }),
        ...(params.status && { status: params.status })
      }
    });
    
    return {
      users: response.response?.users || (response as any).users || [],
      total: (response as any).total
    };
  }
  
  async getUser(username: string): Promise<User> {
    console.log(`🔍 Getting user: ${username}`);
    const response = await this.request<{ response: User }>({
      method: 'GET',
      url: `/users/${username}`
    });
    console.log(`🔍 Get user response:`, response);
    return response.response || (response as any);
  }
  
  async createUser(userData: UserCreate): Promise<User> {
    console.log(`🔍 Creating user with data:`, userData);
    const response = await this.request<{ response: User }>({
      method: 'POST',
      url: '/users',
      data: userData
    });
    console.log(`🔍 Create user response:`, response);
    return response.response || (response as any);
  }
  
  async updateUser(username: string, userData: UserUpdate): Promise<User> {
    // Get user to retrieve UUID
    const userInfo = await this.getUser(username);
    const uuid = userInfo.uuid;
    
    if (!uuid) {
      throw new Error(`User ${username} not found or UUID missing`);
    }
    
    // Add uuid to the data payload as per Remna API requirements
    const updateData = {
      ...userData,
      uuid
    };
    
    const response = await this.request<{ response: User }>({
      method: 'PATCH',
      url: '/users',
      data: updateData
    });
    
    return response.response || (response as any);
  }
  
  async deleteUser(username: string): Promise<any> {
    return await this.request({
      method: 'DELETE',
      url: `/users/${username}`
    });
  }
  
  async resetUserTraffic(username: string): Promise<any> {
    return await this.request({
      method: 'POST',
      url: `/users/${username}/reset`
    });
  }
  
  async revokeSubscription(username: string): Promise<any> {
    return await this.request({
      method: 'POST',
      url: `/users/${username}/revoke`
    });
  }
  
  // System & Stats
  async getSystemStats(): Promise<any> {
    try {
      return await this.request({
        method: 'GET',
        url: '/system/stats'
      });
    } catch (error) {
      return {};
    }
  }
  
  async getCoreStats(): Promise<any> {
    try {
      return await this.request({
        method: 'GET',
        url: '/core'
      });
    } catch (error) {
      return {};
    }
  }
  
  async getNodes(): Promise<any[]> {
    try {
      const result = await this.request<any>({
        method: 'GET',
        url: '/nodes'
      });
      return Array.isArray(result) ? result : [];
    } catch (error) {
      return [];
    }
  }
  
  async getSquads(): Promise<InternalSquad[]> {
    try {
      const result = await this.request<{ response: { internalSquads: InternalSquad[] } }>({
        method: 'GET',
        url: '/internal-squads'
      });
      
      if (result.response?.internalSquads) {
        return result.response.internalSquads;
      }
      return [];
    } catch (error) {
      return [];
    }
  }
}

export const remnaClient = new RemnaClient();

