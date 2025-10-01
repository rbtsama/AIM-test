// 环境变量加载器 - 仅在服务器端使用
let envLoaded = false;

function loadEnvFile() {
  if (envLoaded || typeof process === 'undefined') return;
  
  try {
    // 在 Node.js 环境中加载 dotenv
    if (typeof require !== 'undefined') {
      const dotenv = require('dotenv');
      const path = require('path');
      const fs = require('fs');
      
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
      }
    }
    envLoaded = true;
  } catch (error) {
    console.warn('Failed to load .env file:', error);
  }
}

export function getEnvVar(key: string, fallback?: string): string | undefined {
  // 确保 .env 文件已加载
  loadEnvFile();
  
  // 从 process.env 获取
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  return fallback;
}

export function getN8NConfig() {
  return {
    apiKey: getEnvVar('N8N_API_KEY'),
    baseUrl: getEnvVar('N8N_BASE_URL', 'https://autoironman.app.n8n.cloud'),
    workflowFactsheet: getEnvVar('N8N_WORKFLOW_FACTSHEET', '49Lzl72NFRBeepTx'),
    webhookFactsheet: getEnvVar('N8N_WEBHOOK_FACTSHEET', 'https://autoironman.app.n8n.cloud/webhook-test/329e0b33-3c4b-4b2d-b7d4-827574743150/vin/'),
  };
}