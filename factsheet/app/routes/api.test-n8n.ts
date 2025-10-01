import { type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getN8NConfig } from "../lib/env.server";

/**
 * 测试 n8n 连接
 * GET /api/test-n8n
 */
export async function loader({ context }: LoaderFunctionArgs) {
  try {
    // 检查是否在 Cloudflare 环境中
    const isCloudflare = !!(context as any)?.cloudflare?.env;

    let apiKey: string | undefined;
    let baseUrl: string;
    let workflowId: string;

    if (isCloudflare) {
      // 生产环境：使用 Cloudflare 环境变量
      const env = (context as any).cloudflare.env;
      apiKey = env.N8N_API_KEY;
      baseUrl = env.N8N_BASE_URL || "https://autoironman.app.n8n.cloud";
      workflowId = env.N8N_WORKFLOW_FACTSHEET || "49Lzl72NFRBeepTx";
    } else {
      // 开发环境：使用本地环境变量
      const config = getN8NConfig();
      apiKey = config.apiKey;
      baseUrl = config.baseUrl || "https://autoironman.app.n8n.cloud";
      workflowId = config.workflowFactsheet || "49Lzl72NFRBeepTx";
    }

    // 调试信息
    console.log("[Debug] Environment variables:", {
      isCloudflare,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      baseUrl,
      workflowId,
      source: isCloudflare ? 'cloudflare' : 'local'
    });

    // 检查环境变量
    if (!apiKey) {
      return Response.json({
        success: false,
        error: "N8N_API_KEY not configured",
        debug: {
          isCloudflare,
          source: isCloudflare ? 'cloudflare' : 'local',
          hasApiKey: !!apiKey,
          config: isCloudflare ? 'cloudflare env' : getN8NConfig()
        }
      }, { status: 500 });
    }

    if (!baseUrl) {
      return Response.json({
        success: false,
        error: "N8N_BASE_URL not configured",
      }, { status: 500 });
    }

    if (!workflowId) {
      return Response.json({
        success: false,
        error: "N8N_WORKFLOW_FACTSHEET not configured",
      }, { status: 500 });
    }

    // 测试获取工作流信息（云端 n8n API）
    const testUrl = `${baseUrl}/api/v1/workflows/${workflowId}`;
    console.log(`[Test] Testing n8n cloud connection: ${testUrl}`);

    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        "X-N8N-API-KEY": apiKey,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Test] N8N API Error:", errorText);
      return Response.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: errorText,
        config: {
          baseUrl,
          workflowId,
          hasApiKey: !!apiKey,
        }
      }, { status: response.status });
    }

    const workflowData = await response.json() as any;

    return Response.json({
      success: true,
      message: "N8N connection successful",
      workflow: {
        id: workflowData.id || workflowData.data?.id,
        name: workflowData.name || workflowData.data?.name,
        active: workflowData.active || workflowData.data?.active,
      },
      config: {
        baseUrl,
        workflowId,
      }
    });

  } catch (error) {
    console.error("[Test] Error:", error);
    return Response.json({
      success: false,
      error: "Connection test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}