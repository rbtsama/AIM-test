// 环境变量读取器 - 仅在服务器端使用
// 注意：Cloudflare Pages 不支持 dotenv，环境变量通过 Cloudflare 控制台设置
export function getEnvVar(key: string, fallback?: string): string | undefined {
  // 直接从 process.env 获取（本地开发时会从 .env 自动加载，Cloudflare 从控制台获取）
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
    webhookFactsheet: getEnvVar('N8N_WEBHOOK_FACTSHEET', 'https://autoironman.app.n8n.cloud/webhook/329e0b33-3c4b-4b2d-b7d4-827574743150/vin/'),
  };
}