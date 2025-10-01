import { json } from "@remix-run/cloudflare";

/**
 * 测试 n8n 连接
 * GET /api/test-n8n
 */
export async function loader() {
  try {
    const apiKey = ""; // Will be set via Cloudflare environment variables
    const baseUrl = "https://autoironman.app.n8n.cloud";
    const workflowId = "49Lzl72NFRBeepTx";

    // 检查环境变量
    if (!apiKey) {
      return json({
        success: false,
        error: "N8N_API_KEY not configured",
      }, { status: 500 });
    }

    if (!baseUrl) {
      return json({
        success: false,
        error: "N8N_BASE_URL not configured",
      }, { status: 500 });
    }

    if (!workflowId) {
      return json({
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
      return json({
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

    const workflowData = await response.json();

    return json({
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
    return json({
      success: false,
      error: "Connection test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}