import { json, type ActionFunctionArgs } from "@remix-run/cloudflare";

/**
 * N8N Webhook Proxy
 * 代理前端到 n8n Webhook 的请求
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    const { workflowType, data } = await request.json();

    // 根据工作流类型选择对应的 Webhook URL
    const webhookMap: Record<string, string | undefined> = {
      factsheet: "https://autoironman.app.n8n.cloud/webhook-test/329e0b33-3c4b-4b2d-b7d4-827574743150/vin/",
    };

    const webhookBaseUrl = webhookMap[workflowType];

    if (!webhookBaseUrl) {
      return json(
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
      return json(
        {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: errorText || 'No error details provided',
          debugInfo: {
            url: webhookUrl,
            status: response.status
          }
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log("[N8N Webhook] Success:", JSON.stringify(result).substring(0, 200));

    return json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("[N8N Webhook] Exception:", error);
    return json(
      { success: false, error: "Request failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}