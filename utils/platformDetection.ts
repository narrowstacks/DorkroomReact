import { Platform } from "react-native";

/**
 * Platform types supported by the app
 */
export type PlatformType = "web" | "native";

/**
 * API endpoint configuration
 */
export interface ApiEndpointConfig {
  baseUrl: string;
  platform: PlatformType;
  requiresAuth: boolean;
}

/**
 * Get the current platform type
 */
export function getPlatformType(): PlatformType {
  return Platform.OS === "web" ? "web" : "native";
}

/**
 * Check if the app is running on web platform
 */
export function isWebPlatform(): boolean {
  return Platform.OS === "web";
}

/**
 * Check if the app is running on native platform
 */
export function isNativePlatform(): boolean {
  return Platform.OS !== "web";
}

/**
 * Get the appropriate API endpoint configuration based on the platform
 */
export function getApiEndpointConfig(): ApiEndpointConfig {
  if (isWebPlatform()) {
    // For web platform, use the local API route which proxies to Supabase
    return {
      baseUrl: "/api",
      platform: "web",
      requiresAuth: false, // No auth required since the proxy handles the API key
    };
  } else {
    // For native platform, use the deployed Vercel function
    // This should be the deployed URL of your Vercel app
    const deployedUrl =
      process.env.EXPO_PUBLIC_VERCEL_URL ||
      process.env.EXPO_PUBLIC_API_URL ||
      "https://your-app.vercel.app";

    return {
      baseUrl: `${deployedUrl}/api`,
      platform: "native",
      requiresAuth: false, // No auth required since the proxy handles the API key
    };
  }
}

/**
 * Get the full API URL for a specific endpoint
 */
export function getApiUrl(endpoint: string): string {
  const config = getApiEndpointConfig();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const cleanBaseUrl = config.baseUrl.endsWith("/")
    ? config.baseUrl.slice(0, -1)
    : config.baseUrl;

  return `${cleanBaseUrl}/${cleanEndpoint}`;
}

/**
 * Environment configuration helper
 */
export function getEnvironmentConfig() {
  return {
    isDevelopment: __DEV__,
    platform: getPlatformType(),
    apiEndpoint: getApiEndpointConfig(),
  };
}
