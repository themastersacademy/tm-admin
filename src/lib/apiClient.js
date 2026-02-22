"use client";

class ApiClient {
  constructor(baseURL = "") {
    this.baseURL = baseURL;
    this.inflightRequests = new Map();
  }

  async request(endpoint, options = {}) {
    // Ensure endpoint starts with a slash if not empty
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseURL}${endpoint}`;
    const method = (options.method || "GET").toUpperCase();

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: "include", // Always include cookies
    };

    const canDedupe = method === "GET" && !(options.signal instanceof AbortSignal);
    const requestKey = canDedupe ? `${method}:${url}` : null;

    if (canDedupe && this.inflightRequests.has(requestKey)) {
      return this.inflightRequests.get(requestKey);
    }

    const requestPromise = (async () => {
      try {
        const response = await fetch(url, config);

        // Handle 401 Unauthorized globally
        if (response.status === 401) {
          return this.handleUnauthorized();
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        }

        if (!response.ok) {
          return {
            success: false,
            status: response.status,
            message: response.statusText,
          };
        }

        return {
          success: false,
          message: "Unexpected response format",
        };
      } catch (error) {
        if (error.name === "AbortError") {
          return {
            success: false,
            isAborted: true,
            message: "Request cancelled",
          };
        }
        console.error("API Request Failed:", error);
        return { success: false, message: error.message };
      }
    })();

    if (!canDedupe) {
      return requestPromise;
    }

    this.inflightRequests.set(requestKey, requestPromise);
    try {
      return await requestPromise;
    } finally {
      this.inflightRequests.delete(requestKey);
    }
  }

  handleUnauthorized() {
    console.warn("Session expired or unauthorized access.");

    // Critical Fix: check if we are already on the login page
    // Using window object since this runs on client
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;

      // If we are already on login, do NOT reload or redirect
      if (pathname === "/login") {
        return { success: false, message: "Unauthorized", status: 401 };
      }

      // Dispatch event for UI notifications (e.g., Snackbar)
      const event = new CustomEvent("sessionExpired", {
        detail: {
          message: "Session expired, redirecting to login",
          variant: "error",
        },
      });
      window.dispatchEvent(event);

      // Delay redirect to allow user to see message
      setTimeout(() => {
        window.location.assign("/login");
      }, 3000);
    }

    return null; // Return null or specific error object
  }

  get(endpoint, headers = {}) {
    return this.request(endpoint, { method: "GET", headers });
  }

  post(endpoint, body = {}, headers = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      headers,
    });
  }

  put(endpoint, body = {}, headers = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      headers,
    });
  }

  delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: "DELETE", headers });
  }
}

// Export a singleton instance or the class
export const apiClient = new ApiClient();
export default ApiClient;
