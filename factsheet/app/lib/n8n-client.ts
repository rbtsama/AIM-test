/**
 * N8N Client Library
 * 提供统一的 n8n API 调用接口
 */

export interface N8NExecuteRequest {
  workflowType: 'factsheet' | 'script' | 'audio' | 'vin-query' | string;
  data: Record<string, any>;
}

export interface N8NExecuteResponse {
  success: boolean;
  data?: any;
  error?: string;
  details?: string;
}

/**
 * 执行 n8n 工作流
 * @param workflowType 工作流类型（需要在 .env 中配置对应的 Workflow ID）
 * @param data 传递给工作流的数据
 */
export async function executeN8NWorkflow(
  workflowType: string,
  data: Record<string, any>
): Promise<N8NExecuteResponse> {
  try {
    const response = await fetch('/api/n8n', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      cache: 'no-store', // 浏览器级别禁用缓存
      body: JSON.stringify({
        workflowType,
        data,
      }),
    });

    if (!response.ok) {
      // 尝试解析错误详情
      const errorData = await response.json().catch(() => ({}));

      // 特殊处理 404 webhook 未激活错误
      if (response.status === 404) {
        return {
          success: false,
          error: '⚠️ N8N Workflow Not Active',
          details: errorData.details || 'The n8n webhook is not registered. Please activate the workflow in n8n by clicking "Execute Workflow" button.',
        };
      }

      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: errorData.details || errorData.error,
      };
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: 'Network request failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 生成 Factsheet
 * @param vin 车辆识别码
 * @param vehicleInfo 车辆信息（可选）
 */
export async function generateFactsheet(vin: string, vehicleInfo?: any) {
  return executeN8NWorkflow('factsheet', { vin, ...(vehicleInfo && { vehicleInfo }) });
}

/**
 * 生成脚本（示例）
 */
export async function generateScript(factsheet: any) {
  return executeN8NWorkflow('script', { factsheet });
}

/**
 * 生成音频（示例）
 */
export async function generateAudio(script: string, voiceId: string) {
  return executeN8NWorkflow('audio', { script, voiceId });
}