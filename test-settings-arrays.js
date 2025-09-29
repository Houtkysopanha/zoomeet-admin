// Test script to verify array handling in SettingPolicy.vue
// This can be run in the browser console to test the functionality

console.log('🧪 Testing SettingPolicy Array Handling');

// Test data structure from API (as shown in Postman)
const testApiData = {
    "id": 17,
    "event_id": "b8abd7cf-8b53-4151-9b64-72040afd2a49",
    "registration_dateline": "2025-09-12T00:00:00+07:00",
    "qrcode_available_hours": 1,
    "max_ticket_per_person": 5,
    "refund_policy_id": 1,
    "ticket_transfer_deadline": "2025-09-12T00:00:00+07:00",
    "terms_and_condition": null,
    "special_instructions": null,
    "is_required_age_verification": true,
    "maximum_age": 16,
    "required_identity_document": ["passport", "driver_license"],
    "is_accept_cash_payment": false,
    "is_required_registration_before_checkin": false,
    "provide_special_assistance": ["wheelchair", "disability"]
};

// Test expected component data structure
const expectedComponentData = {
    requiredIdentityDocuments: ["passport", "driver_license"],
    provideSpecialAssistance: ["wheelchair", "disability"]
};

// Test expected API payload structure
const expectedApiPayload = {
    registration_dateline: "2025-09-12 00:00:00",
    qrcode_available_hours: 1,
    max_ticket_per_person: 5,
    refund_policy_id: 1,
    ticket_transfer_deadline: "2025-09-12 00:00:00",
    terms_and_condition: "Hello",
    special_instructions: "Hello",
    is_accept_cash_payment: 0,
    is_required_registration_before_checkin: 0,
    is_required_age_verification: 1,
    maximum_age: 16,
    required_identity_document: ["driver_license", "national_id_card"],
    provide_special_assistance: ["wheelchair", "pregnancy"]
};

console.log('✅ Test API Data:', testApiData);
console.log('✅ Expected Component Data:', expectedComponentData);
console.log('✅ Expected API Payload:', expectedApiPayload);

// Validation functions
function validateArrayHandling() {
    console.log('🔍 Validating array handling...');
    
    // Test array from API to component
    const apiToComponent = {
        requiredIdentityDocuments: Array.isArray(testApiData.required_identity_document)
            ? testApiData.required_identity_document
            : (testApiData.required_identity_document ? [testApiData.required_identity_document] : []),
        provideSpecialAssistance: Array.isArray(testApiData.provide_special_assistance)
            ? testApiData.provide_special_assistance
            : (testApiData.provide_special_assistance ? [testApiData.provide_special_assistance] : [])
    };
    
    console.log('📥 API to Component:', apiToComponent);
    
    // Test component to API
    const componentToApi = {
        required_identity_document: Array.isArray(expectedComponentData.requiredIdentityDocuments) 
            ? expectedComponentData.requiredIdentityDocuments.filter(doc => doc && doc.trim() !== '') 
            : [],
        provide_special_assistance: Array.isArray(expectedComponentData.provideSpecialAssistance) 
            ? expectedComponentData.provideSpecialAssistance.filter(assistance => assistance && assistance.trim() !== '') 
            : []
    };
    
    console.log('📤 Component to API:', componentToApi);
    
    // Validate results
    const isApiToComponentValid = JSON.stringify(apiToComponent.requiredIdentityDocuments) === JSON.stringify(expectedComponentData.requiredIdentityDocuments) &&
                                  JSON.stringify(apiToComponent.provideSpecialAssistance) === JSON.stringify(expectedComponentData.provideSpecialAssistance);
    
    const isComponentToApiValid = JSON.stringify(componentToApi.required_identity_document) === JSON.stringify(expectedApiPayload.required_identity_document) &&
                                  JSON.stringify(componentToApi.provide_special_assistance) === JSON.stringify(expectedApiPayload.provide_special_assistance);
    
    console.log('✅ API to Component Valid:', isApiToComponentValid);
    console.log('✅ Component to API Valid:', isComponentToApiValid);
    
    return isApiToComponentValid && isComponentToApiValid;
}

// Run validation
const isValid = validateArrayHandling();
console.log('🎯 Overall Validation Result:', isValid ? '✅ PASSED' : '❌ FAILED');

export { validateArrayHandling, testApiData, expectedComponentData, expectedApiPayload };