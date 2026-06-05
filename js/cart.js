/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* SHOPPING CART MANAGEMENT */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Get cart from localStorage
 */
function getCart() {
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

/**
 * Save cart to localStorage
 */
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
}

/**
 * Add item to cart
 */
function addToCart(productId, name, price, imageUrl, size = "M", quantity = 1) {
  const cart = getCart();

  // Ensure quantity is at least 1
  quantity = parseInt(quantity) || 1;
  if (quantity <= 0) quantity = 1;

  // Check if item with same product and size already exists
  const existingItem = cart.find((item) => item.productId === productId && item.size === size);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      productId,
      name,
      price,
      imageUrl,
      size,
      quantity,
    });
  }

  saveCart(cart);
  showSuccessToast(`${name} added to cart ✓`);
}

/**
 * Quick add to cart (from product grid without selecting size)
 */
function addToCartQuick(event, productId, name, price, imageUrl) {
  event.stopPropagation();
  addToCart(productId, name, price, imageUrl);
}

/**
 * Remove item from cart
 */
function removeFromCart(productId, size) {
  const cart = getCart();
  const index = cart.findIndex((item) => item.productId === productId && item.size === size);

  if (index > -1) {
    const item = cart[index];
    cart.splice(index, 1);
    saveCart(cart);
    showToast(`${item.name} removed from cart`);
    renderCartItems();
    updateOrderSummary();
  }
}

/**
 * Update item quantity in cart
 */
function updateQuantity(productId, size, quantity) {
  const cart = getCart();
  const item = cart.find((i) => i.productId === productId && i.size === size);

  if (item) {
    quantity = parseInt(quantity);
    if (quantity <= 0) {
      removeFromCart(productId, size);
    } else {
      item.quantity = quantity;
      saveCart(cart);
      updateOrderSummary();
    }
  }
}

/**
 * Calculate cart total
 */
function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

/**
 * Get cart item count
 */
function getCartCount() {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Clear entire cart
 */
function clearCart() {
  localStorage.removeItem("cart");
  updateCartBadge();
}

/**
 * Render cart items on cart page
 */
function renderCartItems() {
  const cart = getCart();
  const container = document.getElementById("cart-items-container");

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some beautiful dresses to get started!</p>
        <a href="dashboard.html" class="back-to-shop-btn">Continue Shopping</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="cart-items">
      <h1>Shopping Cart</h1>
      ${cart
        .map(
          (item) => `
        <div class="cart-item">
          <div class="cart-item-image">
            <img src="${item.imageUrl || 'https://via.placeholder.com/100'}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <h3>${item.name}</h3>
            <div class="cart-item-size">Size: <strong>${item.size}</strong></div>
            <p>Price: ₹${item.price.toFixed(2)}</p>
          </div>
          <div class="cart-item-quantity">
            <button class="qty-btn" onclick="updateQuantity('${item.productId}', '${item.size}', ${item.quantity - 1})">−</button>
            <input type="number" class="qty-input" value="${item.quantity}" onchange="updateQuantity('${item.productId}', '${item.size}', this.value)" readonly>
            <button class="qty-btn" onclick="updateQuantity('${item.productId}', '${item.size}', ${item.quantity + 1})">+</button>
          </div>
          <div class="cart-item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
          <button class="remove-btn" onclick="removeFromCart('${item.productId}', '${item.size}')">×</button>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

/**
 * Update order summary sidebar
 */
function updateOrderSummary() {
  const cart = getCart();
  const subtotal = getCartTotal();
  const shipping = subtotal > 1000 ? 0 : 150;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const summaryContainer = document.getElementById("order-summary-container");
  if (!summaryContainer) return;

  summaryContainer.innerHTML = `
    <div class="order-summary">
      <h2>Order Summary</h2>
      <div class="summary-row">
        <span>Subtotal (${cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
        <span>₹${subtotal.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Shipping</span>
        <span>${shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</span>
      </div>
      <div class="summary-row">
        <span>Tax (18%)</span>
        <span>₹${tax.toFixed(2)}</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span class="amount">₹${total.toFixed(2)}</span>
      </div>
      <button class="checkout-btn" onclick="proceedToOrder()" ${cart.length === 0 ? "disabled" : ""}>
        Proceed to Order
      </button>
      <a href="dashboard.html" class="continue-shopping-btn">Continue Shopping</a>
    </div>
  `;
}

/**
 * Proceed to order page
 */
function proceedToOrder() {
  const cart = getCart();
  if (cart.length === 0) {
    showErrorToast("Your cart is empty");
    return;
  }
  window.location.href = "order.html";
}

/**
 * Initialize cart page
 */
function initCartPage() {
  requireAuth();
  renderCartItems();
  updateOrderSummary();
  updateCartBadge();
}
