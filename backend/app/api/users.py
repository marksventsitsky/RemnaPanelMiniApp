from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional
import httpx
from app.schemas.user import UserResponse, UsersListResponse, UserCreate, UserUpdate
from app.services.remna_client import remna_client
from app.core.auth import verify_admin

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=UsersListResponse)
async def get_users(
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    admin: dict = Depends(verify_admin)
):
    """Get list of users with pagination and filters"""
    try:
        # Получаем всех пользователей из Remna API (без фильтрации)
        result = await remna_client.get_users(
            offset=0,  # Получаем всех пользователей
            limit=1000,  # Большой лимит для получения всех пользователей
            status=status
        )
        
        all_users = result.get("users", [])
        
        # Фильтруем пользователей по поисковому запросу на нашей стороне
        if search:
            search_lower = search.lower()
            filtered_users = [
                user for user in all_users 
                if search_lower in user.get("username", "").lower()
            ]
        else:
            filtered_users = all_users
        
        # Применяем пагинацию к отфильтрованным результатам
        total = len(filtered_users)
        start_idx = offset
        end_idx = offset + limit
        paginated_users = filtered_users[start_idx:end_idx]
        
        return UsersListResponse(
            users=[UserResponse(**user) for user in paginated_users],
            total=total
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")


@router.get("/{user_identifier}", response_model=UserResponse)
async def get_user(user_identifier: str, admin: dict = Depends(verify_admin)):
    """Get user by username or UUID"""
    try:
        user_data = await remna_client.get_user(user_identifier)
        return UserResponse(**user_data)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="User not found")
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")


@router.post("", response_model=UserResponse)
async def create_user(user: UserCreate, admin: dict = Depends(verify_admin)):
    """Create new user"""
    try:
        # Prepare data for Remna API
        create_data = user.model_dump(exclude_unset=True)
        
        # Convert data_limit to trafficLimitBytes if provided
        if 'data_limit' in create_data and create_data['data_limit'] is not None:
            create_data['trafficLimitBytes'] = int(create_data['data_limit'])
            del create_data['data_limit']
        
        # Handle expire date - convert to expireAt
        if 'expire' in create_data:
            if create_data['expire']:
                create_data['expireAt'] = create_data['expire']
            del create_data['expire']
        
        # Remna API requires expireAt field - set to null if not provided
        if 'expireAt' not in create_data:
            create_data['expireAt'] = None
        
        # Remna API doesn't accept null for string fields - remove them or use empty string
        # Remove null values for optional string fields
        for field in ['description', 'telegramId', 'email', 'tag']:
            if field in create_data and create_data[field] is None:
                del create_data[field]
        
        # hwidDeviceLimit: 0 = disabled, >0 = enabled, null = not set
        # Keep all values as they are meaningful
        
        # Handle activeInternalSquads - Remna API expects array of UUID strings
        if 'activeInternalSquads' in create_data:
            if create_data['activeInternalSquads'] is None or len(create_data['activeInternalSquads']) == 0:
                del create_data['activeInternalSquads']
            # Keep as array of UUID strings (no conversion needed)
        
        print(f"🔍 Creating user with processed data: {create_data}")
        user_data = await remna_client.create_user(create_data)
        return UserResponse(**user_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")


@router.patch("/{user_identifier}", response_model=UserResponse)
async def update_user(user_identifier: str, user: UserUpdate, admin: dict = Depends(verify_admin)):
    """Update user"""
    try:
        # First, get user to extract username (PATCH may require username, not UUID)
        current_user = await remna_client.get_user(user_identifier)
        username = current_user.get('username')
        
        if not username:
            raise HTTPException(status_code=404, detail="User not found or username missing")
        
        update_data = user.model_dump(exclude_unset=True)
        
        # Remove username from update_data if present (it will be added by remna_client)
        if 'username' in update_data:
            del update_data['username']
        
        # Convert data_limit to trafficLimitBytes if provided
        if 'data_limit' in update_data and update_data['data_limit'] is not None:
            update_data['trafficLimitBytes'] = int(update_data['data_limit'])
            del update_data['data_limit']
        
        # Handle expire date - convert to expireAt
        if 'expire' in update_data:
            if update_data['expire']:
                update_data['expireAt'] = update_data['expire']
            else:
                update_data['expireAt'] = None
            del update_data['expire']
        
        # Remove null values for optional string fields
        for field in ['description', 'telegramId', 'email', 'tag']:
            if field in update_data and update_data[field] is None:
                del update_data[field]
        
        # hwidDeviceLimit: 0 = disabled, >0 = enabled, null = not set
        # Keep all values as they are meaningful
        
        # Handle activeInternalSquads - Remna API expects array of UUID strings
        if 'activeInternalSquads' in update_data:
            if update_data['activeInternalSquads'] is None or len(update_data['activeInternalSquads']) == 0:
                del update_data['activeInternalSquads']
            # Keep as array of UUID strings (no conversion needed)
        
        # Use username for PATCH request instead of UUID
        user_data = await remna_client.update_user(username, update_data)
        return UserResponse(**user_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")


@router.delete("/{user_identifier}")
async def delete_user(user_identifier: str, admin: dict = Depends(verify_admin)):
    """Delete user"""
    try:
        await remna_client.delete_user(user_identifier)
        return {"message": "User deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")


@router.post("/{user_identifier}/reset")
async def reset_user_traffic(user_identifier: str, admin: dict = Depends(verify_admin)):
    """Reset user traffic"""
    try:
        result = await remna_client.reset_user_traffic(user_identifier)
        return {"message": "Traffic reset successfully", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset traffic: {str(e)}")


@router.post("/{user_identifier}/revoke")
async def revoke_subscription(user_identifier: str, admin: dict = Depends(verify_admin)):
    """Revoke user subscription"""
    try:
        result = await remna_client.revoke_subscription(user_identifier)
        return {"message": "Subscription revoked successfully", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to revoke subscription: {str(e)}")

