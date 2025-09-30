# Booking Feature Testing Guide

## Issues Fixed:

### 1. API Configuration Issue
- ✅ Fixed `createOrderReservation` function in `api.js`
- ✅ Removed incorrect auth headers for public endpoint
- ✅ Added proper error handling and logging

### 2. Toast Notifications
- ✅ Replaced custom notification system with PrimeVue Toast
- ✅ Added Toast component to admin layout
- ✅ Updated all notification calls to use `toast.add()`

### 3. Form Management
- ✅ Added "Clear" button to customer form
- ✅ Fixed form clearing after successful booking
- ✅ Added localStorage persistence for customer info
- ✅ Improved form validation and error handling

### 4. Customer Information Display:
- ✅ **Added** customer info display in EventDetail sidebar
- ✅ **Shows** booking name and contact info (email/phone based on tab)
- ✅ **Visual indicators** for missing information (orange text + warning icons)
- ✅ **Dynamic contact display** based on active tab (phone/email)

### 5. Additional Improvements:
- ✅ **Added** "Clear" button to customer information form
- ✅ **Fixed** phone number format (adds +855 country code automatically)
- ✅ **Enhanced** form validation with better error messages
- ✅ **Added** comprehensive logging for debugging

## Testing Steps:

### Step 1: Customer Information
1. Go to `/admin/booking`
2. Fill in customer information:
   - **Phone tab**: Enter phone number (e.g., `96654752`) and full name (e.g., `Sopanhahouky`)
   - **Email tab**: Enter email and full name
3. Click **Save** button
4. ✅ Should see success toast: "Customer information saved successfully!"
5. ✅ Data should persist if you refresh the page

### Step 2: Event Selection
1. Select an event from the grid/list
2. ✅ Event detail sidebar should open
3. ✅ Should see available tickets loaded
4. ✅ **NEW:** Should see customer information displayed:
   - **Booking name**: Shows the full name from customer info (or warning if empty)
   - **Email/Phone Number**: Shows contact info based on selected tab (phone/email)
   - **Visual indicators**: Orange text + warning icon if information is missing

### Step 3: Ticket Selection
1. Select ticket quantities using +/- buttons
2. ✅ Payment summary should update automatically
3. ✅ "Complete Booking" button should be enabled when:
   - Customer info is complete ✅
   - At least one ticket is selected ✅

### Step 4: Complete Booking
1. Click **"Complete Booking"**
2. ✅ Should see processing state with spinner
3. ✅ Check browser console for API call logs:
   ```
   📋 Creating order with data: {...}
   🔍 API will be called with endpoint: /orders/reserve
   🎫 Creating order reservation: {...}
   ```
4. ✅ On success: Should see toast "Your booking has been confirmed! Order ID: ..."
5. ✅ Form should clear after successful booking
6. ✅ On error: Should see error toast with specific message

## API Payload Format:
```json
{
  "coupon": null,
  "ticket_types": [
    {
      "ticket_type_id": "uuid-here",
      "quantity": 1
    }
  ],
  "payment_method": "khqr",
  "transaction_id": "TXN12345",
  "phone_number": "+85596654752",
  "email": null,
  "full_name": "Sopanhahouky"
}
```

## Debugging:
- Check browser console for detailed logs
- Verify API endpoint is accessible
- Check network tab for actual HTTP requests
- Ensure PrimeVue Toast service is working

## Key Components:
- `CustomerBookng.vue` - Main booking component
- `EventDetail.vue` - Event sidebar with ticket selection
- `api.js` - API functions including `createOrderReservation`
- `admin.vue` layout - Contains Toast component