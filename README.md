# DressLux - E-Commerce Website

A complete, luxury dress e-commerce website built with vanilla HTML5, CSS3, and JavaScript (ES6+). Uses MongoDB Atlas Data API for backend operations.

## 🎨 Features

- **User Authentication**: Register, login, and session management
- **Product Catalog**: Browse dresses with category filters and search
- **Shopping Cart**: Add/remove items, update quantities, persistent storage
- **Order Placement**: Checkout with delivery address and Cash on Delivery
- **Order Tracking**: View order history and status
- **Notifications**: Order and delivery updates
- **Admin Dashboard**: Manage products, orders, and customers
- **Responsive Design**: Mobile-first approach with media queries
- **Elegant UI**: Luxury aesthetic with smooth animations

## 📁 Project Structure

```
dresslux/
├── index.html                    # Main entry point (redirect logic)
├── pages/
│   ├── register.html             # User registration
│   ├── login.html                # User login
│   ├── dashboard.html            # Product listing & home
│   ├── product.html              # Product details page
│   ├── cart.html                 # Shopping cart
│   ├── order.html                # Order placement
│   ├── payment.html              # Order confirmation
│   ├── my-orders.html            # User's order history
│   ├── notifications.html        # Notifications center
│   └── admin/
│       ├── admin-login.html      # Admin login
│       ├── admin-dashboard.html  # Admin stats & overview
│       ├── add-product.html      # Add new products
│       ├── view-orders.html      # Manage orders
│       └── view-customers.html   # View customers
├── css/
│   ├── style.css                 # Global styles & variables
│   ├── navbar.css                # Navigation bar
│   ├── auth.css                  # Login/Register pages
│   ├── dashboard.css             # Product grid
│   ├── product.css               # Product details
│   ├── cart.css                  # Shopping cart
│   └── admin.css                 # Admin pages
└── js/
    ├── api.js                    # MongoDB Atlas API wrapper
    ├── auth.js                   # Authentication & session
    ├── products.js               # Product management
    ├── cart.js                   # Shopping cart logic
    ├── orders.js                 # Order management
    ├── notifications.js          # Notifications
    └── admin.js                  # Admin functions
```

## 🚀 Setup Instructions

### 1. **MongoDB Atlas Data API Setup**

#### Step 1: Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project called "DressLux"

#### Step 2: Create Cluster
1. Click "Create" to build a cluster
2. Choose **Free tier** (M0)
3. Select your region (closest to your location)
4. Click "Create Cluster" and wait for deployment (5-10 minutes)

#### Step 3: Create Database & Collections
1. Go to **Collections** tab
2. Create a new database named: `dresslux`
3. Create these collections:
   - `users`
   - `products`
   - `carts`
   - `orders`
   - `notifications`

