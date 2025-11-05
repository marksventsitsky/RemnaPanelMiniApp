// Bun automatically loads .env files, no need for dotenv package

export interface Config {
  // Remna Panel Settings
  remnaPanelUrl: string;
  remnaApiToken: string;
  
  // Telegram Settings
  telegramBotToken: string;
  adminTelegramIds: string;
  
  // App Settings
  secretKey: string;
  environment: string;
  port: number;
  
  // Computed
  adminIdsList: number[];
}

function parseAdminIds(idsString: string): number[] {
  if (!idsString) return [];
  return idsString
    .split(',')
    .map(id => id.trim())
    .filter(id => id)
    .map(id => parseInt(id, 10))
    .filter(id => !isNaN(id));
}

export const config: Config = {
  remnaPanelUrl: process.env.REMNA_PANEL_URL || '',
  remnaApiToken: process.env.REMNA_API_TOKEN || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  adminTelegramIds: process.env.ADMIN_TELEGRAM_IDS || '',
  secretKey: process.env.SECRET_KEY || '',
  environment: process.env.ENVIRONMENT || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  get adminIdsList() {
    return parseAdminIds(this.adminTelegramIds);
  }
};

// Validate required environment variables
const requiredVars = ['REMNA_PANEL_URL', 'REMNA_API_TOKEN', 'TELEGRAM_BOT_TOKEN', 'SECRET_KEY'];
const missing = requiredVars.filter(key => !process.env[key]);

if (missing.length > 0 && config.environment === 'production') {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

