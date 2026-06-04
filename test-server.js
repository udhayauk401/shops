#!/usr/bin/env node

// Test server to diagnose issues
console.log("=== Starting Test Server ===");
console.log("Node version:", process.version);
console.log("Current directory:", process.cwd());

// Check environment variables
console.log("Port:", process.env.PORT || 3000);
console.log("NODE_ENV:", process.env.NODE_ENV || "not set");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✓ Set" : "✗ Not set");

// Try to require express
try {
  const express = require("express");
  console.log("✓ Express loaded");
} catch (e) {
  console.error("✗ Express error:", e.message);
  process.exit(1);
}

// Try to require dotenv
try {
  require("dotenv").config();
  console.log("✓ Dotenv loaded");
} catch (e) {
  console.error("✗ Dotenv error:", e.message);
}

// Try to start basic server
try {
  const express = require("express");
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  app.get("/test", (req, res) => {
    res.json({ status: "Test server working" });
  });
  
  const server = app.listen(PORT, () => {
    console.log(`✓ Test server running on port ${PORT}`);
    console.log(`  http://localhost:${PORT}/test`);
  });
  
  // Auto-close after 30 seconds
  setTimeout(() => {
    console.log("\nClosing test server...");
    server.close();
  }, 30000);
  
} catch (e) {
  console.error("✗ Server start error:", e.message);
  console.error(e);
  process.exit(1);
}
