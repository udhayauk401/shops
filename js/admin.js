/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* ADMIN DASHBOARD & MANAGEMENT */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Get admin statistics
 */
async function getAdminStats() {
  try {
    const productsCount = await countDocuments("products");
    const ordersCount = await countDocuments("orders");
    const usersCount = await countDocuments("users", { role: "user" });

    // Calculate revenue
    const ordersResult = await find("orders", {}, { createdAt: -1 }, 10000);
    const orders = ordersResult && ordersResult.documents ? ordersResult.documents : [];
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    return {
      productsCount: productsCount?.count || 0,
      ordersCount: ordersCount?.count || 0,
      usersCount: usersCount?.count || 0,
      totalRevenue,
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

    const result = await insertOne("products", product);

    if (result && result.insertedId) {
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
    const ordersResult = await find("orders", {}, { createdAt: -1 }, 1000);
    const orders = ordersResult && ordersResult.documents ? ordersResult.documents : [];

    // Fetch user details for each order
    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        const userResult = await findOne("users", { _id: { $oid: order.userId } });
        return {
          ...order,
          userName: userResult && userResult.document ? userResult.document.name : "Unknown",
          userEmail: userResult && userResult.document ? userResult.document.email : "Unknown",
        };
      })
    );

    return ordersWithUsers;
  } catch (error) {
    console.error("Error fetching orders:", error);
    showErrorToast("Failed to load orders");
    return [];
  }
}

/**
 * Render orders table for admin
 */
async function renderAdminOrders() {
  const container = document.getElementById("orders-table-container");
  if (!container) return;

  const orders = await fetchOrdersWithUsers();

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <h2>No orders yet</h2>
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
          ${orders
            .map(
              (order) => `
            <tr>
              <td>#${order._id.substring(0, 8).toUpperCase()}</td>
              <td>${order.userName}</td>
              <td>${order.items.length} items</td>
              <td>₹${order.totalAmount.toFixed(2)}</td>
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
 * Update order status
 */
async function updateOrderStatus(orderId, newStatus) {
  try {
    await updateOne("orders", { _id: { $oid: orderId } }, { $set: { status: newStatus } });
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
  alert(`View details for order: ${orderId}`);
}

/**
 * Fetch all customers
 */
async function fetchAllCustomers() {
  try {
    const result = await find("users", { role: "user" }, { createdAt: -1 }, 1000);
    const customers = result && result.documents ? result.documents : [];

    // Add order count for each customer
    const customersWithOrders = await Promise.all(
      customers.map(async (customer) => {
        const ordersResult = await find("orders", { userId: customer._id }, {}, 1000);
        const orderCount = ordersResult && ordersResult.documents ? ordersResult.documents.length : 0;
        return {
          ...customer,
          orderCount,
        };
      })
    );

    return customersWithOrders;
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
          preview.innerHTML = `<img src="${url}" alt="Product preview" onerror="this.src='https://via.placeholder.com/200'">`;
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
  await renderAdminOrders();
  updateCartBadge();
}

/**
 * Initialize admin customers page
 */
async function initAdminCustomersPage() {
  requireAdminAuth();
  await renderCustomersTable();
  updateCartBadge();
}
