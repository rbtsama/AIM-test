# VIN Factsheet Generator

A Remix app that generates vehicle factsheets from VIN numbers using n8n workflows, deployed on Cloudflare Pages.

## Project Structure

The project is organized with all source code in the `factsheet/` directory:

```
factsheet/
├── app/                 # Remix application code
├── functions/           # Cloudflare Pages Functions
├── public/              # Static assets
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── remix.config.js      # Remix configuration
```

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

## Features

- VIN validation and lookup
- N8N workflow integration
- Real-time progress tracking
- Cloudflare Pages deployment ready