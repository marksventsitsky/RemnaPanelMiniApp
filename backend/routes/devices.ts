import { Router, Request, Response } from 'express';
import { remnaClient } from '../remnaClient';
import { verifyAdmin } from '../auth';
import { HwidDevice } from '../types';

const router = Router();

// Get devices for a user
router.get('/:userUuid', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const userUuid = req.params.userUuid;
    
    const devices = await remnaClient.getUserDevices(userUuid);
    res.json({ devices });
  } catch (error: any) {
    console.error('Failed to fetch devices:', error);
    res.status(500).json({ 
      error: `Failed to fetch devices: ${error.message}` 
    });
  }
});

// Delete a device - requires userUuid and hwid in request body
router.delete('/', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { userUuid, hwid } = req.body;
    
    if (!userUuid || !hwid) {
      res.status(400).json({ error: 'userUuid and hwid are required in request body' });
      return;
    }
    
    await remnaClient.deleteDevice(userUuid, hwid);
    res.json({ message: 'Device deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete device:', error);
    res.status(500).json({ 
      error: `Failed to delete device: ${error.message}` 
    });
  }
});

export default router;
