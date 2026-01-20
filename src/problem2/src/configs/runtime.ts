// Load runtime config if available
const runtimeConfig = (window as any).__RUNTIME_CONFIG__ || {}

// Get API URL from runtime config or fall back to Vite env variable
export const API_URL = runtimeConfig.VITE_API_URL || import.meta.env.VITE_API_URL
