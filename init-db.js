/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* DRESSLUX - DATABASE INITIALIZATION SCRIPT */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

require("dotenv").config();
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = "dresslux";

async function initializeDatabase() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("✓ Connected to MongoDB Atlas\n");

    const db = client.db(DB_NAME);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CREATE COLLECTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    console.log("📋 Creating collections...");
    const collections = ["users", "products", "orders", "notifications"];

    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`  ✓ Created ${collectionName} collection`);
      } catch (error) {
        if (error.code === 48) {
          console.log(`  ℹ ${collectionName} collection already exists`);
        } else {
          throw error;
        }
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ADD ADMIN USER
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    console.log("\n👤 Initializing admin user...");

    const adminPassword = await bcrypt.hash("admin123", 10);
    const adminUser = {
      name: "Admin",
      email: "admin@dresslux.com",
      password: adminPassword,
      role: "admin",
      createdAt: new Date(),
    };

    try {
      const existingAdmin = await db.collection("users").findOne({ email: "admin@dresslux.com" });

      if (!existingAdmin) {
        await db.collection("users").insertOne(adminUser);
        console.log("  ✓ Admin user created");
        console.log("    Email: admin@dresslux.com");
        console.log("    Password: admin123");
      } else {
        console.log("  ℹ Admin user already exists");
      }
    } catch (error) {
      console.log("  ⚠ Could not create admin user:", error.message);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ADD SAMPLE PRODUCTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    console.log("\n📦 Adding sample products...");

    const sampleProducts = [
      { name: "Classic Floral Dress", category: "Classic", price: 1999, description: "Classic floral print dress", sizes: ["XS","S","M","L","XL"], stock: 20, imageUrl: "https://images.unsplash.com/photo-1520975913109-7f8e1d9d1e8d?w=500", isNew: true, createdAt: new Date() },
      { name: "Office Formal Suit", category: "Formal", price: 2499, description: "Structured office formal suit", sizes: ["S","M","L"], stock: 15, imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500", isNew: false, createdAt: new Date() },
      { name: "Party Night Gown", category: "Party", price: 3499, description: "Gorgeous party night gown", sizes: ["S","M","L"], stock: 12, imageUrl: "https://images.unsplash.com/photo-1514995669114-5f2a9d0c5d3e?w=500", isNew: true, createdAt: new Date() },
      { name: "Traditional Silk Saree", category: "Traditional", price: 4999, description: "Silk saree with intricate motifs", sizes: ["One Size"], stock: 8, imageUrl: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=500", isNew: false, createdAt: new Date() },
      // keep a few existing items
      { name: "Elegant Evening Gown", description: "Stunning deep rose evening gown with intricate beading and elegant flow", price: 5999, category: "Formal", sizes: ["XS","S","M","L","XL"], stock: 15, imageUrl: "https://images.unsplash.com/photo-1595777712802-ec7dd9b6b4a7?w=500", isNew: true, createdAt: new Date() }
    ];

    try {
      let insertedCount = 0;
      for (const product of sampleProducts) {
        const exists = await db.collection("products").findOne({ name: product.name });
        if (!exists) {
          await db.collection("products").insertOne(product);
          insertedCount++;
          console.log(`    + Inserted: ${product.name} (${product.category})`);
        } else {
          console.log(`    - Exists: ${product.name}`);
        }
      }
      if (insertedCount > 0) {
        console.log(`  ✓ Added ${insertedCount} missing sample products`);
      } else {
        console.log(`  ℹ All sample products already exist`);
      }
    } catch (error) {
      console.log("  ⚠ Could not add products:", error.message);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SUMMARY
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    console.log("\n╔════════════════════════════════════════╗");
    console.log("║  Database Initialization Complete! ✓  ║");
    console.log("╚════════════════════════════════════════╝");
    console.log("\n📝 Admin Login Credentials:");
    console.log("   Email: admin@dresslux.com");
    console.log("   Password: admin123");
    console.log("\n🌐 Access the website:");
    console.log("   Frontend: http://localhost:8000");
    console.log("   Admin: http://localhost:8000/pages/admin/admin-login.html");
    console.log("\n");
  } catch (error) {
    console.error("❌ Database Initialization Error:", error);
  } finally {
    await client.close();
  }
}

initializeDatabase();
