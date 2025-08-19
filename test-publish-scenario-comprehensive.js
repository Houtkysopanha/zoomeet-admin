// COMPREHENSIVE PUBLISH SCENARIO TEST
// This test simulates the exact publish flow to identify where chair data is lost

console.log('🚀 COMPREHENSIVE PUBLISH SCENARIO TEST');
console.log('============================================================');

// Mock the exact API flow that happens during publish
function simulatePublishFlow() {
  console.log('\n🧪 SIMULATING COMPLETE PUBLISH FLOW');
  console.log('==================================================');
  
  // Step 1: Simulate current event data (what's loaded before publish)
  const currentEventData = {
    id: 'test-event-123',
    name: 'Test Event',
    chairs: [
      {
        name: 'John Doe',
        position: 'CEO',
        company: 'Tech Corp',
        sort_order: 1,
        profile_image_url: 'https://example.com/images/john.jpg' // Existing image from API
      },
      {
        name: 'Jane Smith', 
        position: 'CTO',
        company: 'Tech Corp',
        sort_order: 2,
        profile_image: new File(['fake-image-data'], 'jane.jpg', { type: 'image/jpeg' }) // New file upload
      }
    ]
  };
  
  console.log('📋 Step 1: Current event data before publish:');
  console.log('Chairs:', currentEventData.chairs.map(chair => ({
    name: chair.name,
    hasExistingImage: !!chair.profile_image_url,
    hasNewFile: chair.profile_image instanceof File,
    imageType: chair.profile_image instanceof File ? 'File' : (chair.profile_image_url ? 'URL' : 'None')
  })));
  
  // Step 2: Simulate FormData creation (from publishEvent function)
  console.log('\n📤 Step 2: Creating FormData for publish request:');
  const formData = new FormData();
  formData.append('_method', 'PUT');
  formData.append('is_published', '1');
  formData.append('status', 'active');
  
  // Process chairs exactly like publishEvent function does
  if (currentEventData.chairs && Array.isArray(currentEventData.chairs)) {
    console.log('📋 Processing chairs for FormData:');
    
    currentEventData.chairs.forEach((chair, index) => {
      if (chair.name && chair.position && chair.company) {
        formData.append(`chairs[${index}][name]`, chair.name);
        formData.append(`chairs[${index}][position]`, chair.position);
        formData.append(`chairs[${index}][company]`, chair.company);
        formData.append(`chairs[${index}][sort_order]`, chair.sort_order || (index + 1));
        
        // CRITICAL: Handle chair images based on API field structure
        if (chair.profile_image_url && chair.profile_image_url.trim() !== '') {
          // Existing image URL from API - preserve it
          formData.append(`chairs[${index}][profile_image_url]`, chair.profile_image_url);
          console.log(`✅ Chair ${index + 1}: Preserving existing image URL: ${chair.profile_image_url}`);
        } else if (chair.profile_image && (
          chair.profile_image instanceof File ||
          (typeof chair.profile_image === 'object' &&
           chair.profile_image.constructor &&
           chair.profile_image.constructor.name === 'File') ||
          (chair.profile_image.name && chair.profile_image.size && chair.profile_image.type)
        )) {
          // New file upload
          formData.append(`chairs[${index}][profile_image]`, chair.profile_image);
          console.log(`✅ Chair ${index + 1}: Adding new file: ${chair.profile_image.name}`);
        } else {
          console.log(`⚪ Chair ${index + 1}: No image data`);
        }
      }
    });
  }
  
  // Log FormData contents
  console.log('\n📝 FormData contents:');
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
    } else {
      console.log(`${key}: ${value}`);
    }
  }
  
  // Step 3: Simulate API response after publish
  console.log('\n📥 Step 3: Simulating API response after publish:');
  
  // This is what the API might return after publish
  const publishResponse = {
    success: true,
    data: {
      id: 'test-event-123',
      name: 'Test Event',
      is_published: true,
      status: 'active',
      chairs: [
        {
          name: 'John Doe',
          position: 'CEO', 
          company: 'Tech Corp',
          sort_order: 1,
          profile_image_url: 'https://example.com/images/john.jpg' // Preserved existing image
        },
        {
          name: 'Jane Smith',
          position: 'CTO',
          company: 'Tech Corp', 
          sort_order: 2,
          profile_image_url: 'https://example.com/images/jane-uploaded.jpg' // New uploaded image URL
        }
      ]
    }
  };
  
  console.log('API Response chairs:', publishResponse.data.chairs.map(chair => ({
    name: chair.name,
    hasImageUrl: !!chair.profile_image_url,
    imageUrl: chair.profile_image_url
  })));
  
  // Step 4: Simulate frontend state update after publish
  console.log('\n🔄 Step 4: Updating frontend state after publish:');
  
  // This is what happens in CreateEvent.vue after successful publish
  let eventData = { ...currentEventData };
  if (publishResponse && publishResponse.success !== false) {
    // Update local state
    eventData.is_published = true;
    eventData.status = 'active';
    
    // POTENTIAL ISSUE: Are we updating the chairs data from the response?
    // The current code doesn't seem to update chairs from the publish response
    console.log('⚠️ POTENTIAL ISSUE: Chairs data not updated from publish response');
    console.log('Current chairs in local state:', eventData.chairs.map(chair => ({
      name: chair.name,
      hasImageUrl: !!chair.profile_image_url,
      hasFile: chair.profile_image instanceof File
    })));
  }
  
  // Step 5: Simulate page refresh / data reload
  console.log('\n🔄 Step 5: Simulating page refresh / data reload:');
  
  // When page refreshes, data is loaded from API again
  // This simulates what getEventDetails would return
  const reloadedEventData = {
    id: 'test-event-123',
    name: 'Test Event',
    is_published: true,
    status: 'active',
    chairs: [
      {
        name: 'John Doe',
        position: 'CEO',
        company: 'Tech Corp',
        sort_order: 1,
        profile_image_url: 'https://example.com/images/john.jpg'
      },
      {
        name: 'Jane Smith',
        position: 'CTO', 
        company: 'Tech Corp',
        sort_order: 2,
        profile_image_url: 'https://example.com/images/jane-uploaded.jpg'
      }
    ]
  };
  
  console.log('Reloaded chairs from API:', reloadedEventData.chairs.map(chair => ({
    name: chair.name,
    hasImageUrl: !!chair.profile_image_url,
    imageUrl: chair.profile_image_url
  })));
  
  // Step 6: Test chair image display logic
  console.log('\n🖼️ Step 6: Testing chair image display logic:');
  
  // This simulates the getChairImageSrc function from BasicInfor.vue
  function getChairImageSrc(chair) {
    if (!chair) return null;
    
    try {
      // Priority 1: File object (newly uploaded)
      if (chair.photo instanceof File) {
        return URL.createObjectURL(chair.photo);
      }
      
      // Priority 2: profile_image File object
      if (chair.profile_image instanceof File) {
        return URL.createObjectURL(chair.profile_image);
      }
      
      // Priority 3: Avatar URL (existing or generated)
      if (chair.avatar && typeof chair.avatar === 'string' && chair.avatar.trim()) {
        return chair.avatar;
      }
      
      // Priority 4: Photo URL string
      if (chair.photo && typeof chair.photo === 'string' && chair.photo.trim()) {
        if (chair.photo.startsWith('http')) {
          return chair.photo;
        }
        return `${window.location.origin}${chair.photo}`;
      }
      
      // Priority 5: Profile image URL (from API) - CRITICAL CHECK
      if (chair.profile_image && typeof chair.profile_image === 'string' && chair.profile_image.trim()) {
        if (chair.profile_image.startsWith('http')) {
          return chair.profile_image;
        }
        return `${window.location.origin}${chair.profile_image}`;
      }
      
      // Priority 6: profile_image_url field (from API) - THIS IS THE KEY FIELD
      if (chair.profile_image_url && typeof chair.profile_image_url === 'string' && chair.profile_image_url.trim()) {
        if (chair.profile_image_url.startsWith('http')) {
          return chair.profile_image_url;
        }
        return `${window.location.origin}${chair.profile_image_url}`;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
  
  // Test image display for reloaded chairs
  reloadedEventData.chairs.forEach((chair, index) => {
    const imageSrc = getChairImageSrc(chair);
    console.log(`Chair ${index + 1} (${chair.name}): Image src = ${imageSrc || 'NO IMAGE'}`);
  });
  
  return {
    currentEventData,
    publishResponse,
    reloadedEventData,
    formDataEntries: Array.from(formData.entries())
  };
}

// Step 7: Identify potential issues
function identifyPotentialIssues() {
  console.log('\n🔍 POTENTIAL ISSUES IDENTIFIED:');
  console.log('=====================================');
  
  console.log('1. ❌ FRONTEND STATE UPDATE ISSUE:');
  console.log('   - After publish, the frontend doesn\'t update chairs from API response');
  console.log('   - Local state still contains File objects instead of URLs');
  console.log('   - This could cause display issues until page refresh');
  
  console.log('\n2. ❌ FIELD MAPPING ISSUE:');
  console.log('   - API returns: profile_image_url');
  console.log('   - Frontend checks: profile_image, photo, avatar, photo_url');
  console.log('   - Missing check for profile_image_url in some places');
  
  console.log('\n3. ❌ DATA PERSISTENCE ISSUE:');
  console.log('   - Chair images might not be properly saved during publish');
  console.log('   - FormData construction might have issues');
  console.log('   - API might not be processing chair images correctly');
  
  console.log('\n4. ❌ STATE SYNCHRONIZATION ISSUE:');
  console.log('   - Multiple data sources: eventStore, tabsStore, local state');
  console.log('   - After publish, these might not be synchronized');
  console.log('   - Page refresh loads from API, but local state might be stale');
}

// Run the comprehensive test
const testResults = simulatePublishFlow();
identifyPotentialIssues();

console.log('\n🎯 RECOMMENDED FIXES:');
console.log('====================');
console.log('1. Update publishEvent to return complete event data including chairs');
console.log('2. Update frontend to sync chairs from publish response');
console.log('3. Ensure getChairImageSrc checks profile_image_url field');
console.log('4. Add debug logging to track chair data through publish flow');
console.log('5. Test actual API publish response structure');

console.log('\n✅ TEST COMPLETE - Check the issues above');