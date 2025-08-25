# Production Deployment Checklist

## Pre-Deployment Steps

### 1. Environment Setup
- [ ] Create `.env` file with production values
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper API URLs
- [ ] Set secure JWT secret

### 2. Code Cleanup
- [ ] Replace console.log with logger utility
- [ ] Remove development-only code
- [ ] Validate all API endpoints
- [ ] Test authentication flow

### 3. Security
- [ ] Enable secure cookies (`secureCookies: true`)
- [ ] Set proper cookie domain
- [ ] Validate CORS settings
- [ ] Check CSP headers

### 4. Performance
- [ ] Enable gzip compression
- [ ] Optimize image sizes
- [ ] Minimize bundle size
- [ ] Configure CDN if needed

### 5. Testing
- [ ] Test token refresh in production
- [ ] Verify all API calls work
- [ ] Test authentication flow
- [ ] Check error handling

## Build Commands

```bash
# Production build
npm run build:prod

# Start production server
npm run start

# Or for static generation
npm run generate
```

## Environment Variables (Production)

```env
NODE_ENV=production
NUXT_PUBLIC_API_BASE_URL=https://gateway.etickets.asia/api/v1
NUXT_PUBLIC_API_ADMIN_BASE_URL=https://api-ticket.etickets.asia/api/v1/admin
NUXT_PUBLIC_APP_NAME=eTicketsAsia
TOKEN_SECRET=your-production-jwt-secret
```

## Known Production Considerations

1. **Token Management**: ✅ Robust refresh mechanism implemented
2. **API Calls**: ✅ All endpoints use async authentication
3. **Error Handling**: ✅ Comprehensive error handling in place
4. **Session Persistence**: ✅ Multi-storage approach (localStorage, sessionStorage, cookies)
5. **CORS**: ✅ Proxy configuration handles CORS issues

## Monitoring & Maintenance

- Monitor token refresh rates
- Check authentication error rates
- Monitor API response times
- Set up error logging/reporting
