import { type LoaderFunctionArgs } from '@remix-run/cloudflare';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const vin = url.searchParams.get('vin');

  if (!vin) {
    return Response.json({ error: 'VIN参数缺失' }, { status: 400 });
  }

  // VIN格式验证：17位字母数字组合
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  if (!vinRegex.test(vin)) {
    return Response.json({ error: 'VIN格式无效，应为17位字母数字组合' }, { status: 400 });
  }

  try {
    console.log(`开始查询VIN: ${vin}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45秒超时

    // 添加调试日志
    const webhookUrl = `https://autoironman.app.n8n.cloud/webhook-test/329e0b33-3c4b-4b2d-b7d4-827574743150/vin/${vin}`;
    console.log(`正在调用webhook: ${webhookUrl}`);

    const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'VIN-Query-App/1.0',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`VIN查询成功: ${vin}`);

    return Response.json({
      success: true,
      data,
      vin,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`VIN查询失败: ${vin}`, error);

    if (error instanceof Error && error.name === 'AbortError') {
      return Response.json({
        error: '查询超时，请稍后重试',
        details: '请求超过45秒未响应'
      }, { status: 408 });
    }

    return Response.json({
      error: '查询失败',
      details: error instanceof Error ? error.message : '未知错误',
      vin
    }, { status: 500 });
  }
}