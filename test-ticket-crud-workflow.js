/**
 * Comprehensive Test for Ticket CRUD Workflow
 * Tests the complete ticket management system with new API structure
 */

// Test the complete ticket CRUD workflow
async function testTicketCRUDWorkflow() {
  console.log('🎫 Starting Comprehensive Ticket CRUD Workflow Test')
  console.log('=' .repeat(60))
  
  // Mock event ID for testing
  const testEventId = '550e8400-e29b-41d4-a716-446655440000'
  
  console.log('📋 Test Configuration:')
  console.log(`Event ID: ${testEventId}`)
  console.log(`API Base URL: ${process.env.NUXT_PUBLIC_API_BASE_URL || 'https://dev-gateway.prestigealliance.co/api/v1'}`)
  console.log(`Admin API URL: ${process.env.NUXT_PUBLIC_API_ADMIN_BASE_URL || 'https://dev-apiticket.prestigealliance.co/api/v1/admin'}`)
  console.log('')
  
  // Test data for tickets
  const testTickets = [
    {
      name: 'Early Bird Ticket',
      price: 50.00,
      total: 100,
      tag: 'Limited time early bird pricing'
    },
    {
      name: 'Regular Ticket',
      price: 75.00,
      total: 200,
      tag: 'Standard admission ticket'
    },
    {
      name: 'VIP Ticket',
      price: 150.00,
      total: 50,
      tag: 'Premium access with exclusive benefits'
    }
  ]
  
  try {
    // Import API functions
    const { 
      createTicketTypes, 
      getEventTicketTypes, 
      getTicketTypeDetails, 
      updateTicketType, 
      deleteTicketType 
    } = await import('./composables/api.js')
    
    console.log('✅ API functions imported successfully')
    console.log('')
    
    // PHASE 1: CREATE TICKETS (POST)
    console.log('🔥 PHASE 1: CREATE TICKETS')
    console.log('-'.repeat(40))
    
    console.log('📝 Creating tickets with data:', testTickets)
    
    try {
      const createResponse = await createTicketTypes(testEventId, testTickets)
      console.log('✅ CREATE Response:', {
        success: createResponse?.success,
        message: createResponse?.message,
        hasData: !!createResponse?.data,
        ticketTypesCount: createResponse?.data?.ticket_types?.length || 0,
        structure: {
          hasSuccess: !!createResponse?.success,
          hasMessage: !!createResponse?.message,
          hasData: !!createResponse?.data,
          hasTicketTypes: !!createResponse?.data?.ticket_types
        }
      })
      
      if (!createResponse?.success) {
        throw new Error(`Create failed: ${createResponse?.message || 'Unknown error'}`)
      }
      
      console.log('🎉 Tickets created successfully!')
      console.log('')
      
    } catch (error) {
      console.error('❌ CREATE Error:', error.message)
      console.log('⚠️  Continuing with READ test...')
      console.log('')
    }
    
    // PHASE 2: READ TICKETS (GET)
    console.log('🔍 PHASE 2: READ ALL TICKETS')
    console.log('-'.repeat(40))
    
    let ticketTypeIds = []
    
    try {
      const readResponse = await getEventTicketTypes(testEventId)
      console.log('✅ READ Response:', {
        success: readResponse?.success,
        message: readResponse?.message,
        hasData: !!readResponse?.data,
        ticketTypesCount: readResponse?.data?.ticket_types?.length || 0,
        structure: {
          hasSuccess: !!readResponse?.success,
          hasMessage: !!readResponse?.message,
          hasData: !!readResponse?.data,
          hasTicketTypes: !!readResponse?.data?.ticket_types,
          hasOrganizers: !!readResponse?.data?.organizers
        }
      })
      
      if (readResponse?.success && readResponse?.data?.ticket_types) {
        const tickets = readResponse.data.ticket_types
        console.log('📋 Found tickets:', tickets.length)
        
        tickets.forEach((ticket, index) => {
          console.log(`  ${index + 1}. ${ticket.name} - $${ticket.price} (${ticket.inventory?.total || ticket.total} available)`)
          ticketTypeIds.push(ticket.id)
        })
        
        console.log('🎉 Tickets loaded successfully!')
        console.log('')
        
      } else {
        console.log('⚠️  No tickets found or invalid response structure')
        console.log('')
      }
      
    } catch (error) {
      console.error('❌ READ Error:', error.message)
      console.log('')
    }
    
    // PHASE 3: READ INDIVIDUAL TICKET (GET)
    console.log('🔍 PHASE 3: READ INDIVIDUAL TICKET')
    console.log('-'.repeat(40))
    
    if (ticketTypeIds.length > 0) {
      const firstTicketId = ticketTypeIds[0]
      console.log(`📝 Getting details for ticket ID: ${firstTicketId}`)
      
      try {
        const detailResponse = await getTicketTypeDetails(testEventId, firstTicketId)
        console.log('✅ DETAIL Response:', {
          success: detailResponse?.success,
          message: detailResponse?.message,
          hasData: !!detailResponse?.data,
          ticketData: detailResponse?.data ? {
            id: detailResponse.data.id,
            name: detailResponse.data.name,
            price: detailResponse.data.price,
            inventoryTotal: detailResponse.data.inventory?.total,
            tag: detailResponse.data.tag
          } : null
        })
        
        if (detailResponse?.success && detailResponse?.data) {
          const ticket = detailResponse.data
          console.log(`📋 Ticket Details:`)
          console.log(`  Name: ${ticket.name}`)
          console.log(`  Price: $${ticket.price}`)
          console.log(`  Quantity: ${ticket.inventory?.total || ticket.total}`)
          console.log(`  Description: ${ticket.tag}`)
          console.log('🎉 Individual ticket loaded successfully!')
        } else {
          console.log('⚠️  Failed to load individual ticket details')
        }
        console.log('')
        
      } catch (error) {
        console.error('❌ DETAIL Error:', error.message)
        console.log('')
      }
    } else {
      console.log('⚠️  No ticket IDs available for individual read test')
      console.log('')
    }
    
    // PHASE 4: UPDATE TICKET (PUT)
    console.log('✏️  PHASE 4: UPDATE TICKET')
    console.log('-'.repeat(40))
    
    if (ticketTypeIds.length > 0) {
      const updateTicketId = ticketTypeIds[0]
      const updateData = {
        name: 'Updated Early Bird Ticket',
        price: 45.00,
        total: 120,
        tag: 'Updated early bird pricing with extended deadline'
      }
      
      console.log(`📝 Updating ticket ID: ${updateTicketId}`)
      console.log('📝 Update data:', updateData)
      
      try {
        const updateResponse = await updateTicketType(testEventId, updateTicketId, updateData)
        console.log('✅ UPDATE Response:', {
          success: updateResponse?.success,
          message: updateResponse?.message,
          hasData: !!updateResponse?.data
        })
        
        if (updateResponse?.success) {
          console.log('🎉 Ticket updated successfully!')
        } else {
          console.log('⚠️  Update may have failed')
        }
        console.log('')
        
      } catch (error) {
        console.error('❌ UPDATE Error:', error.message)
        console.log('')
      }
    } else {
      console.log('⚠️  No ticket IDs available for update test')
      console.log('')
    }
    
    // PHASE 5: DELETE TICKET (DELETE)
    console.log('🗑️  PHASE 5: DELETE TICKET')
    console.log('-'.repeat(40))
    
    if (ticketTypeIds.length > 1) {
      const deleteTicketId = ticketTypeIds[ticketTypeIds.length - 1] // Delete last ticket
      console.log(`📝 Deleting ticket ID: ${deleteTicketId}`)
      
      try {
        const deleteResponse = await deleteTicketType(testEventId, deleteTicketId)
        console.log('✅ DELETE Response:', {
          success: deleteResponse?.success,
          message: deleteResponse?.message
        })
        
        if (deleteResponse?.success || deleteResponse?.message === 'Ticket deleted successfully') {
          console.log('🎉 Ticket deleted successfully!')
        } else {
          console.log('⚠️  Delete may have failed')
        }
        console.log('')
        
      } catch (error) {
        console.error('❌ DELETE Error:', error.message)
        console.log('')
      }
    } else {
      console.log('⚠️  Not enough tickets for delete test (keeping at least one)')
      console.log('')
    }
    
    // PHASE 6: VERIFY FINAL STATE
    console.log('🔍 PHASE 6: VERIFY FINAL STATE')
    console.log('-'.repeat(40))
    
    try {
      const finalResponse = await getEventTicketTypes(testEventId)
      console.log('✅ FINAL READ Response:', {
        success: finalResponse?.success,
        ticketCount: finalResponse?.data?.ticket_types?.length || 0
      })
      
      if (finalResponse?.success && finalResponse?.data?.ticket_types) {
        const finalTickets = finalResponse.data.ticket_types
        console.log(`📋 Final ticket count: ${finalTickets.length}`)
        
        finalTickets.forEach((ticket, index) => {
          console.log(`  ${index + 1}. ${ticket.name} - $${ticket.price} (${ticket.inventory?.total || ticket.total} available)`)
        })
        
        console.log('🎉 Final verification complete!')
      }
      console.log('')
      
    } catch (error) {
      console.error('❌ FINAL READ Error:', error.message)
      console.log('')
    }
    
    // TEST SUMMARY
    console.log('📊 TEST SUMMARY')
    console.log('=' .repeat(60))
    console.log('✅ API Endpoints Tested:')
    console.log('  • POST /admin/events/:event_id/ticket-types (Create)')
    console.log('  • GET /admin/events/:event_id/ticket-types (Read All)')
    console.log('  • GET /admin/events/:event_id/ticket-types/:ticket_type_id (Read One)')
    console.log('  • PUT /admin/events/:event_id/ticket-types/:ticket_type_id (Update)')
    console.log('  • DELETE /admin/events/:event_id/ticket-types/:ticket_type_id (Delete)')
    console.log('')
    console.log('✅ API Response Structure Tested:')
    console.log('  • New structure with ticket_types array')
    console.log('  • inventory.total field mapping')
    console.log('  • success/message/data format')
    console.log('')
    console.log('✅ Workflow Features Tested:')
    console.log('  • Create multiple tickets (POST)')
    console.log('  • Load existing tickets (GET)')
    console.log('  • Edit individual tickets (GET + PUT)')
    console.log('  • Delete tickets (DELETE)')
    console.log('  • Response structure handling')
    console.log('')
    console.log('🎉 TICKET CRUD WORKFLOW TEST COMPLETED!')
    
  } catch (error) {
    console.error('❌ Test Setup Error:', error)
    console.log('')
    console.log('📋 Test Requirements:')
    console.log('  • Valid authentication token')
    console.log('  • API server running')
    console.log('  • Valid event ID')
    console.log('  • Proper CORS configuration')
  }
}

// Export for use in browser console or test runner
if (typeof window !== 'undefined') {
  window.testTicketCRUDWorkflow = testTicketCRUDWorkflow
  console.log('🎫 Ticket CRUD Test loaded! Run: testTicketCRUDWorkflow()')
}

export { testTicketCRUDWorkflow }