import { json } from '@remix-run/node';

export async function loader() {
  try {
    // 测试webhook基础连接
    const testUrl = 'https://autoironman.app.n8n.cloud/webhook-test/329e0b33-3c4b-4b2d-b7d4-827574743150/vin/2T2ZK1BAXFC181020';

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

    return json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      webhookActive: response.status !== 404,
      message: response.status === 404
        ? 'Webhook未激活，请先在n8n中执行workflow'
        : 'Webhook状态正常'
    });

  } catch (error) {
    console.error('Webhook测试失败:', error);

    return json({
      status: 'error',
      error: error instanceof Error ? error.message : '测试失败',
      webhookActive: false,
      message: '无法连接到webhook，请检查网络或n8n服务状态'
    });
  }
}