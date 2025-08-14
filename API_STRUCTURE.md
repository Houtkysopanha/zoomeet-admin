# Nuxt 3 API Structure Documentation

## Overview
This document outlines the corrected API flow structure for the Nuxt 3 application with proper authentication, route protection, and API management.

## Architecture

### 1. Authentication Flow

#### Login Process
```javascript
// pages/login.vue
const { setAuth } = useAuth()
const data = await login(username, password)
setAuth({ token: data.token, role: data.role, user: data.user })
await navigateTo('/admin/dashboard')
```

#### Logout Process
```javascript
// components/HeaderTop.vue
const { clearAuth } = useAuth()
clearAuth() // Clears both cookie and localStorage
router.push('/login')
```

### 2. Route Protection

#### Global Middleware (`middleware/auth.global.ts`)
- Automatically protects all `/admin/*` routes
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from `/login`
- Works on both client and server side

#### Auth Plugin (`plugins/auth.client.ts`)
- Initializes authentication state on client-side
- Syncs localStorage with cookie state

### 3. API Management

#### Composables Structure
```
composables/
├── api.js          # Main API functions
└── useAuth.js      # Authentication state management
```

#### API Functions (`composables/api.js`)
- `login(identifier, password)` - User authentication
- `fetchEvents()` - Get events list
- `createEvent(eventData)` - Create new event
- `fetchUserInfo()` - Get user information

#### Authentication Composable (`composables/useAuth.js`)
- `user` - Reactive user state
- `isAuthenticated` - Computed authentication status
- `setAuth(authData)` - Set authentication data
- `clearAuth()` - Clear authentication data
- `getToken()` - Get current token
- `getRole()` - Get user role
- `initAuth()` - Initialize auth state

### 4. Event Management

#### Event Creation Flow
1. User fills form in `pages/admin/tabs/BasicInfor.vue`
2. Form validation occurs client-side
3. Data is prepared as FormData for file uploads
4. `createEvent()` API function is called
5. Success/error handling with toast notifications
6. Redirect to event list on success

#### Event List Flow
1. `pages/admin/event.vue` loads
2. `loadEvents()` function calls `fetchEvents()` API
3. Data is transformed and displayed in DataTable
4. Pagination and sorting handled client-side

### 5. File Upload Handling

#### UploadPhoto Component
- Drag & drop file upload
- File validation (size, type)
- Preview functionality
- Integration with FormData API

### 6. Error Handling

#### API Level
- Consistent error throwing with descriptive messages
- Network error handling
- Response validation

#### UI Level
- Toast notifications for user feedback
- Loading states during API calls
- Form validation before submission

## Environment Configuration

```javascript
// nuxt.config.ts
runtimeConfig: {
  public: {
    apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
    apiAdminBaseUrl: process.env.NUXT_PUBLIC_API_ADMIN_BASE_URL,
    bearerToken: process.env.NUXT_PUBLIC_BEARER_TOKEN,
  },
}
```

## Security Features

1. **Token-based Authentication**: JWT tokens stored securely
2. **Route Protection**: Global middleware prevents unauthorized access
3. **CSRF Protection**: Cookies with secure settings
4. **Input Validation**: Client-side form validation
5. **Error Handling**: Secure error messages without sensitive data

## Best Practices Implemented

1. **Composables Pattern**: Reusable logic in composables
2. **Reactive State**: Vue 3 reactivity for auth state
3. **Type Safety**: TypeScript for middleware and plugins
4. **Error Boundaries**: Comprehensive error handling
5. **Loading States**: User feedback during async operations
6. **Clean Architecture**: Separation of concerns

## Usage Examples

### Creating an Event
```javascript
// In BasicInfor.vue
const eventData = {
  name: 'My Event',
  category_id: 1,
  description: 'Event description',
  // ... other fields
}

try {
  const result = await createEvent(eventData)
  if (result.success) {
    toast.add({ severity: 'success', summary: 'Event Created' })
    await router.push('/admin/event')
  }
} catch (error) {
  toast.add({ severity: 'error', summary: 'Error', detail: error.message })
}
```

### Checking Authentication
```javascript
// In any component
const { isAuthenticated, user } = useAuth()

if (isAuthenticated.value) {
  console.log('User is logged in:', user.value)
}
```

This structure provides a robust, secure, and maintainable API flow for the Nuxt 3 application.
