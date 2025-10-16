from pydantic import BaseModel
from typing import Optional, Dict, Any


class CPUStats(BaseModel):
    """CPU statistics"""
    cores: int = 0
    physicalCores: int = 0


class MemoryStats(BaseModel):
    """Memory statistics"""
    total: int = 0
    free: int = 0
    used: int = 0
    active: int = 0
    available: int = 0


class UserStatusCounts(BaseModel):
    """User status counts"""
    ACTIVE: int = 0
    DISABLED: int = 0
    LIMITED: int = 0
    EXPIRED: int = 0


class UsersStats(BaseModel):
    """Users statistics"""
    statusCounts: UserStatusCounts
    totalUsers: int = 0
    totalTrafficBytes: str = "0"


class OnlineStats(BaseModel):
    """Online statistics"""
    lastDay: int = 0
    lastWeek: int = 0
    neverOnline: int = 0
    onlineNow: int = 0


class NodesStats(BaseModel):
    """Nodes statistics"""
    totalOnline: int = 0


class SystemStats(BaseModel):
    """System statistics from /api/system/stats"""
    cpu: CPUStats
    memory: MemoryStats
    uptime: float = 0.0
    timestamp: int = 0
    users: UsersStats
    onlineStats: OnlineStats
    nodes: NodesStats


class RemnaStatsResponse(BaseModel):
    """Response from Remna /api/system/stats"""
    response: SystemStats


# Legacy schemas for backward compatibility
class LegacySystemStats(BaseModel):
    """Legacy system statistics schema"""
    version: Optional[str] = None
    started: Optional[bool] = None
    logs_websocket: Optional[str] = None


class UsageStats(BaseModel):
    """Usage statistics"""
    total_users: int = 0
    active_users: int = 0
    disabled_users: int = 0
    limited_users: int = 0
    expired_users: int = 0
    total_traffic: int = 0


class StatsResponse(BaseModel):
    """Main stats response"""
    system: Optional[SystemStats] = None
    usage: UsageStats

