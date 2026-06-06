/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* ADMIN DASHBOARD & MANAGEMENT */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function createAdminSvgPlaceholder(label, width = 200, height = 200) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">` +
    `<rect width="${width}" height="${height}" fill="#f4f4f4"/>` +
    `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="14" fill="#777">${label}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const adminPlaceholderImages = {
  small: createAdminSvgPlaceholder('No Image', 80, 80),
  previewError: createAdminSvgPlaceholder('Image Error', 200, 200),
};

/**
 * Get admin statistics
 */
async function getAdminStats() {
  try {
    const stats = await fetchAdminStatsAPI();
    return {
      productsCount: stats.productsCount || 0,
      ordersCount: stats.ordersCount || 0,
      usersCount: stats.usersCount || 0,
      totalRevenue: stats.totalRevenue || 0,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { productsCount: 0, ordersCount: 0, usersCount: 0, totalRevenue: 0 };
  }
}

/**
 * Display admin dashboard stats
 */
async function displayAdminDashboard() {
  const stats = await getAdminStats();

  const statsContainer = document.getElementById("stats-container");
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="stat-card">
        <p class="stat-label">Total Products</p>
        <p class="stat-value">${stats.productsCount}</p>
      </div>
      <div class="stat-card success">
        <p class="stat-label">Total Orders</p>
        <p class="stat-value">${stats.ordersCount}</p>
      </div>
      <div class="stat-card info">
        <p class="stat-label">Total Customers</p>
        <p class="stat-value">${stats.usersCount}</p>
      </div>
      <div class="stat-card warning">
        <p class="stat-label">Total Revenue</p>
        <p class="stat-value">₹${stats.totalRevenue.toFixed(0)}</p>
      </div>
    `;
  }
}

/**
 * Add new product
 */
async function addNewProduct(formData) {
  // Validation
  if (!formData.name || !formData.description || !formData.price || !formData.category) {
    showErrorToast("Please fill all required fields");
    return false;
  }

  if (isNaN(formData.price) || formData.price <= 0) {
    showErrorToast("Please enter a valid price");
    return false;
  }

  if (!formData.sizes || formData.sizes.length === 0) {
    showErrorToast("Please select at least one size");
    return false;
  }

  try {
    const product = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      sizes: formData.sizes,
      stock: parseInt(formData.stock) || 0,
      imageUrl: formData.imageUrl,
      isNew: true,
      createdAt: new Date().toISOString(),
    };

    const result = await addProduct(product);

    // addProduct returns the inner data object from the server (e.g. { productId: ... })
    if (result && (result.productId || result.insertedId)) {
      showSuccessToast("Product added successfully!");
      setTimeout(() => {
        window.location.href = "admin-dashboard.html";
      }, 1500);
      return true;
    } else {
      showErrorToast("Failed to add product");
      return false;
    }
  } catch (error) {
    console.error("Error adding product:", error);
    showErrorToast("Failed to add product: " + error.message);
    return false;
  }
}

/**
 * Fetch all orders with user details
 */
