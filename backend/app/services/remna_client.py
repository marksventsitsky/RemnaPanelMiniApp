import httpx
from typing import Optional, List, Dict, Any
from app.core.config import settings


class RemnaClient:
    """Client for interacting with Remna API"""
    
    def __init__(self):
        self.base_url = settings.REMNA_PANEL_URL.rstrip('/')
        self.api_token = settings.REMNA_API_TOKEN
        self.headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
    
    async def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make HTTP request to Remna API"""
        url = f"{self.base_url}/api{endpoint}"
        
        print(f"🔍 Making {method} request to {url}")
        if data:
            print(f"🔍 Request data: {data}")
        if params:
            print(f"🔍 Request params: {params}")
        
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=method,
                url=url,
                headers=self.headers,
                json=data,
                params=params,
                timeout=30.0
            )
            
            print(f"🔍 Response status: {response.status_code}")
            print(f"🔍 Response text: {response.text}")
            
            response.raise_for_status()
            return response.json()
    
    # User Management
    async def get_users(
        self,
        offset: int = 0,
        limit: int = 100,
        username: Optional[str] = None,
        status: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get list of users"""
        params = {
            "offset": offset,
            "limit": limit
        }
        if username:
            params["search"] = username  # Remna API uses 'search' parameter
        if status:
            params["status"] = status
            
        result = await self._request("GET", "/users", params=params)
        # Remna API returns data in 'response' field
        return result.get("response", result)
    
    async def get_user(self, username: str) -> Dict[str, Any]:
        """Get user by username"""
        print(f"🔍 Getting user: {username}")
        result = await self._request("GET", f"/users/{username}")
        print(f"🔍 Get user response: {result}")
        return result.get("response", result)
    
    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new user"""
        print(f"🔍 Creating user with data: {user_data}")
        result = await self._request("POST", "/users", data=user_data)
        print(f"🔍 Create user response: {result}")
        return result.get("response", result)
    
    async def update_user(self, username: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user - uuid is passed in the body, not username"""
        # Get user by username to get UUID
        user_info = await self.get_user(username)
        uuid = user_info.get('uuid')
        
        if not uuid:
            raise ValueError(f"User {username} not found or UUID missing")
        
        # Add uuid to the data payload as per Remna API requirements
        user_data['uuid'] = uuid
        result = await self._request("PATCH", "/users", data=user_data)
        return result.get("response", result)
    
    async def delete_user(self, username: str) -> Dict[str, Any]:
        """Delete user"""
        return await self._request("DELETE", f"/users/{username}")
    
    async def reset_user_traffic(self, username: str) -> Dict[str, Any]:
        """Reset user traffic"""
        return await self._request("POST", f"/users/{username}/reset")
    
    async def revoke_subscription(self, username: str) -> Dict[str, Any]:
        """Revoke user subscription"""
        return await self._request("POST", f"/users/{username}/revoke")
    
    # System & Stats
    async def get_system_stats(self) -> Dict[str, Any]:
        """Get system statistics from /api/system/stats"""
        try:
            result = await self._request("GET", "/system/stats")
            return result
        except Exception:
            # Если эндпоинт не существует, возвращаем пустой словарь
            return {}
    
    async def get_core_stats(self) -> Dict[str, Any]:
        """Get core statistics"""
        try:
            return await self._request("GET", "/core")
        except Exception:
            return {}
    
    async def get_nodes(self) -> List[Dict[str, Any]]:
        """Get nodes information"""
        try:
            result = await self._request("GET", "/nodes")
            return result if isinstance(result, list) else []
        except Exception:
            return []
    
    async def get_squads(self) -> List[Dict[str, Any]]:
        """Get internal squads information from /api/internal-squads"""
        try:
            result = await self._request("GET", "/internal-squads")
            # Remna API возвращает данные в формате {"response": {"internalSquads": [...]}}
            if isinstance(result, dict) and "response" in result:
                response = result["response"]
                if isinstance(response, dict) and "internalSquads" in response:
                    return response["internalSquads"]
            return []
        except Exception:
            return []


remna_client = RemnaClient()

