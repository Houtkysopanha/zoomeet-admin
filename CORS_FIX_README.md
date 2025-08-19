# CORS Fix Implementation

## Problem
The application was experiencing CORS errors when trying to create events because:
1. Running with `NODE_ENV=production` on localhost:3000
2. Trying to connect directly to production APIs that block CORS from localhost
3. No proxy configuration to handle cross-origin requests

## Solution Implemented

### 1. Proxy Configuration
Added `devProxy` configuration in `nuxt.config.ts` to proxy API requests through the Nuxt server, avoiding CORS issues.

### 2. Environment-Specific Configuration
- **Development**: Uses proxy endpoints (`/api/v1`, `/api/v1/admin`)
- **Production**: Uses direct API URLs

### 3. Environment Files
- `.env` - Development settings (for local development)
- `.env.development` - Development settings
- `.env.production` - Production settings

## How to Use

### For Local Development (Recommended)
```bash
npm run dev
```
This will:
- Use `NODE_ENV=development`
- Route API calls through proxy (no CORS issues)
- Connect to development APIs through proxy

### For Testing Production APIs Locally
```bash
npm run dev:prod
```
This will:
- Use `NODE_ENV=production`
- Still use proxy to avoid CORS
- Connect to production APIs through proxy

### For Testing Built Application Locally
```bash
npm run build
npm run preview:local
```
This will:
- Build the application
- Run preview with proxy enabled (no CORS issues)
- Test the built application with proxy

### For Production Build
```bash
npm run build:prod
```

### For Production Preview (Direct APIs)
```bash
npm run build:prod
npm run preview
```
This will use direct API calls (only works when deployed to production domain)

## API Endpoints

### Development Mode
- API Base: `/api/v1` (proxied to dev servers)
- Admin API: `/api/v1/admin` (proxied to dev servers)

### Production Mode
- API Base: `https://gateway.etickets.asia/api/v1`
- Admin API: `https://api-ticket.etickets.asia/api/v1/admin`

## Testing the Fix

1. Stop your current development server
2. Run `npm run dev` (development mode with proxy)
3. Try creating an event - CORS errors should be resolved
4. Check browser network tab - requests should go to `/api/v1/admin/events` instead of direct URLs

## Important Notes

- The proxy only works in development mode (`nuxt dev`)
- In production deployment, make sure to use `.env.production` settings
- The proxy configuration automatically handles CORS headers
- File uploads should work properly through the proxy