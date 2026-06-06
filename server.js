/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* DRESSLUX BACKEND - EXPRESS SERVER */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(__dirname));

// MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = "dresslux";
let mongoClient;
let db;

async function connectMongoDB() {
  try {
    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    db = mongoClient.db(DB_NAME);
    console.log("✓ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("✗ MongoDB Connection Error:", error);
    process.exit(1);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

function respondSuccess(res, data = null, message = "Success") {
  res.json({ success: true, message, data });
}

function respondError(res, statusCode, error) {
  res.status(statusCode).json({ success: false, error });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTHENTICATION ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Register User
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password) {
      return respondError(res, 400, "All fields required");
    }

    if (password !== confirmPassword) {
      return respondError(res, 400, "Passwords do not match");
    }

    if (password.length < 6) {
      return respondError(res, 400, "Password must be at least 6 characters");
    }

    // Check if email already exists
    const existingUser = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return respondError(res, 400, "Email already registered");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await db.collection("users").insertOne({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user",
      createdAt: new Date(),
    });

    respondSuccess(res, { userId: result.insertedId }, "User registered successfully");
  } catch (error) {
    console.error("Register Error:", error);
    respondError(res, 500, "Registration failed");
  }
});

// Login User
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return respondError(res, 400, "Email and password required");
    }

    // Find user
    const user = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (!user) {
      return respondError(res, 401, "Invalid email or password");
    }

    // Compare password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return respondError(res, 401, "Invalid email or password");
    }

    // Return user (without password)
    const { password: _, ...userWithoutPassword } = user;
    respondSuccess(res, userWithoutPassword, "Login successful");
  } catch (error) {
    console.error("Login Error:", error);
    respondError(res, 500, "Login failed");
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PRODUCT ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Get All Products
app.get("/api/products", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== "All" ? { category } : {};
    const products = await db
      .collection("products")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    respondSuccess(res, products);
  } catch (error) {
    console.error("Get Products Error:", error);
    respondError(res, 500, "Failed to fetch products");
  }
});

// Get Single Product
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return respondError(res, 400, "Invalid product ID");
    }

    const product = await db.collection("products").findOne({ _id: new ObjectId(id) });

    if (!product) {
      return respondError(res, 404, "Product not found");
    }

    respondSuccess(res, product);
  } catch (error) {
    console.error("Get Product Error:", error);
    respondError(res, 500, "Failed to fetch product");
  }
});

// Add Product (Admin)
app.post("/api/products", async (req, res) => {
  try {
    const { name, description, price, category, sizes, stock, imageUrl } = req.body;

    if (!name || !price || !category) {
      return respondError(res, 400, "Missing required fields");
    }

    const result = await db.collection("products").insertOne({
      name,
      description,
      price: Number(price),
      category,
      sizes: sizes || [],
      stock: Number(stock) || 0,
      imageUrl,
      isNew: true,
      createdAt: new Date(),
    });

    respondSuccess(res, { productId: result.insertedId }, "Product added successfully");
  } catch (error) {
    console.error("Add Product Error:", error);
    respondError(res, 500, "Failed to add product");
  }
});

// Update Product (Admin)
app.patch("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, sizes, stock, imageUrl } = req.body;

    if (!ObjectId.isValid(id)) {
      return respondError(res, 400, "Invalid product ID");
    }

    const updateFields = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(category !== undefined && { category }),
      ...(sizes !== undefined && { sizes: sizes || [] }),
      ...(stock !== undefined && { stock: Number(stock) || 0 }),
      ...(imageUrl !== undefined && { imageUrl }),
      updatedAt: new Date(),
    };

    const result = await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return respondError(res, 404, "Product not found");
    }

    respondSuccess(res, null, "Product updated successfully");
  } catch (error) {
    console.error("Update Product Error:", error);
    respondError(res, 500, "Failed to update product");
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COLLECTION ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Create Collection (Admin)
app.post("/api/collections", async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;

    if (!name) {
      return respondError(res, 400, "Collection name required");
    }

    const result = await db.collection("collections").insertOne({
      name,
      description: description || "",
      imageUrl: imageUrl || "",
      createdAt: new Date(),
    });

    respondSuccess(res, { collectionId: result.insertedId }, "Collection created successfully");
  } catch (error) {
    console.error("Add Collection Error:", error);
    respondError(res, 500, "Failed to create collection");
  }
});

// Get All Collections
app.get("/api/collections", async (req, res) => {
  try {
    const collections = await db
      .collection("collections")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    respondSuccess(res, collections);
  } catch (error) {
    console.error("Get Collections Error:", error);
    respondError(res, 500, "Failed to fetch collections");
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORDER ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Place Order
app.post("/api/orders", async (req, res) => {
  try {
    const { userId, items, totalAmount, shippingAddress, paymentMethod } = req.body;

    if (!userId || !items || items.length === 0) {
      return respondError(res, 400, "Invalid order data");
    }

    const order = {
      userId: new ObjectId(userId),
      items,
      totalAmount: Number(totalAmount),
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      status: "pending",
      createdAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(order);

    // Create notification
    await db.collection("notifications").insertOne({
      userId: new ObjectId(userId),
      message: `Your order #${result.insertedId.toString().substring(0, 8)} has been placed`,
      type: "order",
      isRead: false,
      createdAt: new Date(),
    });

    // Update user's last shipping address so admin can view customer details
    try {
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { lastShippingAddress: shippingAddress } }
      );
    } catch (err) {
      console.error("Failed to update user shipping address:", err);
    }

    respondSuccess(res, { orderId: result.insertedId }, "Order placed successfully");
  } catch (error) {
    console.error("Place Order Error:", error);
    respondError(res, 500, "Failed to place order");
  }
});

// Get User Orders
app.get("/api/orders/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
      return respondError(res, 400, "Invalid user ID");
    }

    const orders = await db
      .collection("orders")
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    respondSuccess(res, orders);
  } catch (error) {
    console.error("Get User Orders Error:", error);
    respondError(res, 500, "Failed to fetch orders");
  }
});

