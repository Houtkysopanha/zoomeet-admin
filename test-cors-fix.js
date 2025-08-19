// Test script to verify CORS fix is working
// Run this after starting the dev server with: node test-cors-fix.js

const testEndpoints = async () => {
  const baseUrl = 'http://localhost:3000'
    try {
    const response = await fetch(`${baseUrl}/api/v1/events/categories`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
  //   if (response.status === 401) {
  //     console.log('   ✅ Proxy is working (401 = authentication required, which is expected)')
  //   } else if (response.status === 200) {
  //     console.log('   ✅ Proxy is working and endpoint is accessible')
  //   } else {
  //     console.log(`   ⚠️  Unexpected status: ${response.status}`)
  //   }
  } catch (error) {
    if (error.message.includes('CORS')) {
      console.log('   ❌ CORS error still present')
    } else if (error.message.includes('fetch')) {
      console.log('   ⚠️  Network error (server might not be ready)')
    } else {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }
  
  // console.log('\n2. Testing admin endpoint...')
  try {
    const response = await fetch(`${baseUrl}/api/v1/admin/events`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
  //   console.log(`   Status: ${response.status}`)
    
  //   if (response.status === 401) {
  //     console.log('   ✅ Admin proxy is working (401 = authentication required)')
  //   } else if (response.status === 200) {
  //     console.log('   ✅ Admin proxy is working and endpoint is accessible')
  //   } else {
  //     console.log(`   ⚠️  Unexpected status: ${response.status}`)
  //   }
  } catch (error) {
    if (error.message.includes('CORS')) {
      console.log('   ❌ CORS error still present on admin endpoint')
    } else {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }
  
  // console.log('\n🎯 Test Summary:')
  // console.log('- If you see 401 errors, that\'s good! It means the proxy is working.')
  // console.log('- If you see CORS errors, the fix needs adjustment.')
  // console.log('- If you see network errors, make sure the dev server is running.')
  // console.log('\nNext step: Try creating an event in the browser!')
}

// Run the test
// testEndpoints().catch(console.error)