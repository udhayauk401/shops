/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* AUTHENTICATION & SESSION MANAGEMENT */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Get current authenticated user from localStorage
 */
function getCurrentUser() {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
}

/**
 * Set current user in localStorage
 */
function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

/**
 * Clear current user from localStorage
 */
function clearCurrentUser() {
  localStorage.removeItem("currentUser");
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return getCurrentUser() !== null;
}

/**
 * Check if user is admin
 */
function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === "admin";
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function isValidPassword(password) {
  return password && password.length >= 6;
}

/**
 * Simple password hashing (not cryptographically secure, use server-side hashing in production)
 */
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Register new user
 */
async function handleRegisterUser(name, email, password, confirmPassword) {
  // Validation
  if (!name || !email || !password || !confirmPassword) {
    showErrorToast("All fields are required");
    return false;
  }

  if (!isValidEmail(email)) {
    showErrorToast("Please enter a valid email address");
    return false;
  }

  if (!isValidPassword(password)) {
    showErrorToast("Password must be at least 6 characters long");
    return false;
  }

  if (password !== confirmPassword) {
    showErrorToast("Passwords do not match");
    return false;
  }

  try {
    // Call backend API to register
    const result = await registerUser(name, email, password, confirmPassword);
    
    showSuccessToast("Registration successful! Redirecting to login...");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
    return true;
  } catch (error) {
    console.error("Registration error:", error);
    showErrorToast("Registration failed: " + error.message);
    return false;
  }
}

/**
 * Login user
 */
async function handleLoginUser(email, password) {
  // Validation
  if (!email || !password) {
    showErrorToast("Email and password are required");
    return false;
  }

  if (!isValidEmail(email)) {
    showErrorToast("Please enter a valid email address");
    return false;
  }

  try {
    // Call backend API to login
    const user = await loginUser(email, password);

    if (user && user._id) {
      // Store user in localStorage
      const userToStore = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      };

      setCurrentUser(userToStore);
      showSuccessToast("Login successful!");

      // Redirect based on role
      setTimeout(() => {
        if (user.role === "admin") {
          window.location.href = "admin/admin-dashboard.html";
        } else {
          window.location.href = "dashboard.html";
        }
      }, 1000);

      return true;
    }
  } catch (error) {
    console.error("Login error:", error);
    showErrorToast("Login failed: " + error.message);
    return false;
  }
}

/**
 * Logout user
 */
function logoutUser() {
  clearCurrentUser();
  localStorage.removeItem("cart");
  localStorage.removeItem("notifications");
  showSuccessToast("Logged out successfully");
  setTimeout(() => {
    window.location.href = "../pages/login.html";
  }, 500);
}

/**
 * Check authentication and redirect if not authenticated
 * Use this at the top of protected pages
 */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = "../pages/login.html";
  }
}

/**
 * Check admin authentication and redirect if not admin
 * Use this at the top of admin pages
 */
function requireAdminAuth() {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    window.location.href = "../../pages/login.html";
  }
}

/**
 * Get unread notification count
 */
function getNotificationCount() {
  const user = getCurrentUser();
  if (!user) return 0;

  const notifications = localStorage.getItem("notifications");
  if (!notifications) return 0;

  try {
    const notifArray = JSON.parse(notifications);
    return notifArray.filter((n) => !n.isRead && n.userId === user._id).length;
  } catch (e) {
    return 0;
  }
}

/**
 * Update notification count badge in navbar
 */
function updateNotificationBadge() {
  const badge = document.getElementById("notification-count");
  if (badge) {
    const count = getNotificationCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

/**
 * Update cart count badge in navbar
 */
function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (badge) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    badge.textContent = count;
  }
}