async function fetchOrdersWithUsers() {
  try {
    const orders = await fetchAdminOrders();
    console.log("Admin orders API response:", orders);
    return Array.isArray(orders) ? orders : orders?.data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    showErrorToast("Failed to load orders");
    return [];
  }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/**
 * Filter orders by selected month
 */
function filterOrdersByMonth(orders, monthIndex) {
  if (monthIndex === "All") return orders;
  return orders.filter((order) => {
    const date = new Date(order.createdAt);
    return date.getMonth().toString() === monthIndex;
  });
}

function getOrderItemsHtml(order) {
  if (!Array.isArray(order.items) || order.items.length === 0) {
    return "<li>No items found</li>";
  }

  return order.items
    .map(
      (item) => `
        <li>
          <strong>${item.name || item.title || 'Item'}</strong>
          ${item.quantity ? `× ${item.quantity}` : ''}
          ${item.size ? `<span>(${item.size})</span>` : ''}
          ${item.price ? ` - ₹${Number(item.price).toFixed(2)}` : ''}
        </li>`
    )
    .join("");
}

function renderOrderDetailsRow(order) {
  const shipping = order.shippingAddress || {};
  return `
    <tr id="order-details-${order._id}" class="order-detail-row" style="display:none;">
      <td colspan="7">
        <div class="order-details-panel">
          <div class="order-details-grid">
            <div><strong>Customer:</strong> ${order.userName || 'Unknown'}</div>
            <div><strong>Email:</strong> ${order.userEmail || 'Unknown'}</div>
            <div><strong>Order ID:</strong> #${order._id.substring(0, 8).toUpperCase()}</div>
            <div><strong>Placed:</strong> ${formatDate(order.createdAt)}</div>
            <div><strong>Status:</strong> ${order.status || 'N/A'}</div>
            <div><strong>Payment:</strong> ${order.paymentMethod || 'N/A'}</div>
          </div>
          <h4>Items</h4>
          <ul class="order-items-list">
            ${getOrderItemsHtml(order)}
          </ul>
          <h4>Shipping Address</h4>
          <div class="order-shipping-address">
            <p>${shipping.fullName || 'N/A'}</p>
            <p>${shipping.address || ''}</p>
            <p>${shipping.city || ''}${shipping.pincode ? ` - ${shipping.pincode}` : ''}</p>
            <p>${shipping.phone || ''}</p>
          </div>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Render orders table for admin
 */
async function renderAdminOrders() {
  const container = document.getElementById("orders-table-container");
  if (!container) return;

  const orders = await fetchOrdersWithUsers();
  const monthFilter = document.getElementById("month-filter");
  const selectedMonth = monthFilter ? monthFilter.value : "All";
  const filteredOrders = filterOrdersByMonth(orders, selectedMonth);

  if (!Array.isArray(filteredOrders) || filteredOrders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <h2>No orders for this month</h2>
        <p>Choose a different month or select "All Months".</p>
      </div>
    `;
    return;
  }

  const tableHTML = `
    <div class="admin-table-wrapper">
      <div class="admin-table-header">
        <h2>All Orders</h2>
      </div>
      <table class="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total (₹)</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${filteredOrders
            .map((order) => `
            <tr>
              <td>#${order._id.substring(0, 8).toUpperCase()}</td>
              <td>${order.userName}</td>
              <td>${Array.isArray(order.items) ? order.items.length : 0} items</td>
              <td>₹${Number(order.totalAmount || 0).toFixed(2)}</td>
              <td>${formatDate(order.createdAt)}</td>
              <td>
                <select class="status-select" onchange="updateOrderStatus('${order._id}', this.value)">
                  <option value="pending" ${order.status === "pending" ? "selected" : ""}>Pending</option>
                  <option value="processing" ${order.status === "processing" ? "selected" : ""}>Processing</option>
                  <option value="shipped" ${order.status === "shipped" ? "selected" : ""}>Shipped</option>
                  <option value="delivered" ${order.status === "delivered" ? "selected" : ""}>Delivered</option>
                </select>
              </td>
              <td>
                <button class="action-link" onclick="viewOrderDetailsAdmin('${order._id}')">View</button>
              </td>
            </tr>
            ${renderOrderDetailsRow(order)}
          `)
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = tableHTML;

  const statusLabel = document.getElementById("auto-refresh-status");
  if (statusLabel) {
    statusLabel.textContent = `Last refreshed: ${new Date().toLocaleTimeString()}`;
  }
}

/**
 * Update order status
 */
async function updateOrderStatus(orderId, newStatus) {
  try {
    await updateOrderStatusAPI(orderId, newStatus);
    showSuccessToast(`Order status updated to ${newStatus}`);
    renderAdminOrders();
  } catch (error) {
    console.error("Error updating order:", error);
    showErrorToast("Failed to update order status");
  }
}

/**
 * View order details (admin)
 */
function viewOrderDetailsAdmin(orderId) {
  const detailsRow = document.getElementById(`order-details-${orderId}`);
  if (!detailsRow) return;

  const isVisible = detailsRow.style.display === "table-row";
  detailsRow.style.display = isVisible ? "none" : "table-row";
}

/**
 * Fetch all customers
 */
async function fetchAllCustomers() {
  try {
    const customers = await fetchAllCustomersAPI();
    console.log("Admin customers API response:", customers);
    return Array.isArray(customers) ? customers : customers?.data || [];
  } catch (error) {
    console.error("Error fetching customers:", error);
    showErrorToast("Failed to load customers");
    return [];
  }
}

/**
 * Render customers table
 */
async function renderCustomersTable() {
  const container = document.getElementById("customers-table-container");
  if (!container) return;

  const customers = await fetchAllCustomers();

  if (customers.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <h2>No customers yet</h2>
      </div>
    `;
    return;
  }

  const tableHTML = `
    <div class="admin-table-wrapper">
      <div class="admin-table-header">
        <h2>All Customers</h2>
        <input type="text" class="search-filter-group" placeholder="Search by name or email" id="customer-search" style="padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius); width: 250px;">
      </div>
      <table class="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Joined</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          ${customers
            .map(
              (customer, index) => `
            <tr class="customer-row">
              <td>${index + 1}</td>
              <td>${customer.name}</td>
              <td>${customer.email}</td>
              <td>${customer.lastShippingAddress?.phone || '-'}</td>
              <td>${customer.lastShippingAddress ? `${customer.lastShippingAddress.address || ''}, ${customer.lastShippingAddress.city || ''}${customer.lastShippingAddress.pincode ? ' - ' + customer.lastShippingAddress.pincode : ''}` : '-'}</td>
              <td>${formatDate(customer.createdAt)}</td>
              <td>${customer.orderCount}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = tableHTML;

  // Search functionality
  const searchInput = document.getElementById("customer-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      const rows = document.querySelectorAll(".customer-row");
      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? "" : "none";
      });
    });
  }
}

