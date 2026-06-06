// Frontend API configuration
// If the frontend is hosted separately from the backend, set the backend API origin here.
// Example:
// window.API_BASE = "https://your-backend-domain.com/api";

const LOCAL_BACKEND = "http://localhost:3000/api";
const PRODUCTION_BACKEND = "https://dresslux-api.onrender.com/api"; // replace with your real backend URL when deployed

window.API_BASE = window.API_BASE || (
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? LOCAL_BACKEND
    : PRODUCTION_BACKEND
);
