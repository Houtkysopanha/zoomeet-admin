/**
 * Debug script to identify why chair images are not being uploaded properly
 * This will help us understand what's happening during the FormData creation
 */

// Mock File object for testing
class MockFile {
  constructor(name, size, type) {
    this.name = name;
    this.size = size;
    this.type = type;
    this.lastModified = Date.now();
  }
}

// Mock FormData for debugging
class DebugFormData {
  constructor() {
    this.data = new Map();
  }
  
  append(key, value, filename) {
    console.log(`📝 FormData.append called:`, {
      key,
      value: value instanceof File ? `[File] ${value.name} (${value.size} bytes)` : value,
      filename
    });
    
    if (!this.data.has(key)) {
      this.data.set(key, []);
    }
    this.data.get(key).push({ value, filename });
  }
  
  entries() {
    const entries = [];
    for (const [key, values] of this.data) {
      for (const { value, filename } of values) {
        entries.push([key, value, filename]);
      }
    }
    return entries;
  }
  
  has(key) {
    return this.data.has(key);
  }
  
  get(key) {
    const values = this.data.get(key);
    return values ? values[0].value : null;
  }
}

// Simulate the createEvent function logic
function debugCreateEventFormData(eventData) {
  console.log("🔍 DEBUGGING CHAIR IMAGE UPLOAD");
  console.log("=" .repeat(50));
  
  console.log("📋 Input event data:");
  console.log("  - Event name:", eventData.name);
  console.log("  - Chairs count:", eventData.chairs?.length || 0);
  
  if (eventData.chairs && eventData.chairs.length > 0) {
    eventData.chairs.forEach((chair, index) => {
      console.log(`  - Chair ${index + 1}:`, {
        name: chair.name,
        hasProfileImage: !!chair.profile_image,
        profileImageType: chair.profile_image ? chair.profile_image.constructor.name : 'null',
        profileImageSize: chair.profile_image instanceof File ? chair.profile_image.size : 'N/A'
      });
    });
  }
  
  console.log("\n📦 Creating FormData...");
  const formData = new DebugFormData();
  
  // Add basic fields
  formData.append('name', eventData.name);
  formData.append('category_id', eventData.category_id);
  formData.append('description', eventData.description);
  formData.append('start_date', eventData.start_date);
  formData.append('end_date', eventData.end_date);
  formData.append('location', eventData.location);
  formData.append('event_slug', eventData.event_slug);
  formData.append('is_published', '0');
  formData.append('status', 'draft');
  
  // Handle chairs array - THIS IS THE CRITICAL PART
  if (eventData.chairs && Array.isArray(eventData.chairs)) {
    console.log("\n🪑 Processing chairs for FormData...");
    
    // Filter out chairs with empty required fields
    const validChairs = eventData.chairs.filter(chair => {
      const hasValidName = chair.name && chair.name.trim().length > 0;
      const hasValidPosition = chair.position && chair.position.trim().length > 0;
      const hasValidCompany = chair.company && chair.company.trim().length > 0;
      
      if (!hasValidName || !hasValidPosition || !hasValidCompany) {
        console.log(`❌ Chair filtered out: ${chair.name || 'unnamed'} - missing required fields`);
        return false;
      }
      return true;
    });
    
    console.log(`✅ Valid chairs: ${validChairs.length}/${eventData.chairs.length}`);
    
    if (validChairs.length > 0) {
      validChairs.forEach((chair, index) => {
        console.log(`\n👤 Processing Chair ${index + 1}: ${chair.name}`);
        
        const chairName = chair.name.trim();
        const chairPosition = chair.position.trim();
        const chairCompany = chair.company.trim();
        const chairSortOrder = chair.sort_order || (index + 1);
        
        formData.append(`chairs[${index}][name]`, chairName);
        formData.append(`chairs[${index}][position]`, chairPosition);
        formData.append(`chairs[${index}][company]`, chairCompany);
        formData.append(`chairs[${index}][sort_order]`, chairSortOrder);
        
        // CRITICAL: Handle profile image file
        console.log(`🖼️ Chair ${index + 1} image check:`, {
          hasProfileImage: !!chair.profile_image,
          isFile: chair.profile_image instanceof File,
          profileImageType: chair.profile_image ? chair.profile_image.constructor.name : 'null'
        });
        
        if (chair.profile_image instanceof File) {
          console.log(`✅ Adding profile image for chair ${index + 1}:`, {
            name: chair.profile_image.name,
            size: chair.profile_image.size,
            type: chair.profile_image.type
          });
          formData.append(`chairs[${index}][profile_image]`, chair.profile_image);
        } else {
          console.log(`⚪ No valid profile image for chair ${index + 1}`);
        }
      });
    } else {
      console.log("❌ No valid chairs to process");
    }
  } else {
    console.log("❌ No chairs array found in event data");
  }
  
  return formData;
}