#### Step 4: Enable Data API
1. In the left sidebar, click **App Services**
2. Click **Create an App**
3. Name it "DressLux-API"
4. In the left menu, click **Data API**
5. Click **Enable Data API**
6. Copy the **Base URL** (you'll need this)

#### Step 5: Create API Key
1. Click on **Data API** → **API Keys**
2. Click **Create API Key**
3. Name it "dresslux-web"
4. **Copy and save the key** (you'll need this)
5. Save the API Key securely

### 2. **Configure API Credentials**

Edit `js/api.js` and replace the placeholder values:

```javascript
const API_BASE = "https://data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1/action";
const API_KEY = "YOUR_ATLAS_API_KEY";
```

**How to find these values:**
- **YOUR_APP_ID**: In the Data API Base URL, copy the App ID (UUID between `/app/` and `/endpoint/`)
- **YOUR_ATLAS_API_KEY**: The API key you generated above

Example:
```javascript
const API_BASE = "https://data.mongodb-api.com/app/abc123def456/endpoint/data/v1/action";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

### 3. **Add Sample Data**

#### Create Admin User
Open browser console and run:
```javascript
// First, manually insert an admin user via MongoDB Atlas UI
// Or use the API:
const adminUser = {
  name: "Admin User",
  email: "admin@dresslux.com",
  password: "admin123", // Will be hashed
  role: "admin",
  createdAt: new Date().toISOString()
};

// Then register and login with these credentials
```

**Better approach: Use MongoDB Atlas Console**
1. Go to Collections
2. Click `users` collection
3. Click **Insert Document**
4. Paste:
```json
{
  "name": "Admin User",
  "email": "admin@dresslux.com",
  "password": "1234567890", // Simple hash of "admin123"
  "role": "admin",
  "createdAt": {"$date": "2024-01-01T00:00:00Z"}
}
```

#### Add Sample Products
In MongoDB Atlas Console, go to `products` collection and insert:

```json
{
  "name": "Classic Evening Gown",
  "description": "Elegant black evening dress perfect for formal occasions",
  "price": 4999,
  "category": "Formal",
  "sizes": ["XS", "S", "M", "L", "XL"],
  "stock": 15,
  "imageUrl": "https://images.unsplash.com/photo-1595777707802-86e2910f8ddf?w=500&h=650&fit=crop",
  "isNew": true,
  "createdAt": {"$date": {"$numberLong": "1704067200000"}}
}
```

More sample products:
```json
{
  "name": "Summer Casual Dress",
  "description": "Light and comfortable cotton dress for summer days",
  "price": 1299,
  "category": "Casual",
  "sizes": ["S", "M", "L"],
  "stock": 25,
  "imageUrl": "https://images.unsplash.com/photo-1552565612-5f33e7212e5d?w=500&h=650&fit=crop",
  "isNew": false,
  "createdAt": {"$date": {"$numberLong": "1704067200000"}}
}
```

```json
{
  "name": "Party Sequin Dress",
  "description": "Stunning sequin dress for celebrations and parties",
  "price": 3499,
  "category": "Party",
  "sizes": ["XS", "S", "M", "L"],
  "stock": 12,
  "imageUrl": "https://images.unsplash.com/photo-1596862618450-a0d8ce3d27e7?w=500&h=650&fit=crop",
  "isNew": true,
  "createdAt": {"$date": {"$numberLong": "1704067200000"}}
}
```

```json
{
  "name": "Traditional Saree",
  "description": "Beautiful silk saree with intricate embroidery",
  "price": 5999,
  "category": "Traditional",
  "sizes": ["One Size"],
  "stock": 8,
  "imageUrl": "https://images.unsplash.com/photo-1610631107014-d4fcafef69ef?w=500&h=650&fit=crop",
  "isNew": false,
  "createdAt": {"$date": {"$numberLong": "1704067200000"}}
}
```

## 🔐 User Credentials (for testing)

After you add the admin user via MongoDB, you can use:

**Admin Login:**
- Email: `admin@dresslux.com`
- Password: `admin123`

**Regular Users:**
- Sign up via the register page
- Any email and password (minimum 6 characters)

## 🌐 Running the Website

### Option 1: Using Live Server (VS Code)
1. Install **Live Server** extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. Opens at `http://127.0.0.1:5500/dresslux/index.html`

### Option 2: Using Python
```bash
# Python 3
python -m http.server 8000

# Then visit: http://localhost:8000/dresslux/
```

### Option 3: Using Node.js
```bash
npx http-server dresslux/
# Opens at http://127.0.0.1:8080
```

## 🎨 Customization

### Colors (Edit `css/style.css`)
```css
:root {
  --primary: #993556;           /* Deep Rose */
  --primary-light: #D4537E;     /* Light Rose */
  --blush: #FBEAF0;             /* Blush */
  --dark: #1a1a1a;              /* Dark */
  --white: #ffffff;             /* White */
}
```

### Fonts (Edit HTML `<head>`)
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
```

## 🛠️ API Endpoints (MongoDB Atlas Data API)

All operations use POST method:

| Action | Body | Purpose |
|--------|------|---------|
| `findOne` | `{ filter: {...} }` | Get single document |
| `find` | `{ filter: {...}, sort: {...}, limit: 100 }` | Get multiple documents |
| `insertOne` | `{ document: {...} }` | Create new document |
| `updateOne` | `{ filter: {...}, update: { $set: {...} } }` | Update document |
| `deleteOne` | `{ filter: {...} }` | Delete document |
| `count` | `{ query: {...} }` | Count documents |

Example:
```javascript
// Find all products in "Formal" category
const result = await find("products", { category: "Formal" });
```

## 📱 Responsive Breakpoints

- **Desktop**: 1200px+
- **Tablet**: 768px - 1024px
- **Mobile**: up to 480px

## 🔒 Security Notes

⚠️ **Important**: This is a client-side e-commerce site. For production:

1. **Hash Passwords**: Use bcrypt or similar server-side
2. **API Security**: Implement server middleware, not expose API keys
3. **Payment**: Integrate proper payment gateway (Stripe, Razorpay)
4. **Data Validation**: Validate all inputs server-side
5. **HTTPS**: Always use SSL/TLS in production
6. **Authentication**: Use JWT or secure sessions

## 📊 Data Models

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: "user" | "admin",
  createdAt: Date
}
```

### Product
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  sizes: [String],
  stock: Number,
  imageUrl: String,
  isNew: Boolean,
  createdAt: Date
}
```

### Order
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  items: [{ productId, name, price, size, quantity }],
  totalAmount: Number,
  shippingAddress: { fullName, phone, address, city, pincode },
  paymentMethod: "COD",
  status: "pending" | "processing" | "shipped" | "delivered",
  createdAt: Date
}
```

### Notification
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  message: String,
  type: String,
  isRead: Boolean,
  createdAt: Date
}
```

## 🐛 Troubleshooting

**Q: "API error" when loading products**
- Check API key and Base URL in `js/api.js`
- Ensure Data API is enabled in MongoDB Atlas
- Check API Key hasn't expired

**Q: Cannot login**
- Verify user exists in `users` collection
- Check email is lowercase
- Password should match (note: simple hash implementation)

**Q: Images not loading**
- Use valid image URLs
- Check CORS if images are from third-party

**Q: Cart not persisting**
- Check browser localStorage is enabled
- Clear browser cache and retry

## 📝 Features Checklist

- ✅ User Registration & Login
- ✅ Product Browse & Search
- ✅ Category Filter
- ✅ Product Details
- ✅ Add to Cart
- ✅ Cart Management
- ✅ Order Placement (COD)
- ✅ Order History
- ✅ Notifications
- ✅ Admin Dashboard
- ✅ Admin Add Products
- ✅ Admin Manage Orders
- ✅ Admin View Customers
- ✅ Responsive Design
- ✅ Toast Notifications
- ✅ LocalStorage Persistence

## 📄 License

This is a demo project for educational purposes.

## 💡 Future Enhancements

- Payment gateway integration (Stripe, Razorpay)
- Email notifications
- Product reviews & ratings
- Wishlist feature
- Advanced admin analytics
- Inventory management
- Customer support chat
- Multiple payment methods
