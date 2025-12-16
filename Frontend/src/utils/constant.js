// Central place for frontend constants
// API base is derived dynamically:
// - For localhost dev, target the backend on port 3000
// - For production, use the deployed Render backend URL
const { hostname } = window.location;

let resolvedApiBase = "https://sweet-shop-management-system-carb.onrender.com";
if (hostname === "localhost" || hostname === "127.0.0.1") {
  resolvedApiBase = "http://localhost:3000";
}

export const API_BASE_URL = resolvedApiBase;
