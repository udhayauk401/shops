/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* ORDER MANAGEMENT */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Place order
 */
async function placeOrder(formData) {
  const user = getCurrentUser();
  const cart = getCart();

  if (cart.length === 0) {
    showErrorToast("Your cart is empty");
    return false;
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = {
    userId: user._id,
    items: cart,
    totalAmount,
    shippingAddress: {
      fullName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      pincode: formData.pincode,
    },
    paymentMethod: "COD",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  try {
    // Insert order
    const orderResult = await insertOne("orders", order);

    if (!orderResult || !orderResult.insertedId) {
      showErrorToast("Failed to place order");
      return false;
    }

    const orderId = orderResult.insertedId;

    // Create notification
    await insertOne("notifications", {
      userId: user._id,
      message: `Your order #${orderId.substring(0, 8)} has been placed successfully!`,
      type: "order",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // Store last order in localStorage for payment page
    localStorage.setItem(
      "lastOrder",
      JSON.stringify({
        _id: orderId,
        ...order,
      })
    );

    // Clear cart
    clearCart();

    showSuccessToast("Order placed successfully!");
    setTimeout(() => {
      window.location.href = "payment.html";
    }, 1500);

    return true;
  } catch (error) {
    console.error("Order placement error:", error);
    showErrorToast("Failed to place order: " + error.message);
    return false;
  }
}

/**
 * Fetch user's orders
 */
async function fetchUserOrders() {
  const user = getCurrentUser();

  if (!user) {
    return [];
  }

  try {
    const result = await find("orders", { userId: user._id }, { createdAt: -1 }, 100);
    return result && result.documents ? result.documents : [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    showErrorToast("Failed to load orders");
    return [];
  }
}

/**
 * Get status badge color
 */
function getStatusBadgeClass(status) {
  switch (status) {
    case "pending":
      return "badge-warning";
    case "processing":
      return "badge-info";
    case "shipped":
      return "badge-primary";
    case "delivered":
      return "badge-success";
    default:
      return "badge-primary";
  }
}

/**
 * Format date
 */
function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Render orders on My Orders page
 */
function renderOrders(orders) {
  const container = document.getElementById("orders-container");

  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <h2>No orders yet</h2>
        <p>Start shopping to place your first order!</p>
        <a href="dashboard.html" class="btn btn-primary" style="margin-top: 1rem;">Shop Now</a>
      </div>
    `;
    return;
  }

  container.innerHTML = orders
    .map(
      (order) => `
    <div class="card" style="margin-bottom: 1.5rem;">
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <div>
          <p style="margin: 0; color: var(--gray); font-size: 0.9rem;">Order ID</p>
          <p style="margin: 0.3rem 0 0 0; font-weight: 700;">#${order._id.substring(0, 8).toUpperCase()}</p>
        </div>
        <div>
          <p style="margin: 0; color: var(--gray); font-size: 0.9rem;">Date</p>
          <p style="margin: 0.3rem 0 0 0; font-weight: 600;">${formatDate(order.createdAt)}</p>
        </div>
        <div>
          <p style="margin: 0; color: var(--gray); font-size: 0.9rem;">Total Amount</p>
          <p style="margin: 0.3rem 0 0 0; font-weight: 700; color: var(--primary);">₹${order.totalAmount.toFixed(2)}</p>
        </div>
      </div>
      <div style="border-top: 1px solid var(--border); padding-top: 1rem; margin-bottom: 1rem;">
        <p style="margin: 0 0 0.5rem 0; color: var(--gray); font-size: 0.9rem;">Items (${order.items.length})</p>
        <p style="margin: 0; color: var(--dark);">${order.items.map((i) => `${i.name} (${i.quantity}x)`).join(", ")}</p>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="badge ${getStatusBadgeClass(order.status)}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
        <button class="btn btn-small btn-outline" onclick="viewOrderDetails('${order._id}')">View Details</button>
      </div>
    </div>
  `
    )
    .join("");
}

/**
 * View order details (modal or detail page)
 */
function viewOrderDetails(orderId) {
  // For now, just show an alert with the order ID
  alert(`Order Details: ${orderId}\n\nThis feature will show full order details in a popup or detail page.`);
}

/**
 * Initialize My Orders page
 */
async function initMyOrdersPage() {
  requireAuth();

  const orders = await fetchUserOrders();
  renderOrders(orders);

  updateCartBadge();
  updateNotificationBadge();
}

/**
 * Validate order form
 */
function validateOrderForm(formData) {
  if (!formData.fullName || !formData.fullName.trim()) {
    showErrorToast("Full name is required");
    return false;
  }

  if (!formData.phone || !formData.phone.trim()) {
    showErrorToast("Phone number is required");
    return false;
  }

  if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
    showErrorToast("Please enter a valid 10-digit phone number");
    return false;
  }

  if (!formData.address || !formData.address.trim()) {
    showErrorToast("Address is required");
    return false;
  }

  if (!formData.city || !formData.city.trim()) {
    showErrorToast("City is required");
    return false;
  }

  if (!formData.pincode || !formData.pincode.trim()) {
    showErrorToast("Pincode is required");
    return false;
  }

  if (!/^\d{6}$/.test(formData.pincode.replace(/\D/g, ""))) {
    showErrorToast("Please enter a valid 6-digit pincode");
    return false;
  }

  return true;
}

/**
 * Initialize order page
 */
function initOrderPage() {
  requireAuth();

  const cart = getCart();
  if (cart.length === 0) {
    window.location.href = "cart.html";
    return;
  }

  // Display order summary
  const summaryContainer = document.getElementById("order-summary-container");
  if (summaryContainer) {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    summaryContainer.innerHTML = `
      <div class="card">
        <h3>Order Summary</h3>
        <ul style="list-style: none; padding: 0; margin: 1rem 0;">
          ${cart
            .map(
              (item) =>
                `<li style="display: flex; justify-content: space-between; margin-bottom: 0.8rem; padding-bottom: 0.8rem; border-bottom: 1px solid var(--border);">
                <span>${item.name} (${item.quantity}x)</span>
                <span style="font-weight: 600;">₹${(item.price * item.quantity).toFixed(2)}</span>
              </li>`
            )
            .join("")}
        </ul>
        <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 700; color: var(--primary);">
          <span>Total:</span>
          <span>₹${total.toFixed(2)}</span>
        </div>
      </div>
    `;
  }

  // Setup form submission
  const orderForm = document.getElementById("order-form");
  if (orderForm) {
    orderForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = {
        fullName: document.getElementById("fullName").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        city: document.getElementById("city").value,
        pincode: document.getElementById("pincode").value,
      };

      if (!validateOrderForm(formData)) {
        return;
      }

      const submitBtn = orderForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = "Placing Order...";

      await placeOrder(formData);

      submitBtn.disabled = false;
      submitBtn.textContent = "Place Order";
    });
  }

  updateCartBadge();
}

/**
 * Initialize payment page
 */
function initPaymentPage() {
  requireAuth();

  const lastOrder = localStorage.getItem("lastOrder");
  if (!lastOrder) {
    window.location.href = "cart.html";
    return;
  }

  const order = JSON.parse(lastOrder);
  const summaryContainer = document.getElementById("order-summary");

  if (summaryContainer) {
    summaryContainer.innerHTML = `
      <div class="card">
        <h3>Order #${order._id.substring(0, 8).toUpperCase()}</h3>
        <p style="margin: 0.5rem 0 0 0; color: var(--gray);">${formatDate(order.createdAt)}</p>
        
        <h4 style="margin-top: 1.5rem;">Items</h4>
        <ul style="list-style: none; padding: 0; margin: 1rem 0;">
          ${order.items
            .map(
              (item) =>
                `<li style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
                <span>${item.name} × ${item.quantity}</span>
                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
              </li>`
            )
            .join("")}
        </ul>
        
        <h4 style="margin-top: 1.5rem;">Delivery Address</h4>
        <p style="margin: 0.5rem 0; color: var(--gray);">
          ${order.shippingAddress.fullName}<br>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.pincode}
        </p>
        
        <div style="border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 1rem;">
          <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 700; color: var(--primary);">
            <span>Total Amount:</span>
            <span>₹${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  }

  updateCartBadge();
}
