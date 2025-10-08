# Enhanced Token Management System

This document explains the new robust token management system implemented for Zoomeet Admin.

## Overview

The new system provides:
- **Automatic token refresh**: Tokens are refreshed 5 minutes before expiry
- **Intelligent monitoring**: Proactive token health checks
- **Long-lived sessions**: Up to 10 days with refresh tokens
- **Seamless UX**: Users stay logged in without interruptions
- **Error handling**: Graceful fallbacks and user notifications

## Key Components

### 1. useAuth Composable (`composables/useAuth.js`)

The core authentication composable that handles:
- Token storage and retrieval
- Token expiration checks
- Automatic token refresh
- User session management

```javascript
const { 
  user,
  isAuthenticated, 
  setAuth, 
  clearAuth, 
  refreshToken,
  getTokenStatus 
} = useAuth()
```

### 2. useTokenManager Composable (`composables/useTokenManager.js`)

Intelligent token monitoring system that:
- Monitors token health in real-time
- Automatically refreshes tokens before expiry
- Handles visibility changes and window focus
- Provides comprehensive error handling

```javascript
const { 
  startTokenMonitoring, 
  getTokenHealth,
  isMonitoring 
} = useTokenManager()
```

### 3. Enhanced API Layer (`composables/api.js`)

Updated API functions that:
- Automatically handle token refresh on API calls
- Include fresh tokens in all requests
- Handle authentication errors gracefully

## Token Lifecycle

### Login Process
1. User logs in with credentials
2. Server returns complete token set:
   ```json
   {
     "access_token": "eyJ...",     // Valid for 20 minutes (1200s)
     "refresh_token": "eyJ...",    // Valid for 10 days (864000s)
     "id_token": "eyJ...",         // User information
     "expires_in": 1200,           // Access token expiry
     "refresh_expires_in": 864000, // Refresh token expiry
     "token_type": "Bearer"
   }
   ```
3. System calculates precise expiration times
4. Tokens stored securely in localStorage and httpOnly cookies

### Automatic Refresh Flow
1. Token monitoring runs every 2 minutes
2. When access token has <5 minutes left:
   - System automatically calls refresh endpoint
   - New access token received and stored
   - User session continues seamlessly
3. Process repeats until refresh token expires (10 days)

### Proactive Monitoring
- **Page visibility**: Checks tokens when user returns to tab
- **Window focus**: Validates tokens when window regains focus
- **Scheduled checks**: Regular monitoring based on token expiry
- **API call refresh**: Tokens refreshed on-demand during API calls

## Configuration

### Token Storage
- **Primary**: localStorage for persistence
- **Backup**: httpOnly cookies for security
- **Key**: `zoomeet_auth`
- **Encryption**: Tokens stored as-is (server-side encryption)

### Refresh Timing
- **Check interval**: 2 minutes
- **Refresh threshold**: 5 minutes before expiry
- **Max attempts**: 3 refresh attempts before logout
- **Backoff**: Exponential backoff on failed attempts

## Development Tools

### Token Debugger Component
A development-only component that shows:
- Real-time token status
- Time until expiry
- Manual refresh/clear options
- Monitoring status

To use:
```vue
<TokenDebugger />
```

### Debug Information
In development mode, detailed logs show:
- Token refresh attempts
- Expiration times
- Health status changes
- Error conditions

## Error Handling

### Automatic Recovery
- **Network errors**: Retries with exponential backoff
- **Token expired**: Automatic refresh attempt
- **Refresh failed**: Graceful logout with user notification

### User Experience
- **Seamless**: No interruptions during automatic refresh
- **Informative**: Clear error messages on failure
- **Persistent**: Sessions survive browser restarts
- **Secure**: Automatic cleanup on security issues

## Security Features

### Token Validation
- JWT signature verification
- Expiration time checks
- Scope validation
- Issuer verification

### Storage Security
- HTTPOnly cookies prevent XSS access
- Secure flag in production
- SameSite protection
- Automatic cleanup on logout

### Session Management
- Concurrent session handling
- Device-specific refresh tokens
- Automatic invalidation on security events
- Audit trail for token operations

## Usage Examples

### Basic Authentication Check
```javascript
const { isAuthenticated, user } = useAuth()

if (isAuthenticated.value) {
  console.log('User logged in:', user.value.name)
}
```

### Manual Token Refresh
```javascript
const { refreshToken } = useAuth()

const success = await refreshToken()
if (success) {
  console.log('Token refreshed successfully')
}
```

### Token Health Monitoring
```javascript
const { getTokenHealth } = useTokenManager()

const health = getTokenHealth()
console.log('Token status:', health.status)
console.log('Message:', health.message)
```

### API Calls with Auto-Refresh
```javascript
// API calls automatically handle token refresh
const events = await fetchEvents()
```

## Best Practices

### For Developers
1. Always use the `useAuth` composable for authentication
2. Let the system handle token refresh automatically
3. Check `isAuthenticated` before sensitive operations
4. Use the TokenDebugger in development
5. Handle authentication errors gracefully

### For Production
1. Monitor token refresh success rates
2. Set up alerts for high refresh failure rates
3. Implement proper error boundaries
4. Use secure connections (HTTPS)
5. Regular security audits

## Troubleshooting

### Common Issues

**Tokens not refreshing**
- Check network connectivity
- Verify refresh token validity
- Check server-side refresh endpoint
- Review browser console for errors

**Session expires too quickly**
- Verify server `expires_in` values
- Check token monitoring configuration
- Review automatic refresh logic
- Validate token storage persistence

**Login loops**
- Check token validation logic
- Verify cookie/localStorage access
- Review redirect logic
- Check for token corruption

### Debug Steps
1. Enable development mode
2. Use TokenDebugger component
3. Check browser network tab
4. Review console logs
5. Verify localStorage contents

## Migration Notes

### From Old System
- Tokens now include full server response
- Storage key changed to `zoomeet_auth`
- Automatic refresh replaces manual checks
- Enhanced error handling and recovery

### Breaking Changes
- `getAuthToken()` is now async
- Token structure includes more fields
- Monitoring starts automatically
- Different error handling approach

## Performance Impact

### Memory Usage
- Minimal: Only stores essential token data
- Efficient: Smart polling intervals
- Optimized: Event-driven updates

### Network Usage
- Reduced: Proactive refresh reduces failed requests
- Intelligent: Only refreshes when needed
- Efficient: Background refresh operations

### CPU Usage
- Low: Efficient polling intervals
- Smart: Event-driven architecture
- Optimized: Minimal background processing

This system provides a robust, user-friendly authentication experience while maintaining security and performance standards.