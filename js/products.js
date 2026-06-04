/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* PRODUCT MANAGEMENT & DISPLAY */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

let allProducts = [];
let filteredProducts = [];

/**
 * Fetch all products from database
 */
async function fetchAllProducts() {
  try {
    const result = await find("products", {}, { createdAt: -1 }, 1000);
    allProducts = result && result.documents ? result.documents : [];
    filteredProducts = [...allProducts];
    return allProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    showErrorToast("Failed to load products");
    return [];
  }
}

/**
 * Fetch single product by ID
 */
async function fetchProductById(productId) {
  try {
    const result = await findOne("products", { _id: { $oid: productId } });
    return result && result.document ? result.document : null;
  } catch (error) {
    console.error("Error fetching product:", error);
    showErrorToast("Failed to load product");
    return null;
  }
}

/**
 * Filter products by category
 */
function filterByCategory(category) {
  if (category === "All") {
    filteredProducts = [...allProducts];
  } else {
    filteredProducts = allProducts.filter((p) => p.category === category);
  }
  renderProducts();
}

/**
 * Search products by name
 */
function searchProducts(query) {
  const lowerQuery = query.toLowerCase();
  filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(lowerQuery) ||
    (p.description && p.description.toLowerCase().includes(lowerQuery))
  );
  renderProducts();
}

/**
 * Render product grid on dashboard
 */
function renderProducts() {
  const container = document.getElementById("products-grid");
  if (!container) return;

  if (filteredProducts.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🔍</div>
        <h2>No products found</h2>
        <p>Try adjusting your search or filter criteria</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredProducts
    .map(
      (product) => `
    <div class="product-card" onclick="goToProduct('${product._id}')">
      <div class="product-image">
        <img src="${product.imageUrl || 'https://via.placeholder.com/300x350?text=No+Image'}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x350?text=Image+Error'">
        ${product.isNew ? '<span class="badge badge-primary">NEW</span>' : ''}
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${(product.description || "").substring(0, 60)}...</p>
        <div class="product-price">₹${product.price.toFixed(2)}</div>
        <button class="add-to-cart-btn" onclick="addToCartQuick(event, '${product._id}', '${product.name}', ${product.price}, '${product.imageUrl}')">
          Add to Cart
        </button>
      </div>
    </div>
  `
    )
    .join("");
}

/**
 * Display single product details
 */
async function displayProductDetail(productId) {
  const product = await fetchProductById(productId);

  if (!product) {
    document.body.innerHTML = `
      <div class="empty-state" style="min-height: 100vh; display: flex; flex-direction: column; justify-content: center;">
        <div class="empty-state-icon">❌</div>
        <h2>Product not found</h2>
        <p>The product you're looking for doesn't exist</p>
        <a href="dashboard.html" class="btn btn-primary" style="margin-top: 1rem;">Back to Shop</a>
      </div>
    `;
    return;
  }

  const mainImageContainer = document.getElementById("main-image");
  const productNameEl = document.getElementById("product-name");
  const productPriceEl = document.getElementById("product-price");
  const productDescriptionEl = document.getElementById("product-description");
  const sizesContainer = document.getElementById("sizes-container");
  const addToCartBtn = document.getElementById("add-to-cart-btn");

  if (mainImageContainer) {
    mainImageContainer.innerHTML = `
      <img src="${product.imageUrl || 'https://via.placeholder.com/500x600?text=No+Image'}" 
           alt="${product.name}"
           onerror="this.src='https://via.placeholder.com/500x600?text=Image+Error'">
    `;
  }

  if (productNameEl) productNameEl.textContent = product.name;
  if (productPriceEl) productPriceEl.textContent = `₹${product.price.toFixed(2)}`;
  if (productDescriptionEl) {
    productDescriptionEl.innerHTML = `
      <h3>Description</h3>
      <p>${product.description || "No description available"}</p>
      <h3 style="margin-top: 1.5rem;">Details</h3>
      <p><strong>Category:</strong> ${product.category}</p>
      <p><strong>Stock:</strong> ${product.stock} items available</p>
    `;
  }

  // Render size selector
  if (sizesContainer && product.sizes && product.sizes.length > 0) {
    sizesContainer.innerHTML = product.sizes
      .map(
        (size) =>
          `<button class="size-btn" data-size="${size}" onclick="selectSize('${size}')">${size}</button>`
      )
      .join("");
  }

  // Add to cart button handler
  if (addToCartBtn) {
    addToCartBtn.onclick = () => {
      const selectedSize = document.querySelector(".size-btn.selected");
      if (!selectedSize) {
        showErrorToast("Please select a size");
        return;
      }
      addToCart(product._id, product.name, product.price, product.imageUrl, selectedSize.textContent);
    };
  }

  // Load and display related products
  const relatedContainer = document.getElementById("related-products");
  if (relatedContainer && product.category) {
    const related = allProducts.filter(
      (p) => p.category === product.category && p._id !== product._id
    );
    if (related.length > 0) {
      relatedContainer.innerHTML = related
        .slice(0, 4)
        .map(
          (p) => `
        <div class="product-card" onclick="goToProduct('${p._id}')">
          <div class="product-image">
            <img src="${p.imageUrl || 'https://via.placeholder.com/200x250?text=No+Image'}" alt="${p.name}">
          </div>
          <div class="product-info">
            <h3 class="product-name">${p.name}</h3>
            <div class="product-price">₹${p.price.toFixed(2)}</div>
            <button class="add-to-cart-btn" onclick="addToCartQuick(event, '${p._id}', '${p.name}', ${p.price}, '${p.imageUrl}')">
              Add to Cart
            </button>
          </div>
        </div>
      `
        )
        .join("");
    }
  }
}

/**
 * Select size for product
 */
function selectSize(size) {
  document.querySelectorAll(".size-btn").forEach((btn) => {
    btn.classList.remove("selected");
  });
  event.target.classList.add("selected");
}

/**
 * Navigate to product detail page
 */
function goToProduct(productId) {
  window.location.href = `product.html?id=${productId}`;
}

/**
 * Get URL parameter
 */
function getURLParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

/**
 * Initialize product page
 */
async function initProductPage() {
  requireAuth();
  const productId = getURLParam("id");

  if (!productId) {
    window.location.href = "dashboard.html";
    return;
  }

  // Show skeleton loaders
  const mainImage = document.getElementById("main-image");
  if (mainImage) {
    mainImage.innerHTML = '<div class="skeleton" style="width: 100%; height: 500px; border-radius: 12px;"></div>';
  }

  // Fetch all products for related products section
  await fetchAllProducts();

  // Display the product
  await displayProductDetail(productId);

  updateCartBadge();
}

/**
 * Initialize dashboard
 */
async function initDashboard() {
  requireAuth();

  // Set navbar user info
  const user = getCurrentUser();
  const userNameEl = document.getElementById("user-name");
  if (userNameEl) {
    userNameEl.textContent = user.name;
  }

  // Fetch products
  const products = await fetchAllProducts();

  if (products.length === 0) {
    document.getElementById("products-grid").innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">👗</div>
        <h2>No products available</h2>
        <p>Check back soon for our latest collection</p>
      </div>
    `;
  } else {
    renderProducts();
  }

  // Setup search
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchProducts(e.target.value);
    });
  }

  // Setup category filters
  const categoryBtns = document.querySelectorAll(".category-btn");
  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      categoryBtns.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      filterByCategory(e.target.textContent);
    });
  });

  updateCartBadge();
  updateNotificationBadge();
}
