from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema"""
    username: str
    status: str


class UserCreate(BaseModel):
    """Schema for creating a new user"""
    username: str
    proxies: Optional[Dict[str, Any]] = None
    data_limit: Optional[int] = None  # In GB, will be converted to bytes
    expire: Optional[str] = None  # Date string, will be converted to expireAt
    expireAt: Optional[str] = None  # Required by Remna API
    telegramId: Optional[str] = None
    email: Optional[str] = None
    description: Optional[str] = None
    tag: Optional[str] = None
    hwidDeviceLimit: Optional[int] = None
    activeInternalSquads: Optional[List[str]] = None  # List of squad UUIDs


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    username: Optional[str] = None
    status: Optional[str] = None
    proxies: Optional[Dict[str, Any]] = None
    data_limit: Optional[int] = None
    expire: Optional[str] = None
    telegramId: Optional[str] = None
    email: Optional[str] = None
    description: Optional[str] = None
    tag: Optional[str] = None
    hwidDeviceLimit: Optional[int] = None
    activeInternalSquads: Optional[List[str]] = None  # List of squad UUIDs


class LastConnectedNode(BaseModel):
    """Last connected node info"""
    nodeName: Optional[str] = None
    countryCode: Optional[str] = None
    connectedAt: Optional[str] = None


class ActiveInternalSquad(BaseModel):
    """Active internal squad"""
    uuid: str
    name: str


class HappData(BaseModel):
    """Happ crypto link data"""
    cryptoLink: Optional[str] = None


class UserResponse(BaseModel):
    """User response schema matching Remna API"""
    uuid: str
    username: str
    shortUuid: str
    status: str
    expireAt: Optional[str] = None
    createdAt: str
    updatedAt: str
    usedTrafficBytes: int
    lifetimeUsedTrafficBytes: int
    trafficLimitBytes: int
    trafficLimitStrategy: str
    subLastUserAgent: Optional[str] = None
    subLastOpenedAt: Optional[str] = None
    onlineAt: Optional[str] = None
    subRevokedAt: Optional[str] = None
    lastTrafficResetAt: Optional[str] = None
    trojanPassword: Optional[str] = None
    vlessUuid: Optional[str] = None
    ssPassword: Optional[str] = None
    description: Optional[str] = None
    tag: Optional[str] = None
    telegramId: Optional[str] = None
    email: Optional[str] = None
    hwidDeviceLimit: Optional[int] = None
    firstConnectedAt: Optional[str] = None
    lastTriggeredThreshold: Optional[int] = None
    subscriptionUrl: Optional[str] = None
    activeInternalSquads: List[ActiveInternalSquad] = Field(default_factory=list)
    lastConnectedNode: Optional[LastConnectedNode] = None
    happ: Optional[HappData] = None
    
    # Computed fields for compatibility
    @property
    def used_traffic(self) -> int:
        return self.usedTrafficBytes
    
    @property
    def data_limit(self) -> Optional[int]:
        return self.trafficLimitBytes if self.trafficLimitBytes > 0 else None
    
    @property
    def expire(self) -> Optional[str]:
        return self.expireAt
    
    @property
    def created_at(self) -> str:
        return self.createdAt
    
    class Config:
        from_attributes = True


class UsersListResponse(BaseModel):
    """Users list response"""
    users: List[UserResponse]
    total: int

