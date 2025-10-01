# Cloudflare Pages 部署配置

## 环境变量设置

在 Cloudflare Pages 控制台中设置以下环境变量：

### 必需的环境变量

进入项目设置 → Environment Variables，添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `N8N_API_KEY` | `your-n8n-api-key` | N8N API 密钥 |
| `N8N_BASE_URL` | `https://autoironman.app.n8n.cloud` | N8N 实例 URL |
| `N8N_WORKFLOW_FACTSHEET` | `49Lzl72NFRBeepTx` | Factsheet workflow ID |
| `N8N_WEBHOOK_FACTSHEET` | `https://autoironman.app.n8n.cloud/webhook/329e0b33-3c4b-4b2d-b7d4-827574743150/vin/` | 生产 webhook URL |

### 设置步骤

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择你的 Pages 项目
3. 进入 **Settings** → **Environment variables**
4. 点击 **Add variable**
5. 添加上述所有变量
6. 选择环境：**Production** 和 **Preview** 都需要添加
7. 点击 **Save**

### 注意事项

⚠️ **重要**：
- Cloudflare Pages 不支持 `.env` 文件
- 所有环境变量必须通过控制台设置
- 修改环境变量后需要重新部署才能生效

### 验证配置

部署成功后，访问你的网站并测试 VIN 查询功能。如果出现错误，检查：

1. 环境变量是否正确设置
2. N8N webhook 是否激活
3. 浏览器控制台查看详细错误信息

## 本地开发

本地开发使用 `.env` 文件（不会提交到 Git）：

```bash
cp .env.example .env
# 编辑 .env 文件，填入真实的 API Key
```

本地环境变量会被 Vite 自动加载。