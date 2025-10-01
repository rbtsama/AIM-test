# VIN Factsheet Generator

A Remix app that generates vehicle factsheets from VIN numbers using n8n workflows, deployed on Cloudflare Pages.

## Setup for Cloudflare Pages

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the app:**
   ```bash
   npm run build
   ```

3. **Deploy to Cloudflare Pages:**
   - Connect your GitHub repository to Cloudflare Pages
   - Set build command: `npm run build`
   - Set build output directory: `build/client`
   - Set Node.js version: `22.x`

4. **Environment Variables (if needed):**
   - Set any required environment variables in Cloudflare Pages dashboard

## Local Development

```bash
npm run dev
```

## Key Changes for Cloudflare Pages

- Updated all imports from `@remix-run/node` to `@remix-run/cloudflare`
- Added Cloudflare Pages adapter
- Created `functions/_middleware.ts` for server-side rendering
- Added `wrangler.toml` configuration
- Updated build configuration for Cloudflare Workers runtime