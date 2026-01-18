import { Router, Request, Response } from 'express';
import { remnaClient } from '../remnaClient';
import { verifyAdmin } from '../auth';

const router = Router();

// Get system and usage statistics
router.get('/', verifyAdmin, async (req: Request, res: Response) => {
  try {
    // Get system stats
    const systemData = await remnaClient.getSystemStats();
    
    let systemStats = null;
    let usageStats = {
      total_users: 0,
      active_users: 0,
      disabled_users: 0,
      limited_users: 0,
      expired_users: 0,
      total_traffic: 0
    };
    
    if (systemData && Object.keys(systemData).length > 0) {
      try {
        const responseData = systemData.response || systemData;
        systemStats = responseData;
        
        // Extract usage statistics
        const usersData = responseData.users || {};
        const totalUsers = usersData.totalUsers || 0;
        const totalTrafficStr = usersData.totalTrafficBytes || '0';
        
        // Convert traffic to number with validation
        let totalTraffic = 0;
        try {
          const parsed = parseInt(totalTrafficStr.toString(), 10);
          // Check if parsed is valid number
          if (!isNaN(parsed) && isFinite(parsed)) {
            totalTraffic = parsed;
          }
        } catch (e) {
          totalTraffic = 0;
        }
        
        const statusCounts = usersData.statusCounts || {};
        
        usageStats = {
          total_users: totalUsers,
          active_users: statusCounts.ACTIVE || 0,
          disabled_users: statusCounts.DISABLED || 0,
          limited_users: statusCounts.LIMITED || 0,
          expired_users: statusCounts.EXPIRED || 0,
          total_traffic: totalTraffic
        };
      } catch (parseError) {
        // Fallback: get users to calculate stats
        const usersData = await remnaClient.getUsers({ limit: 1000 });
        const users = usersData.users || [];
        
        // Calculate traffic from userTraffic object (new API format) or flat structure (old format)
        const getTrafficBytes = (u: any) => {
          if (u.userTraffic?.usedTrafficBytes != null) {
            return u.userTraffic.usedTrafficBytes;
          }
          return u.usedTrafficBytes || 0;
        };
        
        usageStats = {
          total_users: users.length,
          active_users: users.filter(u => u.status === 'ACTIVE').length,
          disabled_users: users.filter(u => u.status === 'INACTIVE').length,
          limited_users: 0,
          expired_users: users.filter(u => u.status === 'EXPIRED').length,
          total_traffic: users.reduce((sum, u) => sum + getTrafficBytes(u), 0)
        };
      }
    } else {
      // Fallback: get users
      const usersData = await remnaClient.getUsers({ limit: 1000 });
      const users = usersData.users || [];
      
      // Calculate traffic from userTraffic object (new API format) or flat structure (old format)
      const getTrafficBytes = (u: any) => {
        if (u.userTraffic?.usedTrafficBytes != null) {
          return u.userTraffic.usedTrafficBytes;
        }
        return u.usedTrafficBytes || 0;
      };
      
      usageStats = {
        total_users: users.length,
        active_users: users.filter(u => u.status === 'ACTIVE').length,
        disabled_users: users.filter(u => u.status === 'INACTIVE').length,
        limited_users: 0,
        expired_users: users.filter(u => u.status === 'EXPIRED').length,
        total_traffic: users.reduce((sum, u) => sum + getTrafficBytes(u), 0)
      };
    }
    
    res.json({
      system: systemStats,
      usage: usageStats
    });
  } catch (error: any) {
    console.error('Failed to fetch stats:', error);
    res.status(500).json({ 
      error: `Failed to fetch stats: ${error.message}` 
    });
  }
});

// Get nodes statistics
router.get('/nodes', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const nodes = await remnaClient.getNodes();
    res.json({ nodes });
  } catch (error: any) {
    console.error('Failed to fetch nodes:', error);
    res.status(500).json({ 
      error: `Failed to fetch nodes: ${error.message}` 
    });
  }
});

// Get internal squads
router.get('/squads', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const squads = await remnaClient.getSquads();
    res.json({ squads });
  } catch (error: any) {
    console.error('Failed to fetch squads:', error);
    res.status(500).json({ 
      error: `Failed to fetch squads: ${error.message}` 
    });
  }
});

export default router;

