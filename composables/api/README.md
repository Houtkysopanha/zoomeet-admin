# API Structure Documentation

This directory contains organized API functions for the Zoomet Admin application.

## Directory Structure

```
composables/api/
├── index.js                    # Main export file - imports all API functions
├── auth.js                     # Authentication related functions
├── events/
│   ├── basicInfo.js           # Event basic information CRUD operations
│   └── ticketPackages.js      # Ticket packages CRUD operations
├── tickets/
│   └── index.js               # Tickets CRUD operations
└── README.md                  # This documentation file
```

## Usage Examples

### Method 1: Import from main index file
```javascript
// Import all functions from main index
import { login, createEvent, createTicketTypes } from '~/composables/api'

// Use the functions
await login(identifier, password)
await createEvent(eventData)
await createTicketTypes(eventId, ticketData)
```

### Method 2: Import from specific modules
```javascript
// Import from specific modules for better tree-shaking
import { login, fetchUserInfo } from '~/composables/api/auth'
import { createEvent, fetchEvents, updateEvent, deleteEvent } from '~/composables/api/events/basicInfo'
import { createTicketTypes, getEventTicketTypes, updateTicketType } from '~/composables/api/events/ticketPackages'
```

## API Modules

### 1. Authentication (`auth.js`)
**Functions:**
- `login(identifier, password)` - User login
- `fetchUserInfo()` - Get current user information
- `getAuthToken()` - Get authentication token (helper)
- `createAuthHeaders(includeContentType)` - Create authenticated headers (helper)

### 2. Event Basic Information (`events/basicInfo.js`)
**CRUD Operations:**
- **CREATE**: `createEvent(eventData, isDraft)` - Create new event
- **READ**: 
  - `fetchEvents()` - Get all events
  - `fetchEventById(eventId)` - Get single event by ID
  - `getEventDetails(eventId)` - Get event details (alias)
- **UPDATE**: `updateEvent(eventId, eventData)` - Update event information
- **DELETE**: `deleteEvent(eventId)` - Delete event

### 3. Ticket Packages (`events/ticketPackages.js`)
**CRUD Operations:**
- **CREATE**: 
  - `createTicketTypes(eventId, ticketTypesData)` - Create multiple ticket types
  - `createTicketType(eventId, ticketData)` - Create single ticket type
- **READ**: 
  - `getEventTicketTypes(eventId)` - Get all ticket types for event
  - `getTicketTypeById(eventId, ticketTypeId)` - Get single ticket type
- **UPDATE**: 
  - `updateTicketType(eventId, ticketTypeId, ticketData)` - Update single ticket type
  - `updateTicketTypes(eventId, ticketTypesData)` - Update multiple ticket types
- **DELETE**: 
  - `deleteTicketType(eventId, ticketTypeId)` - Delete single ticket type
  - `deleteTicketTypes(eventId, ticketTypeIds)` - Delete multiple ticket types

## Migration from Old API

If you were previously using the old `composables/api.js` file, you can:

1. **Keep using the same imports** (they will work through the index.js file):
   ```javascript
   // This still works
   import { login, createEvent, createTicketTypes } from '~/composables/api'
   ```

2. **Or migrate to specific imports** for better performance:
   ```javascript
   // More specific imports
   import { login } from '~/composables/api/auth'
   import { createEvent } from '~/composables/api/events/basicInfo'
   import { createTicketTypes } from '~/composables/api/events/ticketPackages'
   ```

## Benefits of New Structure

1. **Better Organization**: Functions are grouped by functionality
2. **Easier Maintenance**: Each module focuses on specific operations
3. **Better Tree Shaking**: Import only what you need
4. **Cleaner Code**: Smaller, focused files are easier to understand
5. **Scalability**: Easy to add new modules (e.g., users, categories, etc.)
6. **CRUD Clarity**: Clear separation of Create, Read, Update, Delete operations

## Adding New API Modules

To add a new API module (e.g., for user management):

1. Create new file: `composables/api/users.js`
2. Implement CRUD functions
3. Export functions in `composables/api/index.js`:
   ```javascript
   export * from './users.js'
   ```

## Error Handling

All API functions include comprehensive error handling:
- Authentication errors (401) - Auto-redirect to login
- Validation errors (422) - Detailed field-level errors
- Permission errors (403) - Clear permission messages
- Not found errors (404) - Resource not found messages
- Server errors (500) - Server-side error handling

## Authentication

All API functions (except login) automatically include authentication headers using the `createAuthHeaders()` helper function. The token is managed through the `useAuth()` composable.