// Test with sample data that matches the real scenario
function runChairUploadDebugTest() {
  console.log("🧪 CHAIR UPLOAD DEBUG TEST");
  console.log("=" .repeat(60));
  
  // Create test data that matches what the frontend sends
  const testEventData = {
    name: "Test Event",
    category_id: 1,
    description: "Test Description",
    start_date: "2025-08-20T10:00:00.000Z",
    end_date: "2025-08-20T18:00:00.000Z",
    location: "Test Location",
    event_slug: "test-event",
    chairs: [
      {
        name: "John Doe",
        position: "CEO",
        company: "Tech Corp",
        sort_order: 1,
        profile_image: new MockFile("john-doe.jpg", 1024 * 500, "image/jpeg"), // 500KB
        avatar: "" // This would be set by the frontend
      },
      {
        name: "Jane Smith",
        position: "CTO", 
        company: "Tech Corp",
        sort_order: 2,
        profile_image: new MockFile("jane-smith.png", 1024 * 800, "image/png"), // 800KB
        avatar: ""
      },
      {
        name: "Bob Wilson",
        position: "CFO",
        company: "Tech Corp", 
        sort_order: 3,
        profile_image: null, // No image
        avatar: ""
      }
    ]
  };
  
  try {
    const formData = debugCreateEventFormData(testEventData);
    
    console.log("\n🔍 FINAL FORMDATA ANALYSIS:");
    console.log("=" .repeat(30));
    
    const entries = formData.entries();
    let chairCount = 0;
    let chairImageCount = 0;
    
    for (const [key, value] of entries) {
      if (key.includes('chairs[') && key.includes('][name]')) {
        chairCount++;
      }
      if (key.includes('chairs[') && key.includes('][profile_image]')) {
        chairImageCount++;
        console.log(`✅ Chair image found in FormData: ${key}`);
      }
    }
    
    console.log(`\n📊 FormData Summary:`);
    console.log(`   - Total chairs in FormData: ${chairCount}`);
    console.log(`   - Chair images in FormData: ${chairImageCount}`);
    console.log(`   - Expected chairs: 3`);
    console.log(`   - Expected images: 2 (John and Jane have images, Bob doesn't)`);
    
    if (chairCount === 3 && chairImageCount === 2) {
      console.log(`\n✅ FORMDATA CREATION IS CORRECT!`);
      console.log(`   The issue is likely on the server side or in the API processing.`);
      
      console.log(`\n🔍 POSSIBLE CAUSES:`);
      console.log(`   1. Server not processing multipart/form-data correctly`);
      console.log(`   2. File upload middleware not configured properly`);
      console.log(`   3. API endpoint not handling chair profile images`);
      console.log(`   4. Database not storing the image URLs correctly`);
      console.log(`   5. File storage (disk/S3) not working properly`);
      
      return true;
    } else {
      console.log(`\n❌ FORMDATA CREATION HAS ISSUES!`);
      console.log(`   Expected: 3 chairs, 2 images`);
      console.log(`   Got: ${chairCount} chairs, ${chairImageCount} images`);
      return false;
    }
    
  } catch (error) {
    console.error("❌ Debug test failed:", error.message);
    return false;
  }
}

// Test different scenarios
function runScenarioDebugTests() {
  console.log("\n🧪 SCENARIO DEBUG TESTS");
  console.log("=" .repeat(40));
  
  // Scenario 1: Chair with missing required fields
  console.log("\n📝 Scenario 1: Chair with missing required fields");
  const invalidChairData = {
    name: "Test Event",
    category_id: 1,
    description: "Test Description", 
    start_date: "2025-08-20T10:00:00.000Z",
    end_date: "2025-08-20T18:00:00.000Z",
    location: "Test Location",
    event_slug: "test-event",
    chairs: [
      {
        name: "John Doe",
        position: "", // Missing position
        company: "Tech Corp",
        profile_image: new MockFile("john.jpg", 1024, "image/jpeg")
      }
    ]
  };
  
  const result1 = debugCreateEventFormData(invalidChairData);
  console.log(`Result: Chair should be filtered out due to missing position`);
  
  // Scenario 2: Chair with non-File profile_image
  console.log("\n📝 Scenario 2: Chair with non-File profile_image");
  const nonFileImageData = {
    name: "Test Event",
    category_id: 1,
    description: "Test Description",
    start_date: "2025-08-20T10:00:00.000Z", 
    end_date: "2025-08-20T18:00:00.000Z",
    location: "Test Location",
    event_slug: "test-event",
    chairs: [
      {
        name: "John Doe",
        position: "CEO",
        company: "Tech Corp",
        profile_image: "not-a-file-object" // String instead of File
      }
    ]
  };
  
  const result2 = debugCreateEventFormData(nonFileImageData);
  console.log(`Result: Image should be skipped since it's not a File object`);
  
  console.log("\n🏁 Scenario debug tests completed!");
}

// Run all debug tests
console.log("🚀 CHAIR IMAGE UPLOAD DEBUG SESSION");
console.log("=" .repeat(60));

const mainResult = runChairUploadDebugTest();
runScenarioDebugTests();

console.log("\n" + "=" .repeat(60));
console.log(`🎯 DEBUG RESULT: ${mainResult ? '✅ FRONTEND IS CORRECT' : '❌ FRONTEND HAS ISSUES'}`);

if (mainResult) {
  console.log("\n💡 NEXT STEPS:");
  console.log("   1. Check server-side file upload handling");
  console.log("   2. Verify API endpoint processes chair profile_image");
  console.log("   3. Check file storage configuration");
  console.log("   4. Verify database schema for profile_image_url field");
  console.log("   5. Check server logs for file upload errors");
}

console.log("=" .repeat(60));