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
  const paymentMethod = formData.paymentMethod === "Online" ? "Online" : "COD";

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
    paymentMethod,
    status: paymentMethod === "Online" ? "payment_pending" : "pending",
    createdAt: new Date().toISOString(),
  };

  try {
    if (paymentMethod === "Online") {
      // Save the pending order until user confirms payment on the payment page
      localStorage.setItem("pendingOnlineOrder", JSON.stringify(order));
      window.location.href = "payment.html?mode=upi";
      return true;
    }

    const orderResult = await placeOrderAPI(order);

    if (!orderResult || !orderResult.orderId) {
      showErrorToast("Failed to place order");
      return false;
    }

    const orderId = orderResult.orderId;

    localStorage.setItem(
      "lastOrder",
      JSON.stringify({
        _id: orderId,
        ...order,
      })
    );

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

async function completeOnlinePayment() {
  const pendingOrderData = localStorage.getItem("pendingOnlineOrder");
  if (!pendingOrderData) {
    showErrorToast("No pending payment found.");
    window.location.href = "cart.html";
    return;
  }

  const pendingOrder = JSON.parse(pendingOrderData);

  try {
    const orderResult = await placeOrderAPI(pendingOrder);
    if (!orderResult || !orderResult.orderId) {
      showErrorToast("Failed to complete online payment.");
      return;
    }

    const orderId = orderResult.orderId;
    const completedOrder = {
      _id: orderId,
      ...pendingOrder,
      status: "processing",
    };

    localStorage.removeItem("pendingOnlineOrder");
    localStorage.setItem("lastOrder", JSON.stringify(completedOrder));
    clearCart();

    showSuccessToast("Payment confirmed and order placed!");
    renderPaymentSuccess(completedOrder);
  } catch (error) {
    console.error("Online payment completion error:", error);
    showErrorToast("Failed to complete online payment: " + error.message);
  }
}

function renderPaymentSuccess(order) {
  const paymentMethodCard = document.getElementById("payment-method-card");
  const summaryContainer = document.getElementById("order-summary");
  const paymentAction = document.getElementById("payment-action");

  if (paymentAction) {
    paymentAction.style.display = "none";
  }

  if (paymentMethodCard) {
    const paymentLabel = order.paymentMethod === "Online" ? "💳 Online Payment" : "💵 Cash on Delivery";
    const paymentDescription = order.paymentMethod === "Online"
      ? "Your payment has been received successfully. Thank you for paying via UPI."
      : "Pay when you receive your order.";

    paymentMethodCard.innerHTML = `
      <h3 style="color: var(--primary); margin-bottom: 1rem;">Payment Method</h3>
      <p style="color: var(--dark); font-size: 1.1rem; margin: 0;">${paymentLabel}</p>
      <p style="color: var(--gray); font-size: 0.95rem; margin: 0.5rem 0 0 0;">${paymentDescription}</p>
    `;
  }

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
    const result = await apiCall(`/orders/user/${user._id}`);
    // apiCall returns data array or wrapped object
    const orders = Array.isArray(result) ? result : (result.data || result);
    return orders || [];
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

function getUpiUri(amount) {
  const params = new URLSearchParams({
    pa: "udhayaraja7777@oksbi",
    pn: "DressLux",
    am: amount?.toFixed(2) || "0.00",
    cu: "INR",
    tn: "DressLux Order Payment",
  });
  return `upi://pay?${params.toString()}`;
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
        <button class="btn btn-small btn-outline" onclick="toggleOrderDetails('${order._id}')">View Details</button>
      </div>
      <div id="order-details-${order._id}" class="order-details-panel" style="display:none; margin-top: 1rem; padding: 1rem; border: 1px solid var(--border); border-radius: var(--radius); background: #fff;">
        <h3 style="margin-top: 0;">Order Details</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; text-align: left;">
          <div>
            <strong>Shipping Address</strong>
            <p style="margin: 0.4rem 0 0 0;">${order.shippingAddress.fullName}</p>
            <p style="margin: 0.2rem 0 0 0;">${order.shippingAddress.phone}</p>
            <p style="margin: 0.2rem 0 0 0;">${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.pincode}</p>
          </div>
          <div>
            <strong>Order Info</strong>
            <p style="margin: 0.4rem 0 0 0;">Payment: ${order.paymentMethod}</p>
            <p style="margin: 0.2rem 0 0 0;">Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
            <p style="margin: 0.2rem 0 0 0;">Total: ₹${order.totalAmount.toFixed(2)}</p>
          </div>
        </div>
        <div>
          <strong>Items</strong>
          <ul style="margin: 0.5rem 0 0 1rem; padding: 0; list-style: disc;">
            ${order.items
              .map(
                (item) => `
              <li style="margin-bottom: 0.5rem;">
                <strong>${item.name}</strong> • Qty: ${item.quantity} • Size: ${item.size || 'N/A'} • ₹${item.price.toFixed(2)}
              </li>`
              )
              .join("")}
          </ul>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

/**
 * Toggle order details visibility
 */
function toggleOrderDetails(orderId) {
  const detailsElement = document.getElementById(`order-details-${orderId}`);
  const button = detailsElement?.previousElementSibling?.querySelector("button");
  if (!detailsElement) return;

  if (detailsElement.style.display === "none") {
    detailsElement.style.display = "block";
    if (button) button.textContent = "Hide Details";
  } else {
    detailsElement.style.display = "none";
    if (button) button.textContent = "View Details";
  }
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

  // Autofill delivery details from current user if available
  try {
    const user = getCurrentUser();
    if (user) {
      const addr = user.lastShippingAddress || {};
      const fNameEl = document.getElementById("fullName");
      const phoneEl = document.getElementById("phone");
      const addressEl = document.getElementById("address");
      const cityEl = document.getElementById("city");
      const pincodeEl = document.getElementById("pincode");

      if (fNameEl) fNameEl.value = addr.fullName || user.name || fNameEl.value || "";
      if (phoneEl) phoneEl.value = addr.phone || user.phone || phoneEl.value || "";
      if (addressEl) addressEl.value = addr.address || addressEl.value || "";
      if (cityEl) cityEl.value = addr.city || cityEl.value || "";
      if (pincodeEl) pincodeEl.value = addr.pincode || pincodeEl.value || "";
    }
  } catch (err) {
    console.warn("Autofill error:", err);
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

      const paymentSelection = document.querySelector('input[name="payment"]:checked');
      const formData = {
        fullName: document.getElementById("fullName").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        city: document.getElementById("city").value,
        pincode: document.getElementById("pincode").value,
        paymentMethod: paymentSelection?.value === "online" ? "Online" : "COD",
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

  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  const summaryContainer = document.getElementById("order-summary");
  const paymentMethodCard = document.getElementById("payment-method-card");
  const paymentAction = document.getElementById("payment-action");

  if (mode === "upi") {
    const pendingOrderData = localStorage.getItem("pendingOnlineOrder");
    if (!pendingOrderData) {
      window.location.href = "cart.html";
      return;
    }

    const order = JSON.parse(pendingOrderData);
    const upiUri = getUpiUri(order.totalAmount);
    if (paymentMethodCard) {
      paymentMethodCard.innerHTML = `
        <h3 style="color: var(--primary); margin-bottom: 1rem;">UPI Payment</h3>
        <p style="color: var(--dark); font-size: 1.1rem; margin: 0;">Pay with GPay, PhonePe, or Paytm.</p>
        <p style="color: var(--gray); font-size: 0.95rem; margin: 0.5rem 0 1rem 0;">Click one of the buttons below to open your app and pay the bill.</p>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center; margin-bottom: 1rem;">
          <a href="${upiUri}" class="btn btn-primary" style="flex: 1 1 180px; text-align: center;">Open GPay</a>
          <a href="${upiUri}" class="btn btn-primary" style="flex: 1 1 180px; text-align: center;">Open PhonePe</a>
          <a href="${upiUri}" class="btn btn-primary" style="flex: 1 1 180px; text-align: center;">Open Paytm</a>
        </div>
        <div style="margin-top: 1rem; padding: 1rem; border-radius: var(--radius); background: #f7f7f6; border: 1px solid var(--border);">
          <p style="margin: 0.25rem 0;"><strong>UPI ID:</strong> udhayaraja7777@oksbi</p>
          <p style="margin: 0.25rem 0;"><strong>Payee Name:</strong> DressLux</p>
          <p style="margin: 0.25rem 0;"><strong>Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
          <p style="margin: 0.75rem 0 0 0; color: var(--gray);">After completing the payment in your UPI app, click Confirm Payment.</p>
        </div>
      `;
    }

    if (summaryContainer) {
      summaryContainer.innerHTML = `
        <div class="card">
          <h3>Order Summary</h3>
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

    if (paymentAction) {
      paymentAction.innerHTML = `
        <button id="confirm-payment-btn" class="submit-btn" style="width: 100%; margin-top: 1rem;">Confirm Payment</button>
        <button id="cancel-payment-btn" class="btn btn-outline" style="width: 100%; margin-top: 0.75rem;">Cancel Payment</button>
      `;

      const confirmButton = document.getElementById("confirm-payment-btn");
      const cancelButton = document.getElementById("cancel-payment-btn");

      if (confirmButton) {
        confirmButton.addEventListener("click", async () => {
          confirmButton.disabled = true;
          confirmButton.textContent = "Confirming...";
          await completeOnlinePayment();
          confirmButton.disabled = false;
          confirmButton.textContent = "Confirm Payment";
        });
      }

      if (cancelButton) {
        cancelButton.addEventListener("click", () => {
          localStorage.removeItem("pendingOnlineOrder");
          window.location.href = "cart.html";
        });
      }
    }

    updateCartBadge();
    return;
  }

  const lastOrder = localStorage.getItem("lastOrder");
  if (!lastOrder) {
    window.location.href = "cart.html";
    return;
  }

  const order = JSON.parse(lastOrder);
  renderPaymentSuccess(order);
  updateCartBadge();
}