/**
 * Populate edit product form
 */
async function populateEditProductForm(productId) {
  try {
    const product = await fetchProductByIdAPI(productId);
    if (!product || !product._id) {
      showErrorToast("Product not found");
      return null;
    }

    document.getElementById("productName").value = product.name || "";
    document.getElementById("productCategory").value = product.category || "";
    document.getElementById("productDescription").value = product.description || "";
    document.getElementById("productPrice").value = product.price || "";
    document.getElementById("productStock").value = product.stock || 0;
    document.getElementById("imageUrl").value = product.imageUrl || "";

    const sizes = product.sizes || [];
    document.querySelectorAll('input[name="sizes"]').forEach((checkbox) => {
      checkbox.checked = sizes.includes(checkbox.value);
    });

    const preview = document.getElementById("image-preview");
    if (preview && product.imageUrl) {
      preview.innerHTML = `<img src="${product.imageUrl}" alt="Product preview" onerror="this.src='${adminPlaceholderImages.previewError}'">`;
      preview.classList.add("show");
    }

    return product;
  } catch (error) {
    console.error("Error populating edit product form:", error);
    showErrorToast("Failed to load product details");
    return null;
  }
}

/**
 * Get query parameter value by name
 */
function getURLParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

/**
 * Render admin product list
 */
