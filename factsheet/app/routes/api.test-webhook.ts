import { type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { getN8NConfig } from '../lib/env.server';

export async function loader({ context }: LoaderFunctionArgs) {
  try {
    // 检查是否在 Cloudflare 环境中
    const isCloudflare = !!(context as any)?.cloudflare?.env;

    let webhookUrl: string;

    if (isCloudflare) {
      const env = (context as any).cloudflare.env;
      webhookUrl = env.N8N_WEBHOOK_FACTSHEET || 'https://autoironman.app.n8n.cloud/webhook-test/329e0b33-3c4b-4b2d-b7d4-827574743150/vin/';
    } else {
      const config = getN8NConfig();
      webhookUrl = config.webhookFactsheet || 'https://autoironman.app.n8n.cloud/webhook-test/329e0b33-3c4b-4b2d-b7d4-827574743150/vin/';
    }

    // 测试 webhook 基础连接
    const testUrl = `${webhookUrl}2T2ZK1BAXFC181020`;

    console.log(`测试webhook连接: ${testUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'VIN-Query-App-Test/1.0',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();

    return Response.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      responseBody: responseText.substring(0, 500), // 限制响应长度
      webhookActive: response.status !== 404,
      testUrl,
      message: response.status === 404
        ? 'Webhook未激活，请先在n8n中执行workflow'
        : response.ok
          ? 'Webhook状态正常'
          : `Webhook返回错误: ${response.status}`
    });

  } catch (error) {
    console.error('Webhook测试失败:', error);

    return Response.json({
      success: false,
      status: 'error',
      error: error instanceof Error ? error.message : '测试失败',
      webhookActive: false,
      message: '无法连接到webhook，请检查网络或n8n服务状态'
    });
  }
}