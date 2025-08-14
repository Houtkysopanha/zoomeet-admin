// composables/api.js
// DEPRECATED: This file is kept for backward compatibility
// Please use the new organized API structure in composables/api/ folder

console.warn('⚠�� DEPRECATED: You are importing from composables/api.js')
console.warn('💡 Please migrate to the new API structure:')
console.warn('   - Auth functions: import from "~/composables/api/auth"')
console.warn('   - Event functions: import from "~/composables/api/events/basicInfo"')
console.warn('   - Ticket functions: import from "~/composables/api/events/ticketPackages"')
console.warn('   - Or import all: import from "~/composables/api"')

// Re-export all functions from the new organized structure for backward compatibility
export * from './api/index.js'
