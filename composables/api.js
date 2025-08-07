import { useFetch, useRuntimeConfig } from '#app';

// This helper function now gets the token from runtime config
function getAuthToken() {
  const config = useRuntimeConfig();
  return `Bearer ${config.public.bearerToken}`;
}

/**
 * Generic function to handle API requests.
 * @param {string} endpoint - The API endpoint to call.
 * @param {string} [method='GET'] - The HTTP method.
 * @param {object|null} [body=null] - The request body for POST/PUT requests.
 * @param {boolean} [requiresAuth=true] - Whether to include the Authorization header.
 */
async function apiRequest(endpoint, method = 'GET', body = null, requiresAuth = true) {
  // Get the runtime configuration
  const config = useRuntimeConfig();
  const API_BASE_URL = config.public.apiBaseUrl;

  // Check if the base URL is configured
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured. Check your .env file and nuxt.config.ts');
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Conditionally add the Authorization header
    if (requiresAuth) {
      headers['Authorization'] = getAuthToken();
    }

    const { data, error } = await useFetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    if (error.value) {
      throw new Error(error.value.data?.message || error.value.statusMessage);
    }

    return data.value;
  } catch (err) {
    console.error('API Request Error:', err);
    throw err;
  }
}

/**
 * Logs the user in by sending credentials. No Bearer token is sent.
 * @param {string} identifier - The username or email.
 * @param {string} password - The password.
 * @returns {Promise<object>} The response data from the API.
 */
export async function login(identifier, password) {
  // Call apiRequest with the `requiresAuth` parameter set to false
  return apiRequest('/login', 'POST', { identifier, password }, false);
}

export default {
  login,
};