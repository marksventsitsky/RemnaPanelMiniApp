import { Router, Request, Response } from 'express';
import { remnaClient } from '../remnaClient';
import { verifyAdmin } from '../auth';
import { UserCreate, UserUpdate } from '../types';

const router = Router();

// Get list of users
router.get('/', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    
    // Get all users from Remna API (without filtering)
    const result = await remnaClient.getUsers({
      offset: 0,
      limit: 1000,
      status
    });
    
    let allUsers = result.users || [];
    
    // Filter users by search query on our side
    if (search) {
      const searchLower = search.toLowerCase();
      allUsers = allUsers.filter(user => 
        user.username.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply pagination to filtered results
    const total = allUsers.length;
    const paginatedUsers = allUsers.slice(offset, offset + limit);
    
    res.json({
      users: paginatedUsers,
      total
    });
  } catch (error: any) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ 
      error: `Failed to fetch users: ${error.message}` 
    });
  }
});

// Get user by username or UUID
router.get('/:user_identifier', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const userData = await remnaClient.getUser(req.params.user_identifier);
    res.json(userData);
  } catch (error: any) {
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'User not found' });
    } else {
      console.error('Failed to fetch user:', error);
      res.status(500).json({ 
        error: `Failed to fetch user: ${error.message}` 
      });
    }
  }
});

// Create new user
router.post('/', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const user: UserCreate = req.body;
    
    // Prepare data for Remna API
    const createData: any = { ...user };
    
    // Convert data_limit to trafficLimitBytes if provided
    if ('data_limit' in createData && createData.data_limit !== null) {
      createData.trafficLimitBytes = parseInt(createData.data_limit);
      delete createData.data_limit;
    }
    
    // Handle expire date - convert to expireAt
    if ('expire' in createData) {
      createData.expireAt = createData.expire || null;
      delete createData.expire;
    }
    
    // Remna API requires expireAt field - set to null if not provided
    if (!('expireAt' in createData)) {
      createData.expireAt = null;
    }
    
    // Remove null values for optional string fields
    ['description', 'telegramId', 'email', 'tag'].forEach(field => {
      if (field in createData && createData[field] === null) {
        delete createData[field];
      }
    });
    
    // Handle activeInternalSquads - Remna API expects array of UUID strings
    if ('activeInternalSquads' in createData) {
      if (!createData.activeInternalSquads || createData.activeInternalSquads.length === 0) {
        delete createData.activeInternalSquads;
      }
    }
    
    console.log('🔍 Creating user with processed data:', createData);
    const userData = await remnaClient.createUser(createData);
    res.json(userData);
  } catch (error: any) {
    console.error('Failed to create user:', error);
    res.status(500).json({ 
      error: `Failed to create user: ${error.message}` 
    });
  }
});

// Update user
router.patch('/:user_identifier', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const username = req.params.user_identifier;
    const user: UserUpdate = req.body;
    
    const updateData: any = { ...user };
    
    // Remove username from update_data if present
    if ('username' in updateData) {
      delete updateData.username;
    }
    
    // Convert data_limit to trafficLimitBytes if provided
    if ('data_limit' in updateData && updateData.data_limit !== null) {
      updateData.trafficLimitBytes = parseInt(updateData.data_limit);
      delete updateData.data_limit;
    }
    
    // Handle expire date
    if ('expire' in updateData) {
      updateData.expireAt = updateData.expire || null;
      delete updateData.expire;
    }
    
    // Remove null values for optional string fields
    ['description', 'telegramId', 'email', 'tag'].forEach(field => {
      if (field in updateData && updateData[field] === null) {
        delete updateData[field];
      }
    });
    
    // Handle activeInternalSquads
    if ('activeInternalSquads' in updateData) {
      if (!updateData.activeInternalSquads || updateData.activeInternalSquads.length === 0) {
        delete updateData.activeInternalSquads;
      }
    }
    
    console.log('🔍 Updating user with processed data:', updateData);
    const userData = await remnaClient.updateUser(username, updateData);
    res.json(userData);
  } catch (error: any) {
    console.error('Failed to update user:', error);
    res.status(500).json({ 
      error: `Failed to update user: ${error.message}` 
    });
  }
});

// Delete user
router.delete('/:username', verifyAdmin, async (req: Request, res: Response) => {
  try {
    await remnaClient.deleteUser(req.params.username);
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ 
      error: `Failed to delete user: ${error.message}` 
    });
  }
});

// Reset user traffic
router.post('/:username/reset', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const result = await remnaClient.resetUserTraffic(req.params.username);
    res.json(result);
  } catch (error: any) {
    console.error('Failed to reset traffic:', error);
    res.status(500).json({ 
      error: `Failed to reset traffic: ${error.message}` 
    });
  }
});

// Revoke subscription
router.post('/:username/revoke', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const result = await remnaClient.revokeSubscription(req.params.username);
    res.json(result);
  } catch (error: any) {
    console.error('Failed to revoke subscription:', error);
    res.status(500).json({ 
      error: `Failed to revoke subscription: ${error.message}` 
    });
  }
});

export default router;

