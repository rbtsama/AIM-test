import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const workflowId = '49Lzl72NFRBeepTx'; // 你的workflow ID

    // 方法1: 尝试通过n8n公共API激活工作流
    const activateUrl = `https://autoironman.app.n8n.cloud/api/v1/workflows/${workflowId}/activate`;

    console.log(`尝试激活workflow: ${activateUrl}`);

    // 尝试激活工作流
    const activateResponse = await fetch(activateUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'N8N_API_KEY': '', // Will be set via Cloudflare environment variables
      },
      body: JSON.stringify({ active: true }),
    });

    if (activateResponse.ok) {
      console.log('工作流激活成功');
      return json({ success: true, message: '工作流已激活', method: 'public-api' });
    }

    // 方法2: 尝试直接执行工作流（这会同时激活webhook）
    const executeUrl = `https://autoironman.app.n8n.cloud/api/v1/workflows/${workflowId}/run`;

    console.log(`尝试执行workflow: ${executeUrl}`);

    const executeResponse = await fetch(executeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        // 可以传入执行参数
      }),
    });

    if (executeResponse.ok) {
      console.log('工作流执行成功');
      return json({ success: true, message: '工作流已执行并激活', method: 'execute-api' });
    }

    // 方法3: 尝试私有API端点（n8n界面使用的）
    const privateExecuteUrl = `https://autoironman.app.n8n.cloud/rest/workflows/${workflowId}/run`;

    console.log(`尝试私有API执行: ${privateExecuteUrl}`);

    const privateResponse = await fetch(privateExecuteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (privateResponse.ok) {
      console.log('通过私有API执行成功');
      return json({ success: true, message: '工作流已通过私有API激活', method: 'private-api' });
    }

    // 方法4: 尝试直接触发webhook来"唤醒"工作流
    const webhookUrl = 'https://autoironman.app.n8n.cloud/webhook-test/329e0b33-3c4b-4b2d-b7d4-827574743150/vin/TEST12345';

    console.log(`尝试触发webhook: ${webhookUrl}`);

    const webhookResponse = await fetch(webhookUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    // 即使webhook返回错误，但可能已经激活了工作流
    console.log(`Webhook响应状态: ${webhookResponse.status}`);

    return json({
      success: webhookResponse.status !== 404,
      message: webhookResponse.status === 404
        ? '工作流仍未激活，请手动在n8n界面执行一次'
        : '工作流可能已通过webhook触发激活',
      method: 'webhook-trigger',
      status: webhookResponse.status,
      attempts: {
        publicApi: activateResponse.status,
        executeApi: executeResponse.status,
        privateApi: privateResponse.status,
        webhookTrigger: webhookResponse.status,
      }
    });

  } catch (error) {
    console.error('激活工作流失败:', error);

    return json({
      success: false,
      error: '激活工作流时发生错误',
      details: error instanceof Error ? error.message : '未知错误',
      suggestion: '请手动在n8n界面点击"Execute Workflow"'
    }, { status: 500 });
  }
}