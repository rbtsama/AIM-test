import { type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { getN8NConfig } from '../lib/env.server';

export async function loader({ context }: LoaderFunctionArgs) {
  try {
    // 优先使用 Cloudflare env，本地开发使用 .env 文件
    const env = (context.cloudflare as any)?.env || {};
    const config = getN8NConfig();

    const workflowId = env.N8N_WORKFLOW_FACTSHEET || config.workflowFactsheet;
    const apiKey = env.N8N_API_KEY || config.apiKey;
    const baseUrl = env.N8N_BASE_URL || config.baseUrl;

    console.log(`🔑 N8N Config:`, {
      baseUrl,
      workflowId,
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 20) + '...' : 'MISSING'
    });

    if (!apiKey) {
      return Response.json({
        success: false,
        error: '❌ N8N_API_KEY not configured',
        details: 'Please set N8N_API_KEY in .env file or Cloudflare environment variables'
      }, { status: 500 });
    }

    // 步骤1: 先获取当前 workflow 配置
    const getUrl = `${baseUrl}/api/v1/workflows/${workflowId}`;
    console.log(`📥 获取 workflow 配置: ${getUrl}`);

    const getResponse = await fetch(getUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-N8N-API-KEY': apiKey,
      },
    });

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.error('❌ 获取 workflow 失败:', errorText);
      return Response.json({
        success: false,
        error: `Failed to get workflow: ${getResponse.status}`,
        details: errorText
      }, { status: getResponse.status });
    }

    const workflow = await getResponse.json();
    console.log(`📋 当前 workflow 状态: active=${workflow.active}`);

    // 如果已经激活，直接返回成功
    if (workflow.active === true) {
      console.log('✅ Workflow 已经处于激活状态');
      return Response.json({
        success: true,
        message: '✅ Workflow is already active',
        data: { id: workflow.id, name: workflow.name, active: workflow.active }
      });
    }

    // 步骤2: 使用 PUT 更新 workflow 为激活状态
    const updateUrl = `${baseUrl}/api/v1/workflows/${workflowId}`;
    console.log(`🚀 激活 workflow (PUT): ${updateUrl}`);

    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-N8N-API-KEY': apiKey,
      },
      body: JSON.stringify({
        ...workflow,
        active: true,
      }),
    });

    console.log(`📡 更新响应状态: ${updateResponse.status}`);

    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log('✅ 工作流激活成功:', result);
      return Response.json({
        success: true,
        message: '✅ Workflow activated successfully',
        method: 'n8n-api-put',
        data: { id: result.id, name: result.name, active: result.active }
      });
    }

    // 激活失败，返回详细错误信息
    const errorText = await updateResponse.text();
    let errorData: any = {};
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    console.error('❌ 工作流激活失败:', {
      status: updateResponse.status,
      statusText: updateResponse.statusText,
      error: errorData
    });

    return Response.json({
      success: false,
      error: `Failed to activate workflow: ${updateResponse.status} ${updateResponse.statusText}`,
      details: errorData.message || errorText,
      debugInfo: {
        url: updateUrl,
        status: updateResponse.status,
        workflowId,
        hasApiKey: !!apiKey
      }
    }, { status: updateResponse.status });

  } catch (error) {
    console.error('激活工作流失败:', error);

    return Response.json({
      success: false,
      error: '激活工作流时发生错误',
      details: error instanceof Error ? error.message : '未知错误',
      suggestion: '请手动在n8n界面点击"Execute Workflow"'
    }, { status: 500 });
  }
}