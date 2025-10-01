import { type ActionFunctionArgs } from "@remix-run/cloudflare";

/**
 * N8N Webhook Proxy
 * 代理前端到 n8n Webhook 的请求
 */
export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const { workflowType, data } = await request.json() as any;
    const env = (context.cloudflare as any)?.env || {};

    // 本地开发时回退到 process.env，生产环境使用 Cloudflare env
    const webhookFactsheet = env.N8N_WEBHOOK_FACTSHEET || (typeof process !== 'undefined' ? process.env.N8N_WEBHOOK_FACTSHEET : undefined);

    // 根据工作流类型选择对应的 Webhook URL
    const webhookMap: Record<string, string | undefined> = {
      factsheet: webhookFactsheet || "https://autoironman.app.n8n.cloud/webhook/329e0b33-3c4b-4b2d-b7d4-827574743150/vin/",
    };

    const webhookBaseUrl = webhookMap[workflowType];

    if (!webhookBaseUrl) {
      return Response.json(
        { success: false, error: `Invalid workflow type: ${workflowType}` },
        { status: 400 }
      );
    }

    // 构建完整的 Webhook URL（VIN 作为路径参数）
    const vin = data.vin || '';
    const webhookUrl = `${webhookBaseUrl}${vin}`;

    console.log(`[N8N Webhook] Calling: ${workflowType}`);
    console.log(`[N8N Webhook] URL: ${webhookUrl}`);
    console.log(`[N8N Webhook] VIN: ${vin}`);
    console.log(`[N8N Webhook] Data:`, JSON.stringify(data));

    const response = await fetch(webhookUrl, {
      method: "GET", // Webhook 通常使用 GET，VIN 在 URL 中
      headers: {
        "Accept": "application/json",
        "User-Agent": "AIM-Factsheet-App/1.0",
      },
    });

    console.log(`[N8N Webhook] Response status: ${response.status}`);
    console.log(`[N8N Webhook] Response headers:`, JSON.stringify(Object.fromEntries(response.headers.entries())));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[N8N Webhook] Error response:", errorText);
      console.error("[N8N Webhook] Full error details:", {
        status: response.status,
        statusText: response.statusText,
        url: webhookUrl,
        responseBody: errorText
      });

      // 尝试解析 n8n 的 JSON 错误响应
      let n8nError: any = {};
      try {
        n8nError = JSON.parse(errorText);
      } catch {
        // 如果不是 JSON，使用原始文本
      }

      // 通用的 no-cache headers
      const noCacheHeaders = {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      };

      // 404 错误特殊处理 - webhook 未激活
      if (response.status === 404 && n8nError.hint) {
        return Response.json(
          {
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`,
            details: `⚠️ N8N Webhook Not Registered\n\n${n8nError.message}\n\n💡 Solution: ${n8nError.hint}`,
            n8nHint: n8nError.hint,
            debugInfo: {
              url: webhookUrl,
              status: response.status,
              webhookId: "329e0b33-3c4b-4b2d-b7d4-827574743150"
            }
          },
          { status: response.status, headers: noCacheHeaders }
        );
      }

      return Response.json(
        {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: errorText || 'No error details provided',
          debugInfo: {
            url: webhookUrl,
            status: response.status
          }
        },
        { status: response.status, headers: noCacheHeaders }
      );
    }

    const result = await response.json();
    console.log("[N8N Webhook] Success:", JSON.stringify(result).substring(0, 200));

    return Response.json(
      {
        success: true,
        data: result,
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );

  } catch (error) {
    console.error("[N8N Webhook] Exception:", error);
    return Response.json(
      { success: false, error: "Request failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}