import * as crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { config } from './config';
import { TelegramUser } from './types';

/**
 * Verify Telegram WebApp init data
 * Returns user data if valid
 */
export function verifyTelegramInitData(initData: string): TelegramUser {
  try {
    const urlParams = new URLSearchParams(initData);
    const entries = Object.fromEntries(urlParams.entries());
    
    // Extract hash
    const receivedHash = entries.hash;
    delete entries.hash;
    
    if (!receivedHash) {
      throw new Error('No hash in init_data');
    }
    
    // Create data check string
    const dataCheckArr = Object.keys(entries)
      .sort()
      .map(key => `${key}=${entries[key]}`);
    const dataCheckString = dataCheckArr.join('\n');
    
    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(config.telegramBotToken)
      .digest();
    
    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Verify hash
    if (calculatedHash !== receivedHash) {
      throw new Error('Invalid hash');
    }
    
    // Parse user data
    const userData: TelegramUser = JSON.parse(entries.user || '{}');
    
    return userData;
    
  } catch (error) {
    throw new Error(`Invalid Telegram init data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Express middleware to verify admin access via Telegram
 */
export function verifyAdmin(req: Request, res: Response, next: NextFunction): void {
  const initData = req.headers['x-telegram-init-data'] as string | undefined;
  
  console.log(`🔍 Auth check: init_data present: ${!!initData}, env: ${config.environment}`);
  
  // Check for init_data
  if (!initData) {
    // In development, allow browser access
    if (config.environment === 'development') {
      console.log('⚠️ Development: No init_data, returning dev user');
      (req as any).user = { id: 123456789, first_name: 'Dev User', is_dev: true };
      next();
      return;
    }
    
    res.status(401).json({
      error: 'Access denied. This app must be opened via Telegram Mini App.'
    });
    return;
  }
  
  // Verify init_data signature
  let userData: TelegramUser;
  try {
    userData = verifyTelegramInitData(initData);
    console.log(`✅ Telegram user verified: ${userData.id} (${userData.first_name})`);
  } catch (error) {
    console.log(`❌ Telegram verification failed: ${error}`);
    res.status(401).json({
      error: 'Invalid Telegram authentication data. Please reopen the app.'
    });
    return;
  }
  
  // Check if user is admin
  const userId = userData.id;
  const adminIds = config.adminIdsList;
  
  console.log(`🔍 Checking admin access: user_id=${userId}, admin_ids=${adminIds}`);
  
  if (!adminIds || adminIds.length === 0) {
    console.log('⚠️ Warning: ADMIN_TELEGRAM_IDS not configured!');
    res.status(500).json({
      error: 'Server configuration error. Please contact administrator.'
    });
    return;
  }
  
  if (!adminIds.includes(userId)) {
    console.log(`❌ Access denied: user_id ${userId} not in admin list`);
    res.status(403).json({
      error: `Access denied. Your Telegram ID (${userId}) is not authorized to access this panel.`
    });
    return;
  }
  
  console.log(`✅ Admin access granted for user_id ${userId}`);
  (req as any).user = userData;
  next();
}

/**
 * Optional admin check - attaches user if provided
 */
export function optionalAdmin(req: Request, res: Response, next: NextFunction): void {
  const initData = req.headers['x-telegram-init-data'] as string | undefined;
  
  if (!initData) {
    next();
    return;
  }
  
  try {
    const userData = verifyTelegramInitData(initData);
    (req as any).user = userData;
  } catch (error) {
    // Silent fail for optional auth
  }
  
  next();
}

