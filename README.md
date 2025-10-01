# VIN Factsheet Generator

A Remix app that generates vehicle factsheets from VIN numbers using n8n workflows, deployed on Cloudflare Pages.

## Project Structure

The project is organized with all source code in the `factsheet/` directory:

```
factsheet/
├── app/                          # Remix application code
│   ├── routes/                   # Route modules (file-based routing)
│   │   ├── _index.tsx           # Home page - VIN input & factsheet generation
│   │   ├── test.tsx             # Test page for development
│   │   ├── api.n8n.ts           # N8N webhook proxy API
│   │   ├── api.vin.ts           # VIN query API (deprecated)
│   │   ├── api.activate-workflow.ts  # Workflow activation API
│   │   ├── api.test-n8n.ts      # N8N connection test API
│   │   └── api.test-webhook.ts  # Webhook status test API
│   │
│   ├── lib/                     # Shared libraries & utilities
│   │   ├── n8n-client.ts       # N8N API client with error handling
│   │   └── env.server.ts       # Server-side environment config (Cloudflare-compatible)
│   │
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts            # Shared types (Project, VehicleInfo, etc.)
│   │
│   ├── styles/                  # Global styles
│   │   └── globals.css         # Tailwind CSS imports & custom styles
│   │
│   └── root.tsx                 # App root with layout & meta tags
│
├── public/                       # Static assets (served directly)
│
├── build/                        # Build output (generated)
│   ├── client/                  # Client-side bundle
│   └── server/                  # Server-side bundle
│
├── .env                         # Environment variables (local only, not committed)
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies and scripts
├── vite.config.ts              # Vite configuration (ports, aliases, SSR)
├── tsconfig.json               # TypeScript configuration
└── CLOUDFLARE_SETUP.md         # Cloudflare deployment guide
```

### Key Files Explained

#### Routes (`app/routes/`)
- **`_index.tsx`**: Main UI - VIN input form with real-time progress tracking
- **`api.n8n.ts`**: Proxy API that forwards requests to N8N webhooks with proper error handling
- **`api.activate-workflow.ts`**: Uses N8N API to activate/check workflow status

#### Libraries (`app/lib/`)
- **`n8n-client.ts`**:
  - Unified N8N API client
  - Handles webhook calls with no-cache headers
  - Error handling with user-friendly messages

- **`env.server.ts`**:
  - Environment variable loader (Cloudflare Pages compatible)
  - No `dotenv` dependency (uses `process.env` directly)
  - Provides `getN8NConfig()` helper

#### Configuration Files
- **`vite.config.ts`**:
  - Server port: 3000 (auto-fallback to 3001, 3002)
  - No-cache headers for development
  - SSR configuration for Cloudflare Workers

- **`.env.example`**: Template for required environment variables

## Cloudflare Pages Deployment

**Settings:**
- **Root directory**: `factsheet`
- **Build command**: `npm run build`
- **Build output directory**: `build/client`
- **Node.js version**: `22.x`

## Local Development

1. **Navigate to the factsheet directory:**
   ```bash
   cd factsheet
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production (optional):**
   ```bash
   npm run build
   ```

## Architecture Overview

### Tech Stack
- **Frontend Framework**: Remix v2 (React-based, SSR/SSG)
- **UI Library**: HeroUI (Tailwind-based components)
- **Styling**: Tailwind CSS with custom configuration
- **Type Safety**: TypeScript (strict mode)
- **Build Tool**: Vite v5
- **Deployment**: Cloudflare Pages (Workers runtime)
- **Workflow Engine**: N8N (cloud-hosted)

### Data Flow

```
User Input (VIN)
    ↓
Frontend (_index.tsx)
    ↓
n8n-client.ts → POST /api/n8n
    ↓
api.n8n.ts (Proxy)
    ↓
N8N Production Webhook
    ↓
N8N Workflow Execution
    ↓
Response ← Vehicle Factsheet Data
    ↓
Frontend Display (JSON/Formatted)
```

### API Routes

| Route | Method | Purpose | Environment Variables |
|-------|--------|---------|----------------------|
| `/api/n8n` | POST | Proxy to N8N webhook | `N8N_WEBHOOK_FACTSHEET` |
| `/api/activate-workflow` | GET | Check/activate workflow | `N8N_API_KEY`, `N8N_WORKFLOW_FACTSHEET` |
| `/api/test-webhook` | GET | Test webhook connectivity | `N8N_WEBHOOK_FACTSHEET` |
| `/api/vin` | GET | Legacy VIN query (deprecated) | - |

### Environment Variables

**Required for production:**
```bash
N8N_API_KEY=<your-n8n-api-key>
N8N_BASE_URL=https://autoironman.app.n8n.cloud
N8N_WORKFLOW_FACTSHEET=49Lzl72NFRBeepTx
N8N_WEBHOOK_FACTSHEET=https://autoironman.app.n8n.cloud/webhook/329e0b33-3c4b-4b2d-b7d4-827574743150/vin/
```

See [CLOUDFLARE_SETUP.md](factsheet/CLOUDFLARE_SETUP.md) for deployment instructions.

### Key Features

- ✅ **VIN Validation**: 17-character alphanumeric format check
- ✅ **N8N Integration**: Webhook-based workflow execution
- ✅ **Real-time Progress**: 30-second countdown with progress bar
- ✅ **Error Handling**: User-friendly error messages with solutions
- ✅ **No Caching**: Always fetch fresh data from N8N
- ✅ **Cloudflare Ready**: Optimized for Cloudflare Pages deployment
- ✅ **Type Safety**: Full TypeScript coverage

### Development Features

- 🔥 Hot Module Replacement (HMR)
- 🚫 No browser caching (development mode)
- 🔄 Auto-reload on file changes
- 📝 TypeScript strict mode
- 🎨 Tailwind CSS with JIT compiler
- 🧪 Debug tools available at `/test` route