import { QueryClient } from "@tanstack/react-query";

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Utility function for making API requests with the fetch API
export async function apiRequest(
  method: string,
  url: string,
  body?: any
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // For non-2xx responses, still return the response object
      // so the caller can handle the error appropriately
      return response;
    }
    
    return response;
  } catch (error) {
    // Network errors or other unexpected issues
    console.error("API request failed:", error);
    throw error;
  }
}

// Helper to extract structured data from response
export async function extractData<T>(response: Response): Promise<T> {
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      throw new Error("Non-JSON response received");
    }
  } catch (error) {
    console.error("Failed to extract data from response:", error);
    throw error;
  }
}