// composables/api/index.js
// Main API index file - exports all API functions for easy importing

// Authentication
export * from './auth.js'

// Events - Basic Information
export * from './events/basicInfo.js'

// Events - Ticket Packages
export * from './events/ticketPackages.js'

// Tickets - CRUD operations
export * from './tickets/index.js'

// For backward compatibility, you can also import everything from a single file
// Example usage:
// import { login, createEvent, createTicketTypes, fetchEventTickets } from '~/composables/api'
// or
// import { login } from '~/composables/api/auth'
// import { createEvent } from '~/composables/api/events/basicInfo'
// import { createTicketTypes } from '~/composables/api/events/ticketPackages'
// import { fetchEventTickets } from '~/composables/api/tickets'