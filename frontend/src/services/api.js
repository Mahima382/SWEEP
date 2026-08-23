/**
 * Tiny fetch wrapper for the SWEEP backend REST API.
 * MVC boundary: the View NEVER talks to MySQL — every server call in the
 * frontend must go through this module (proxied to http://localhost:5000
 * by vite.config.js in development).
 */

const BASE_URL = '/api';

/**
 * Perform an HTTP request against the backend API and parse the JSON body.
 * @param {string} path API path beginning with '/', e.g. '/auth/login'.
 * @param {object} [options] Fetch options (method, headers, body...).
 * @returns {Promise<object>} The parsed JSON response body.
 * @throws {Error} When the response status is not ok; the error carries
 *   a `status` property and the server message when available.
 */
export async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  let body = null;
  try {
    body = await response.json();
  } catch (parseError) {
    body = null;
  }

  if (!response.ok) {
    const message = (body && body.message) || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return body;
}

/**
 * Send a GET request to the backend API.
 * @param {string} path API path, e.g. '/waste/listings'.
 * @returns {Promise<object>} The parsed JSON response body.
 */
export function get(path) {
  return request(path, { method: 'GET' });
}

/**
 * Send a POST request with a JSON payload to the backend API.
 * @param {string} path API path, e.g. '/auth/login'.
 * @param {object} data Payload to serialise as the JSON body.
 * @returns {Promise<object>} The parsed JSON response body.
 */
export function post(path, data) {
  return request(path, { method: 'POST', body: JSON.stringify(data) });
}

export default { request, get, post };
