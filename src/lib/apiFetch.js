"use client";
import { apiClient } from "./apiClient";

/**
 * Legacy wrapper for apiFetch to support existing calls
 * @param {string} url - The URL/endpoint to fetch
 * @param {object} options - Fetch options
 */
export async function apiFetch(url, options = {}) {
  // Pass directly to the request method of our new client
  return await apiClient.request(url, options);
}
