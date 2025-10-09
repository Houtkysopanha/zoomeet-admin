# 🗓️ Upcoming Events API Integration

## Overview
Successfully integrated the upcoming events feature with the real API endpoint `/dashboard/up-comming-event?start_date=YYYY-MM-DD`.

## API Endpoint Details
- **Endpoint**: `GET /dashboard/up-comming-event`
- **Base URL**: Admin API (`https://dev-apiticket.prestigealliance.co/api/v1/admin`)
- **Authentication**: Bearer token required
- **Parameter**: `start_date` (format: YYYY-MM-DD)

## Response Format
```json
{
    "success": true,
    "message": "OK",
    "data": [
        {
            "id": "d177d35c-cdef-4c14-98e5-7bae2f0df53a",
            "name": "Cybersecurity",
            "category_name": "Conference",
            "start_date": "2025-10-03 06:50:52",
            "end_date": "2025-10-04 15:42:52",
            "location": "Phnom Penh",
            "cover_image_url": "https://dev-ticket7777.s3.ap-southeast-2.amazonaws.com/image.png"
        }
    ]
}
```

## Files Modified/Created

### 1. `/composables/api.js`
- ✅ Added `fetchUpcomingEvents(startDate)` function
- ✅ Proper error handling and authentication
- ✅ Query parameter handling for start_date

### 2. `/composables/useUpcomingEvents.js` (New)
- ✅ Created reusable composable for event state management
- ✅ Formatted event data transformation
- ✅ Loading states and error handling
- ✅ Date formatting utilities

### 3. `/pages/admin/ComingEvent.vue`
- ✅ Replaced mock data with real API integration
- ✅ Dynamic date selection triggers API calls
- ✅ Month navigation loads events for selected dates
- ✅ Loading, error, and empty states
- ✅ Toast notifications for user feedback
- ✅ Image fallback handling

### 4. `/public/api-test.html` (New)
- ✅ Test page for API endpoint verification
- ✅ Integration documentation
- ✅ Expected response format examples

## Features Implemented

### ✅ Core Functionality
- **Dynamic API Calls**: Events load based on selected date
- **Date Navigation**: Calendar controls trigger API requests
- **Month Navigation**: Previous/Next month buttons load new events
- **Real-time Updates**: UI updates automatically with API data

### ✅ User Experience
- **Loading States**: Spinner shown during API calls
- **Error Handling**: User-friendly error messages
- **Empty States**: Clear messaging when no events found
- **Toast Notifications**: Success/error feedback
- **Responsive Design**: Maintained mobile-friendly layout

### ✅ Data Handling
- **Image Fallbacks**: Default image when cover_image_url is missing
- **Date Formatting**: Proper time/date display from API timestamps
- **Category Display**: Shows event category from API
- **Event Details**: All API fields properly mapped to UI

## Usage Examples

### Basic Usage
```javascript
// Load events for a specific date
const { loadEvents, formattedEvents, isLoading } = useUpcomingEvents()
await loadEvents(new Date('2025-10-03'))
```

### Component Integration
```vue
<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-for="event in formattedEvents" :key="event.id">
      {{ event.title }} - {{ event.location }}
    </div>
  </div>
</template>

<script setup>
const { formattedEvents, isLoading, loadEvents } = useUpcomingEvents()
onMounted(() => loadEvents())
</script>
```

## Testing

### Manual Testing
1. Visit `/admin/ComingEvent` page
2. Select different dates using the calendar
3. Navigate between months
4. Verify events load and display correctly
5. Test error states with invalid dates

### API Testing
1. Open `/api-test.html` in browser
2. Verify endpoint configuration
3. Test different date parameters
4. Check authentication requirements

## Configuration

### Environment Variables
The API endpoints are configured in `nuxt.config.ts`:
```typescript
runtimeConfig: {
  public: {
    apiAdminBaseUrl: process.env.NUXT_PUBLIC_API_ADMIN_BASE_URL || 
      'https://dev-apiticket.prestigealliance.co/api/v1/admin'
  }
}
```

### Default Date
Currently defaults to `2025-10-03` for initial load. Can be modified in:
```javascript
// ComingEvent.vue - onMounted
const defaultDate = new Date(2025, 9, 3) // October 3, 2025
```

## Error Handling

### API Errors
- **401 Unauthorized**: Redirects to login page
- **403 Forbidden**: Shows permission error
- **404 Not Found**: Shows no events message
- **500 Server Error**: Shows generic error with retry option

### Network Errors
- **Connection Failed**: Shows retry button
- **Timeout**: Shows error message with retry option
- **Invalid Response**: Logs warning and shows empty state

## Performance Considerations

### Optimizations Implemented
- **Caching**: Composable remembers last fetch date
- **Loading States**: Prevents multiple simultaneous API calls
- **Error Recovery**: Retry functionality for failed requests
- **Image Optimization**: Fallback images prevent broken displays

### Future Improvements
- Add caching with expiration times
- Implement pagination for large event lists
- Add event filtering and search capabilities
- Implement offline support with cached data

## Troubleshooting

### Common Issues
1. **No events loading**: Check API authentication and endpoint configuration
2. **Images not displaying**: Verify CORS settings and image URLs
3. **Date selection not working**: Check date formatting (YYYY-MM-DD)
4. **Toast not showing**: Verify PrimeVue Toast is configured in app.vue

### Debug Mode
Enable debug logging by adding to browser console:
```javascript
localStorage.setItem('debug', 'true')
```

## Next Steps
1. **Test with real authentication tokens**
2. **Verify API endpoint in production environment**
3. **Add event detail navigation**
4. **Implement event filtering/search**
5. **Add calendar view integration**