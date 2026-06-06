// Frontend API configuration
// If the frontend is hosted separately from the backend, set the backend API origin here.
// Example:
// window.API_BASE = "https://your-backend-domain.com/api";

const LOCAL_BACKEND = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  && window.location.port !== "3000"
  ? "http://localhost:3000/api"
  : "/api";

window.API_BASE = window.API_BASE || LOCAL_BACKEND;
