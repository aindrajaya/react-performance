/**
 * Work Orders API Service
 * Handles fetching work orders from the backend API with fallback to mock data
 */

import { generateWorkOrders } from '../utils/mockData';

const API_BASE_URL = 'https://extra-aubry-chainx-d938c098.koyeb.app';
const API_TIMEOUT = 8000; // 8 second timeout

/**
 * Fetch work orders from the API with timeout
 * @param {Object} options - Fetch options
 * @param {AbortSignal} options.signal - Abort signal for cancellation
 * @returns {Promise<Object>} Response with work orders
 */
export async function fetchWorkOrders({ signal } = {}) {
  // Create a timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('API request timeout')), API_TIMEOUT);
  });

  try {
    const url = `${API_BASE_URL}/workorders`;
    
    // Race between fetch and timeout
    const response = await Promise.race([
      fetch(url, {
        signal,
        headers: {
          'Accept': 'application/json',
        },
      }),
      timeoutPromise
    ]);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // API returns array directly
    if (Array.isArray(data)) {
      return {
        data,
        total: data.length,
        source: 'api'
      };
    }
    
    return {
      data: data.items || data.data || data,
      total: data.total || (data.items || data.data || data).length,
      source: 'api'
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request was cancelled');
    }
    
    // Fallback to mock data if API fails
    console.warn('API request failed, using mock data:', error.message);
    const mockData = generateWorkOrders(50000);
    return {
      data: mockData,
      total: mockData.length,
      source: 'mock',
      error: error.message
    };
  }
}