// Get All Orders (Admin)
app.get("/api/admin/orders", async (req, res) => {
  try {
    const orders = await db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Populate user info
    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        const user = await db.collection("users").findOne({ _id: order.userId });
        return {
          ...order,
          userName: user?.name || "Unknown",
          userEmail: user?.email || "Unknown",
        };
      })
    );

    respondSuccess(res, ordersWithUsers);
  } catch (error) {
    console.error("Get Admin Orders Error:", error);
    respondError(res, 500, "Failed to fetch orders");
  }
});

// Update Order Status (Admin)
app.patch("/api/orders/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(orderId)) {
      return respondError(res, 400, "Invalid order ID");
    }

    const result = await db
      .collection("orders")
      .updateOne({ _id: new ObjectId(orderId) }, { $set: { status } });

    if (result.matchedCount === 0) {
      return respondError(res, 404, "Order not found");
    }

    respondSuccess(res, null, "Order updated successfully");
  } catch (error) {
    console.error("Update Order Error:", error);
    respondError(res, 500, "Failed to update order");
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NOTIFICATION ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Get User Notifications
app.get("/api/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
      return respondError(res, 400, "Invalid user ID");
    }

    const notifications = await db
      .collection("notifications")
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    respondSuccess(res, notifications);
  } catch (error) {
    console.error("Get Notifications Error:", error);
    respondError(res, 500, "Failed to fetch notifications");
  }
});

// Mark Notification as Read
app.patch("/api/notifications/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!ObjectId.isValid(notificationId)) {
      return respondError(res, 400, "Invalid notification ID");
    }

    await db
      .collection("notifications")
      .updateOne({ _id: new ObjectId(notificationId) }, { $set: { isRead: true } });

    respondSuccess(res, null, "Notification marked as read");
  } catch (error) {
    console.error("Mark Read Error:", error);
    respondError(res, 500, "Failed to update notification");
  }
});

// Delete Notification
app.delete("/api/notifications/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!ObjectId.isValid(notificationId)) {
      return respondError(res, 400, "Invalid notification ID");
    }

    await db.collection("notifications").deleteOne({ _id: new ObjectId(notificationId) });

    respondSuccess(res, null, "Notification deleted");
  } catch (error) {
    console.error("Delete Notification Error:", error);
    respondError(res, 500, "Failed to delete notification");
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN DASHBOARD ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Get Admin Stats
app.get("/api/admin/stats", async (req, res) => {
  try {
    const productsCount = await db.collection("products").countDocuments();
    const ordersCount = await db.collection("orders").countDocuments();
    const usersCount = await db.collection("users").countDocuments();

    const orders = await db.collection("orders").find({}).toArray();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    respondSuccess(res, {
      productsCount,
      ordersCount,
      usersCount,
      totalRevenue,
    });
  } catch (error) {
    console.error("Get Stats Error:", error);
    respondError(res, 500, "Failed to fetch stats");
  }
});

// Get All Customers (Admin)
app.get("/api/admin/customers", async (req, res) => {
  try {
    const customers = await db
      .collection("users")
      .find({ role: "user" })
      .toArray();

    const customersWithOrderCount = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await db
          .collection("orders")
          .countDocuments({ userId: customer._id });
        return { ...customer, orderCount };
      })
    );

    respondSuccess(res, customersWithOrderCount);
  } catch (error) {
    console.error("Get Customers Error:", error);
    respondError(res, 500, "Failed to fetch customers");
  }
});

// Update user (admin) - set fields like lastShippingAddress or phone
app.patch("/api/admin/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body || {};

    if (!ObjectId.isValid(userId)) {
      return respondError(res, 400, "Invalid user ID");
    }

    const allowed = ["lastShippingAddress", "phone", "name", "email"];
    const setObj = {};
    Object.keys(updates).forEach((k) => {
      if (allowed.includes(k)) setObj[k] = updates[k];
    });

    if (Object.keys(setObj).length === 0) {
      return respondError(res, 400, "No valid fields to update");
    }

    await db.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: setObj });

    respondSuccess(res, null, "User updated successfully");
  } catch (error) {
    console.error("Update User Error:", error);
    respondError(res, 500, "Failed to update user");
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH CHECK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 404 Handler for API routes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    respondError(res, 404, `Route not found: ${req.method} ${req.path}`);
  } else {
    next();
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SPA Fallback - Serve index.html for non-API routes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get("/*", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVER STARTUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function startServer() {
  await connectMongoDB();

  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   DressLux Backend Server Running      ║
║   http://localhost:${PORT}              ║
║   MongoDB: Connected                   ║
╚════════════════════════════════════════╝
    `);
    // Attempt to open the default browser to the server URL
    try {
      const { exec } = require("child_process");
      const url = `http://localhost:${PORT}`;
      let cmd;
      if (process.platform === "win32") {
        // 'start' needs an empty title argument on Windows
        cmd = `start "" "${url}"`;
      } else if (process.platform === "darwin") {
        cmd = `open "${url}"`;
      } else {
        cmd = `xdg-open "${url}"`;
      }
      exec(cmd, (err) => {
        if (err) console.error("Failed to open browser:", err.message || err);
      });
    } catch (err) {
      console.error("Failed to auto-open browser:", err);
    }
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  if (mongoClient) await mongoClient.close();
  process.exit(0);
});
