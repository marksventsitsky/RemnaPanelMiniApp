from fastapi import APIRouter, HTTPException, Depends
from app.schemas.stats import StatsResponse, SystemStats, UsageStats, NodesStats, RemnaStatsResponse
from app.services.remna_client import remna_client
from app.core.auth import verify_admin

router = APIRouter(prefix="/stats", tags=["statistics"])


@router.get("", response_model=StatsResponse)
async def get_stats(admin: dict = Depends(verify_admin)):
    """Get system and usage statistics"""
    try:
        # Get system stats from /api/system/stats
        system_data = await remna_client.get_system_stats()
        
        # Parse system stats if available
        system_stats = None
        usage_stats = UsageStats()
        
        if system_data:
            try:
                # Remna API returns data in 'response' field
                response_data = system_data.get("response", system_data)
                
                # Create SystemStats from Remna API response
                system_stats = SystemStats(**response_data)
                
                # Extract usage statistics from system stats
                users_data = response_data.get("users", {})
                total_users = users_data.get("totalUsers", 0)
                total_traffic_str = users_data.get("totalTrafficBytes", "0")
                
                # Convert traffic string to int (handle both "123456789" and 123456789)
                try:
                    total_traffic = int(total_traffic_str)
                except (ValueError, TypeError):
                    total_traffic = 0
                
                # Get status counts - Remna uses actual status names
                status_counts = users_data.get("statusCounts", {})
                
                usage_stats = UsageStats(
                    total_users=total_users,
                    active_users=status_counts.get("ACTIVE", 0),
                    disabled_users=status_counts.get("DISABLED", 0),
                    limited_users=status_counts.get("LIMITED", 0),
                    expired_users=status_counts.get("EXPIRED", 0),
                    total_traffic=total_traffic
                )
                
            except Exception as parse_error:
                # If parsing fails, try fallback to users API
                users_data = await remna_client.get_users(limit=1000)
                users = users_data.get("users", [])
                
                total_users = len(users)
                active_users = sum(1 for u in users if u.get("status") == "active")
                disabled_users = sum(1 for u in users if u.get("status") == "disabled")
                limited_users = sum(1 for u in users if u.get("status") == "limited")
                expired_users = sum(1 for u in users if u.get("status") == "expired")
                total_traffic = sum(u.get("used_traffic", 0) for u in users)
                
                usage_stats = UsageStats(
                    total_users=total_users,
                    active_users=active_users,
                    disabled_users=disabled_users,
                    limited_users=limited_users,
                    expired_users=expired_users,
                    total_traffic=total_traffic
                )
        else:
            # Fallback: get users to calculate usage stats
            users_data = await remna_client.get_users(limit=1000)
            users = users_data.get("users", [])
            
            total_users = len(users)
            active_users = sum(1 for u in users if u.get("status") == "active")
            disabled_users = sum(1 for u in users if u.get("status") == "disabled")
            limited_users = sum(1 for u in users if u.get("status") == "limited")
            expired_users = sum(1 for u in users if u.get("status") == "expired")
            total_traffic = sum(u.get("used_traffic", 0) for u in users)
            
            usage_stats = UsageStats(
                total_users=total_users,
                active_users=active_users,
                disabled_users=disabled_users,
                limited_users=limited_users,
                expired_users=expired_users,
                total_traffic=total_traffic
            )
        
        return StatsResponse(
            system=system_stats,
            usage=usage_stats
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")


@router.get("/nodes")
async def get_nodes(admin: dict = Depends(verify_admin)):
    """Get nodes statistics"""
    try:
        nodes = await remna_client.get_nodes()
        return {"nodes": nodes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch nodes: {str(e)}")


@router.get("/squads")
async def get_squads(admin: dict = Depends(verify_admin)):
    """Get internal squads list from Remna API /api/internal-squads"""
    try:
        squads = await remna_client.get_squads()
        return {"squads": squads}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch squads: {str(e)}")

