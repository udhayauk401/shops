/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* UPI PAYMENT MODAL */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Open UPI payment modal
 */
function openPaymentModal(product) {
  if (!product || !product.name || !product.price) {
    showErrorToast("Product details missing");
    return;
  }

  ensurePaymentModal();
  const modal = document.getElementById("payment-modal-overlay");
  modal.style.display = "flex";

  // Reset form
  document.getElementById("payment-customer-name").value = "";
  document.getElementById("payment-error").textContent = "";
  document.getElementById("payment-modal-step").textContent = "form";

  // Store product for later use
  window.currentPaymentProduct = product;

  // Update header with product info
  document.querySelector(".payment-modal-product-name").textContent = product.name;
  document.querySelector(".payment-modal-amount").textContent = `₹${Number(product.price).toLocaleString("en-IN")}`;
}

/**
 * Close payment modal
 */
function closePaymentModal() {
  const modal = document.getElementById("payment-modal-overlay");
  if (modal) modal.style.display = "none";
  window.currentPaymentProduct = null;
}

/**
 * Create and insert payment modal HTML if not present
 */
function ensurePaymentModal() {
  if (document.getElementById("payment-modal-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "payment-modal-overlay";
  overlay.className = "payment-modal-overlay";
  overlay.innerHTML = `
    <div class="payment-modal">
      <button class="payment-modal-close" onclick="closePaymentModal()">✕</button>

      <!-- Header -->
      <div class="payment-modal-header">
        <div class="payment-modal-store">💎 DressLux</div>
        <div class="payment-modal-product-name">Product Name</div>
        <div class="payment-modal-amount">₹0</div>
        <div class="payment-modal-upi-tag">Pay to: <strong>udhayaraja7777@oksbi</strong></div>
      </div>

      <!-- Error Message -->
      <div id="payment-error" class="payment-modal-error"></div>

      <!-- Step 1: Enter Name -->
      <div id="payment-step-form" class="payment-modal-step" style="display: flex;">
        <label class="payment-modal-label">Your Full Name *</label>
        <input
          id="payment-customer-name"
          type="text"
          class="payment-modal-input"
          placeholder="Enter your full name"
          onkeydown="if(event.key==='Enter') proceedPayment()"
        />
        <button class="payment-modal-btn-primary" onclick="proceedPayment()">
          Proceed to Pay →
        </button>
      </div>

      <!-- Step 2: Choose App -->
      <div id="payment-step-choose" class="payment-modal-step" style="display: none;">
        <p class="payment-modal-choose-label">Choose your payment app</p>

        <button class="payment-modal-upi-btn gpay" onclick="openPaymentApp('gpay')">
          <span class="payment-modal-app-icon">G</span>
          <span>Google Pay</span>
          <span class="payment-modal-arrow">→</span>
        </button>

        <button class="payment-modal-upi-btn phonepe" onclick="openPaymentApp('phonepe')">
          <span class="payment-modal-app-icon">P</span>
          <span>PhonePe</span>
          <span class="payment-modal-arrow">→</span>
        </button>

        <button class="payment-modal-upi-btn paytm" onclick="openPaymentApp('paytm')">
          <span class="payment-modal-app-icon">₹</span>
          <span>Paytm</span>
          <span class="payment-modal-arrow">→</span>
        </button>

        <button class="payment-modal-upi-btn any-upi" onclick="openPaymentApp('any')">
          <span class="payment-modal-app-icon">📱</span>
          <span>Any UPI App</span>
          <span class="payment-modal-arrow">→</span>
        </button>

        <div id="payment-order-info" class="payment-modal-order-info"></div>
        <div id="payment-upi-info" class="payment-modal-upi-info"></div>
      </div>

      <!-- Step 3: Confirm -->
      <div id="payment-step-confirm" class="payment-modal-step" style="display: none;">
        <p class="payment-modal-confirm-text">
          ✅ Did you complete the payment?
        </p>
        <button class="payment-modal-btn-yes" onclick="confirmPaymentSuccess()">
          ✓ Yes, Payment Complete
        </button>
        <button class="payment-modal-btn-retry" onclick="showPaymentStep('choose')">
          ← Try Again
        </button>
      </div>

      <!-- Step 4: Success -->
      <div id="payment-step-success" class="payment-modal-step success" style="display: none;">
        <div class="payment-modal-success-icon">🎉</div>
        <h3 class="payment-modal-success-title">Payment Successful!</h3>
        <p class="payment-modal-success-sub">Thank you for shopping at DressLux</p>
        <div id="payment-success-card" class="payment-modal-success-card"></div>
        <button class="payment-modal-btn-done" onclick="closePaymentModal()">
          Continue Shopping
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close on overlay click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePaymentModal();
  });
}

/**
 * Proceed to payment (generate UPI links)
 */
async function proceedPayment() {
  const name = document.getElementById("payment-customer-name").value.trim();
  const errorEl = document.getElementById("payment-error");

  if (!name) {
    errorEl.textContent = "Please enter your name";
    return;
  }

  const product = window.currentPaymentProduct;
  if (!product) {
    errorEl.textContent = "Product not found";
    return;
  }

  errorEl.textContent = "";

  try {
    const links = await generateUPILinks(product.name, product.price, name);

    // Store links for later use
    window.currentPaymentLinks = links;

    // Update order info display
    document.getElementById("payment-order-info").innerHTML = `
      <div class="payment-modal-info">Order ID: <strong>${links.orderId}</strong></div>
    `;
    document.getElementById("payment-upi-info").innerHTML = `
      <div class="payment-modal-info">UPI ID: <strong>udhayaraja7777@oksbi</strong></div>
    `;

    showPaymentStep("choose");
  } catch (err) {
    console.error("Payment generation error:", err);
    errorEl.textContent = "Failed to generate payment. Try again.";
  }
}

/**
 * Open payment app
 */
function openPaymentApp(appType) {
  const links = window.currentPaymentLinks;
  if (!links) {
    showErrorToast("Payment links not available");
    return;
  }

  let url;
  switch (appType) {
    case "gpay":
      url = links.gpayURL;
      break;
    case "phonepe":
      url = links.phonepeURL;
      break;
    case "paytm":
      url = links.paytmURL;
      break;
    case "any":
      url = links.baseUPI;
      break;
    default:
      return;
  }

  window.location.href = url;

  // Show confirmation step after a delay
  setTimeout(() => {
    showPaymentStep("confirm");
  }, 1500);
}

/**
 * Confirm payment success
 */
async function confirmPaymentSuccess() {
  const links = window.currentPaymentLinks;
  if (!links) {
    showErrorToast("Payment order not found");
    return;
  }

  try {
    await confirmPayment(links.orderId);
    showPaymentStep("success");

    // Display success card
    const product = window.currentPaymentProduct;
    document.getElementById("payment-success-card").innerHTML = `
      <p>📦 <strong>${product.name}</strong></p>
      <p>💰 ₹${Number(product.price).toLocaleString("en-IN")}</p>
      <p>🏦 Paid to: udhayaraja7777@oksbi</p>
      <p>🔖 Order ID: ${links.orderId}</p>
    `;

    showSuccessToast("Payment confirmed! 🎉");
  } catch (err) {
    console.error("Confirm payment error:", err);
    showErrorToast("Failed to confirm payment");
  }
}

/**
 * Show a specific payment step
 */
function showPaymentStep(step) {
  // Hide all steps
  document.getElementById("payment-step-form").style.display = "none";
  document.getElementById("payment-step-choose").style.display = "none";
  document.getElementById("payment-step-confirm").style.display = "none";
  document.getElementById("payment-step-success").style.display = "none";

  // Show requested step
  const stepId = `payment-step-${step}`;
  const stepEl = document.getElementById(stepId);
  if (stepEl) stepEl.style.display = "flex";
}
