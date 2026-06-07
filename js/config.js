// Frontend API configuration
// If the frontend is hosted separately from the backend, set the backend API origin here.
// Example:
// const CONFIG = {
//   API_URL: 'https://dresslux-api-xxxx.onrender.com'  // ← paste real URL here
// };

const CONFIG = {
  API_URL: 'https://dresslux-api.onrender.com'  // ← your real URL
};
window.CONFIG = CONFIG;

const LOCAL_BACKEND = "http://localhost:3000/api";
const PRODUCTION_BACKEND = `${CONFIG.API_URL}/api`; // replace with your real backend URL when deployed

window.API_BASE = window.API_BASE || (
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? LOCAL_BACKEND
    : PRODUCTION_BACKEND
);
