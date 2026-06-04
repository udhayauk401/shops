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
      {
        name: "Elegant Evening Gown",
        description: "Stunning deep rose evening gown with intricate beading and elegant flow",
        price: 5999,
        category: "Formal",
        sizes: ["XS", "S", "M", "L", "XL"],
        stock: 15,
        imageUrl: "https://images.unsplash.com/photo-1595777712802-ec7dd9b6b4a7?w=500",
        isNew: true,
        createdAt: new Date(),
      },
      {
        name: "Casual Summer Dress",
        description: "Light and breezy summer dress perfect for warm days",
        price: 1899,
        category: "Casual",
        sizes: ["XS", "S", "M", "L", "XL"],
        stock: 25,
        imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500",
        isNew: true,
        createdAt: new Date(),
      },
      {
        name: "Party Sequin Dress",
        description: "Glamorous sequin dress perfect for parties and celebrations",
        price: 3499,
        category: "Party",
        sizes: ["XS", "S", "M", "L", "XL"],
        stock: 20,
        imageUrl: "https://images.unsplash.com/photo-1567306226416-28f0efb6b0eb?w=500",
        isNew: true,
        createdAt: new Date(),
      },
      {
        name: "Traditional Saree",
        description: "Beautiful traditional saree with gold embroidery",
        price: 4499,
        category: "Traditional",
        sizes: ["One Size"],
        stock: 10,
        imageUrl: "https://images.unsplash.com/photo-1610899010893-e3f8e6dfd1d0?w=500",
        isNew: true,
        createdAt: new Date(),
      },
      {
        name: "Formal Blazer Dress",
        description: "Professional formal dress with blazer styling",
        price: 2999,
        category: "Formal",
        sizes: ["XS", "S", "M", "L", "XL"],
        stock: 18,
        imageUrl: "https://images.unsplash.com/photo-1607345604733-397bf44ff36e?w=500",
        isNew: false,
        createdAt: new Date(),
      },
    ];

    try {
      const existingProducts = await db.collection("products").countDocuments();

      if (existingProducts === 0) {
        const result = await db.collection("products").insertMany(sampleProducts);
        console.log(`  ✓ Added ${result.insertedIds.length} sample products`);
        sampleProducts.forEach((product) => {
          console.log(`    - ${product.name} (${product.category})`);
        });
      } else {
        console.log(`  ℹ Products already exist (${existingProducts} found)`);
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
