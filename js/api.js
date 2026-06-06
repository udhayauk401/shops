/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* DRESSLUX BACKEND API HELPER */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// Backend Server Base URL
const API_BASE = "http://localhost:3000/api";
const IS_BACKEND_API = true;

/**
 * Generic API wrapper for backend calls
 */
async function apiCall(endpoint, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();

    if (!data.success && response.status !== 200) {
      console.error(`API Error [${method} ${endpoint}]:`, data.error);
      throw new Error(data.error || `API error: ${response.status}`);
    }

    return data.data || data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

/**
 * Authentication APIs
 */
async function registerUser(name, email, password, confirmPassword) {
  try {
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }
    const result = await apiCall("/auth/register", "POST", { name, email, password, confirmPassword });
    return result;
  } catch (error) {
    throw error;
  }
}

async function loginUser(email, password) {
  try {
    const result = await apiCall("/auth/login", "POST", { email, password });
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Product APIs
 */
async function fetchAllProducts() {
  try {
    const response = await apiCall("/products");
    return response.data || response;
  } catch (error) {
    throw error;
  }
}

async function fetchProductById(productId) {
  try {
    const result = await apiCall(`/products/${productId}`);
    return result;
  } catch (error) {
    throw error;
  }
}

async function addProduct(productData) {
  try {
    const result = await apiCall("/products", "POST", productData);
    return result;
  } catch (error) {
    throw error;
  }
}

async function updateProduct(productId, productData) {
  try {
    const result = await apiCall(`/products/${productId}`, "PATCH", productData);
    return result;
  } catch (error) {
    throw error;
  }
}

async function fetchProductByIdAPI(productId) {
  try {
    const result = await apiCall(`/products/${productId}`);
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Order APIs
 */
async function placeOrderAPI(orderData) {
  try {
    const result = await apiCall("/orders", "POST", orderData);
    return result;
  } catch (error) {
    throw error;
  }
}

async function fetchUserOrdersAPI(userId) {
  try {
    const response = await apiCall(`/orders/user/${userId}`);
    return response.data || response;
  } catch (error) {
    throw error;
  }
}

async function fetchAdminOrders() {
  try {
    const response = await apiCall("/admin/orders");
    return response.data || response;
  } catch (error) {
    throw error;
  }
}

async function updateOrderStatusAPI(orderId, status) {
  try {
    const result = await apiCall(`/orders/${orderId}`, "PATCH", { status });
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Notification APIs
 */
async function fetchUserNotificationsAPI(userId) {
  try {
    const response = await apiCall(`/notifications/${userId}`);
    return response.data || response;
  } catch (error) {
    throw error;
  }
}

async function markNotificationAsReadAPI(notificationId) {
  try {
    const result = await apiCall(`/notifications/${notificationId}/read`, "PATCH");
    return result;
  } catch (error) {
    throw error;
  }
}

async function deleteNotificationAPI(notificationId) {
  try {
    const result = await apiCall(`/notifications/${notificationId}`, "DELETE");
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Admin APIs
 */
async function fetchAdminStatsAPI() {
  try {
    const response = await apiCall("/admin/stats");
    return response.data || response;
  } catch (error) {
    throw error;
  }
}

async function fetchAllCustomersAPI() {
  try {
    const response = await apiCall("/admin/customers");
    return response.data || response;
  } catch (error) {
    throw error;
  }
}

async function updateAdminUser(userId, data) {
  try {
    const result = await apiCall(`/admin/users/${userId}`, "PATCH", data);
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Payment APIs
 */
async function generateUPILinks(productName, amount, customerName) {
  try {
    const result = await apiCall("/payment/generate-upi", "POST", {
      productName,
      amount,
      customerName,
    });
    return result;
  } catch (error) {
    throw error;
  }
}

async function confirmPayment(orderId) {
  try {
    const result = await apiCall(`/payment/confirm/${orderId}`, "PATCH");
    return result;
  } catch (error) {
    throw error;
  }
}


/**
 * Check if API is configured
 */
function isAPIConfigured() {
  return API_KEY !== "YOUR_ATLAS_API_KEY" && API_BASE.includes("/app/") && !API_BASE.includes("YOUR_APP_ID");
}

/**
 * Show toast notification
 */
function showToast(message, duration = 3000) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
}

/**
 * Show error toast
 */
function showErrorToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.style.backgroundColor = "#d32f2f";
  toast.textContent = `❌ ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/**
 * Show success toast
 */
function showSuccessToast(message) {
  showToast(`✓ ${message}`, 3000);
}