async function renderAdminProducts() {
  const container = document.getElementById("products-table-container");
  if (!container) return;

  const products = await fetchAllProducts();

  if (!Array.isArray(products) || products.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛍️</div>
        <h2>No products found</h2>
        <p>Add a new product from the Add Product page.</p>
      </div>
    `;
    return;
  }

  const tableHTML = `
    <div class="admin-table-wrapper">
      <div class="admin-table-header">
        <h2>Products</h2>
      </div>
      <table class="admin-table admin-products-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price (₹)</th>
            <th>Stock</th>
            <th>Sizes</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${products
            .map(
              (product) => `
            <tr>
              <td><img src="${product.imageUrl || adminPlaceholderImages.small}" alt="${product.name}" style="width:80px; height:80px; object-fit:cover; border-radius:8px;"></td>
              <td>${product.name}</td>
              <td>${product.category || 'N/A'}</td>
              <td>₹${Number(product.price).toFixed(2)}</td>
              <td>${product.stock || 0}</td>
              <td>${Array.isArray(product.sizes) ? product.sizes.join(', ') : 'N/A'}</td>
              <td>${product.description || '-'}</td>
              <td>
                <button class="action-link" onclick="window.location.href='edit-product.html?id=${product._id}'">Edit</button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = tableHTML;
}

/**
 * Initialize admin add product page
 */
function initAddProductPage() {
  requireAdminAuth();

  const form = document.getElementById("product-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const imageUrl = document.getElementById("imageUrl").value;
      const preview = document.getElementById("image-preview");

      const formData = {
        name: document.getElementById("productName").value,
        description: document.getElementById("productDescription").value,
        price: document.getElementById("productPrice").value,
        category: document.getElementById("productCategory").value,
        stock: document.getElementById("productStock").value,
        imageUrl: imageUrl,
        sizes: Array.from(document.querySelectorAll('input[name="sizes"]:checked')).map((el) => el.value),
      };

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = "Adding Product...";

      const success = await addNewProduct(formData);

      if (!success) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Add Product";
      }
    });

    // Image preview
    const imageUrlInput = document.getElementById("imageUrl");
    if (imageUrlInput) {
      imageUrlInput.addEventListener("change", (e) => {
        const preview = document.getElementById("image-preview");
        const url = e.target.value;
        if (url) {
          preview.innerHTML = `<img src="${url}" alt="Product preview" onerror="this.src='${adminPlaceholderImages.previewError}'">`;
          preview.classList.add("show");
        } else {
          preview.classList.remove("show");
        }
      });
    }
  }

  updateCartBadge();
}

/**
 * Initialize admin edit product page
 */
async function initEditProductPage() {
  requireAdminAuth();

  const productId = getURLParam("id");
  if (!productId) {
    showErrorToast("Product ID is missing");
    return;
  }

  await populateEditProductForm(productId);

  const form = document.getElementById("product-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const imageUrl = document.getElementById("imageUrl").value;
      const formData = {
        name: document.getElementById("productName").value,
        description: document.getElementById("productDescription").value,
        price: document.getElementById("productPrice").value,
        category: document.getElementById("productCategory").value,
        stock: document.getElementById("productStock").value,
        imageUrl: imageUrl,
        sizes: Array.from(document.querySelectorAll('input[name="sizes"]:checked')).map((el) => el.value),
      };

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving changes...";

      try {
        await updateProduct(productId, formData);
        showSuccessToast("Product updated successfully!");
        setTimeout(() => {
          window.location.href = "view-products.html";
        }, 1000);
      } catch (error) {
        console.error("Error updating product:", error);
        showErrorToast("Failed to update product");
        submitBtn.disabled = false;
        submitBtn.textContent = "Save Changes";
      }
    });
  }

  updateCartBadge();
}

/**
 * Initialize admin dashboard page
 */
async function initAdminDashboard() {
  requireAdminAuth();
  await displayAdminDashboard();
  updateCartBadge();
}

/**
 * Initialize admin orders page
 */
async function initAdminOrdersPage() {
  requireAdminAuth();

  const monthFilter = document.getElementById("month-filter");
  if (monthFilter) {
    monthFilter.addEventListener("change", async () => {
      await renderAdminOrders();
    });
  }

  const refreshBtn = document.getElementById("refresh-orders-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      await renderAdminOrders();
      const status = document.getElementById("auto-refresh-status");
      if (status) status.textContent = "Refreshed just now";
      setTimeout(() => {
        if (status) status.textContent = "Auto-refresh every 20s";
      }, 3000);
    });
  }

  await renderAdminOrders();
  startAdminOrderAutoRefresh();
  updateCartBadge();
}

let adminOrdersAutoRefreshTimer = null;

function startAdminOrderAutoRefresh() {
  stopAdminOrderAutoRefresh();
  adminOrdersAutoRefreshTimer = setInterval(async () => {
    await renderAdminOrders();
  }, 20000);
}

function stopAdminOrderAutoRefresh() {
  if (adminOrdersAutoRefreshTimer) {
    clearInterval(adminOrdersAutoRefreshTimer);
    adminOrdersAutoRefreshTimer = null;
  }
}

/**
 * Initialize admin products page
 */
async function initAdminProductsPage() {
  requireAdminAuth();
  await renderAdminProducts();
  updateCartBadge();
}

/**
 * Initialize admin customers page
 */
async function initAdminCustomersPage() {
  requireAdminAuth();
  await renderCustomersTable();
  setupCreateCustomerForm();
  updateCartBadge();
}

function setupCreateCustomerForm() {
  const form = document.getElementById("create-customer-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("cust-name").value.trim();
    const email = document.getElementById("cust-email").value.trim().toLowerCase();
    const phone = document.getElementById("cust-phone").value.trim();
      const city = document.getElementById("cust-city").value.trim();
      const pincode = document.getElementById("cust-pincode").value.trim();
      const address = document.getElementById("cust-address").value.trim();

    if (!name || !email) {
      showErrorToast("Name and email are required");
      return;
    }

    const tempPassword = "ChangeMe123";
    try {
      const reg = await registerUser(name, email, tempPassword, tempPassword);
      if (!reg || !reg.userId) {
        showErrorToast("Failed to create customer");
        return;
      }

      const userId = reg.userId || reg.insertedId;

        await updateAdminUser(userId, {
          lastShippingAddress: { fullName: name, address: address || "", city: city || "", pincode: pincode || "", phone: phone || "" },
          phone: phone || "",
        });

      showSuccessToast("Customer created successfully");
      form.reset();
      await renderCustomersTable();
    } catch (err) {
      console.error("Create customer error:", err);
      showErrorToast(err.message || "Failed to create customer");
    }
  });
}
