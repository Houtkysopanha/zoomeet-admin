# Refresh Token Implementation Guide

This document explains the refresh token implementation in the zoomet-admin application.

## Overview

The refresh token system ensures that user sessions remain valid in production without requiring frequent re-authentication. When access tokens are close to expiring, they are automatically refreshed using a longer-lived refresh token.

## Key Components

### 1. useAuth.js Composable
- **Location**: `composables/useAuth.js`
- **Key Functions**:
  - `setAuth(authData)`: Stores both access and refresh tokens
  - `refreshToken()`: Automatically refreshes access token using refresh token
  - `shouldRefreshToken()`: Checks if token needs refresh (< 5 minutes remaining)
  - `ensureValidToken()`: Ensures token is valid, refreshes if needed

### 2. API Integration (api.js)
- **Location**: `composables/api.js`
- **Key Functions**:
  - `getAuthToken(autoRefresh)`: Gets current token with optional auto-refresh
  - `createAuthHeaders(includeContentType, autoRefresh)`: Creates authenticated headers with auto-refresh
  - `refreshToken(refreshToken)`: API endpoint for token refresh

### 3. Auto-Refresh Middleware
- **Location**: `middleware/token-refresh.ts`
- **Purpose**: Automatically refreshes tokens on route navigation if needed

### 4. Test Page
- **Location**: `pages/admin/test-refresh.vue`
- **Purpose**: Debug and test refresh token functionality

## Token Lifecycle

1. **Login**: User receives both access token (short-lived) and refresh token (long-lived)
2. **Storage**: Tokens stored in localStorage, sessionStorage, and cookies for reliability
3. **Usage**: API calls use access token for authentication
4. **Monitoring**: System monitors token expiration time
5. **Refresh**: When token has < 5 minutes remaining, automatic refresh is triggered
6. **Renewal**: New access token obtained using refresh token
7. **Fallback**: If refresh fails, user is redirected to login

## Configuration

### Token Expiration Times
- **Access Token**: Typically 1-2 hours (configurable by backend)
- **Refresh Token**: 30 days (configurable)
- **Refresh Threshold**: 5 minutes before expiration

### Environment Variables
- `API_BASE_URL`: Base URL for API calls
- Backend should support `/auth/refresh` endpoint

## Usage Examples

### Manual Token Refresh
```javascript
const { refreshToken } = useAuth()
const success = await refreshToken()
if (success) {
  console.log('Token refreshed successfully')
}
```

### API Calls with Auto-Refresh
```javascript
// The API automatically handles token refresh
const data = await fetchUserInfo()
```

### Check Token Status
```javascript
const { 
  isAuthenticated, 
  shouldRefreshToken, 
  getTimeUntilExpiry 
} = useAuth()

console.log('Authenticated:', isAuthenticated.value)
console.log('Needs refresh:', shouldRefreshToken())
console.log('Time until expiry:', getTimeUntilExpiry())
```

## Backend Requirements

The backend must support a refresh token endpoint:

```
POST /refresh-token
Content-Type: application/x-www-form-urlencoded (preferred) or application/json

Form data format:
refreshToken=your-refresh-token-here

Or JSON format (fallback):
{
  "refreshToken": "your-refresh-token-here"
}
```

Expected response:
```json
{
  "access_token": "new-access-token",
  "refresh_token": "new-or-same-refresh-token", 
  "expires_in": 3600,
  "user": { ... }
}
```

## Error Handling

### Refresh Failures
- **Max Attempts**: 3 attempts before forcing logout
- **Failed Refresh**: Redirects to login with session expired message
- **Invalid Refresh Token**: Clears auth and redirects to login

### Network Issues
- API calls will retry token refresh on 401 responses
- Graceful degradation for offline scenarios

## Security Considerations

1. **Token Storage**: Multiple storage methods (localStorage, sessionStorage, cookies)
2. **Automatic Cleanup**: Expired tokens are automatically removed
3. **HTTPS Only**: Tokens should only be transmitted over HTTPS in production
4. **Refresh Token Rotation**: Backend should rotate refresh tokens on each use
5. **Session Timeout**: Configurable session timeout with user warnings

## Testing

Use the test page at `/admin/test-refresh` to:
- Monitor token status in real-time
- Manually trigger token refresh
- Test API calls with current token
- Debug authentication issues

## Troubleshooting

### Common Issues

1. **Tokens Expiring Too Fast**
   - Check backend token expiration configuration
   - Verify system clocks are synchronized

2. **Refresh Failing**
   - Check network connectivity
   - Verify backend `/auth/refresh` endpoint
   - Check refresh token validity

3. **Infinite Refresh Loops**
   - Max refresh attempts prevent this (default: 3)
   - Check for system clock drift

### Debug Information

The test page provides detailed debug information including:
- Current token status
- Time until expiration
- Refresh token availability
- Recent refresh attempts

## Production Deployment

1. **Environment Variables**: Ensure all API URLs are correctly configured
2. **HTTPS**: Use HTTPS for all token operations
3. **Backend Coordination**: Ensure backend token expiration aligns with frontend refresh logic
4. **Monitoring**: Monitor refresh success rates and session durations
5. **Performance**: Consider token refresh impact on API performance

## Future Enhancements

1. **Token Rotation**: Implement refresh token rotation for enhanced security
2. **Background Refresh**: Refresh tokens in background without blocking UI
3. **Session Warnings**: Warn users before session expiry
4. **Analytics**: Track session duration and refresh patterns
5. **Offline Support**: Enhanced offline token management
