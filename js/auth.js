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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Customer profile side panel (slide-in) */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ensureProfilePanel() {
  if (document.getElementById("profile-sidepanel")) return;

  const panel = document.createElement("div");
  panel.id = "profile-sidepanel";
  panel.style.position = "fixed";
  panel.style.top = "0";
  panel.style.right = "-420px";
  panel.style.width = "380px";
  panel.style.height = "100%";
  panel.style.background = "#fff";
  panel.style.boxShadow = "-4px 0 14px rgba(0,0,0,0.08)";
  panel.style.zIndex = "10000";
  panel.style.transition = "right 0.28s ease";
  panel.innerHTML = `
    <div style="padding:1rem; display:flex; flex-direction:column; height:100%;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0;">My Profile</h3>
        <button id="close-profile-panel" class="btn btn-outline">Close</button>
      </div>
      <div style="margin-top:1rem; flex:1; overflow:auto;">
        <div class="form-group">
          <label>Name</label>
          <input id="profile-name" type="text" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input id="profile-email" type="email" />
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input id="profile-phone" type="tel" />
        </div>
        <div class="form-group">
          <label>Street Address</label>
          <input id="profile-street" type="text" />
        </div>
        <div class="form-group">
          <label>City</label>
          <input id="profile-city" type="text" />
        </div>
        <div class="form-group">
          <label>Pincode</label>
          <input id="profile-pincode" type="text" />
        </div>
      </div>
      <div style="margin-top:1rem; display:flex; gap:0.5rem;">
        <button id="save-profile-btn" class="btn btn-primary" style="flex:1;">Save</button>
        <button id="cancel-profile-btn" class="btn btn-outline" style="flex:1;">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  document.getElementById("close-profile-panel").addEventListener("click", closeProfilePanel);
  document.getElementById("cancel-profile-btn").addEventListener("click", closeProfilePanel);
  document.getElementById("save-profile-btn").addEventListener("click", saveProfileFromPanel);
}

function openProfilePanel() {
  ensureProfilePanel();
  const user = getCurrentUser();
  if (!user) {
    showErrorToast("Not signed in");
    return;
  }

  document.getElementById("profile-name").value = user.name || "";
  document.getElementById("profile-email").value = user.email || "";
  // Last shipping address may be stored on user
  const addr = user.lastShippingAddress || {};
  document.getElementById("profile-phone").value = addr.phone || user.phone || "";
  document.getElementById("profile-street").value = addr.address || "";
  document.getElementById("profile-city").value = addr.city || "";
  document.getElementById("profile-pincode").value = addr.pincode || "";

  const panel = document.getElementById("profile-sidepanel");
  panel.style.right = "0";
}

function closeProfilePanel() {
  const panel = document.getElementById("profile-sidepanel");
  if (!panel) return;
  panel.style.right = "-420px";
}

function saveProfileFromPanel() {
  const name = document.getElementById("profile-name").value.trim();
  const email = document.getElementById("profile-email").value.trim().toLowerCase();
  const phone = document.getElementById("profile-phone").value.trim();

  const street = document.getElementById("profile-street").value.trim();
  const city = document.getElementById("profile-city").value.trim();
  const pincode = document.getElementById("profile-pincode").value.trim();

  if (!name || !email) {
    showErrorToast("Name and email required");
    return;
  }

  const user = getCurrentUser();
  if (!user) return;

  // Update local storage user object
  user.name = name;
  user.email = email;
  // store phone and lastShippingAddress locally
  user.phone = phone;
  user.lastShippingAddress = { fullName: name, address: street, city: city, pincode: pincode, phone };
  setCurrentUser(user);

  showSuccessToast("Profile saved locally");
  closeProfilePanel();
}

// Attach click handler to profile icon(s) on load
document.addEventListener("DOMContentLoaded", () => {
  // Replace existing icon logout behaviour: find anchors with '👤' and switch to openProfilePanel
  document.querySelectorAll(".navbar-icon-link").forEach((a) => {
    if (a.textContent && a.textContent.trim() === "👤") {
      a.removeAttribute("onclick");
      a.addEventListener("click", (e) => {
        e.preventDefault();
        openProfilePanel();
      });
    }
  });
});

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
