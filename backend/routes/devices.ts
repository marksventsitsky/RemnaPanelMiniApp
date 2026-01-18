import { Router, Request, Response } from 'express';
import { remnaClient } from '../remnaClient';
import { verifyAdmin } from '../auth';
import { HwidDevice } from '../types';

const router = Router();

// Get devices for a user
router.get('/', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const userUuid = req.query.userUuid as string;
    
    if (!userUuid) {
      res.status(400).json({ error: 'userUuid parameter is required' });
      return;
    }
    
    const devices = await remnaClient.getUserDevices(userUuid);
    res.json({ devices });
  } catch (error: any) {
    console.error('Failed to fetch devices:', error);
    res.status(500).json({ 
      error: `Failed to fetch devices: ${error.message}` 
    });
  }
});

// Delete a device
router.delete('/:deviceUuid', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const deviceUuid = req.params.deviceUuid;
    await remnaClient.deleteDevice(deviceUuid);
    res.json({ message: 'Device deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete device:', error);
    res.status(500).json({ 
      error: `Failed to delete device: ${error.message}` 
    });
  }
});

export default router;
