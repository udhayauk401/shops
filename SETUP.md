# DressLux - Quick Start Guide

Follow these steps to get your DressLux e-commerce website running in 10 minutes!

## Step 1: MongoDB Atlas Setup (5 minutes)

### 1.1 Create Free MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Register" and sign up
3. Verify email and log in

### 1.2 Create a Cluster
1. Click **"Create"** 
2. Select **Free tier (M0)**
3. Choose region closest to you
4. Click **"Create Cluster"** (wait 5-10 mins)

### 1.3 Create Database & Collections
1. Once cluster is ready, click **"Collections"**
2. Click **"Create Database"**
   - Database name: `dresslux`
   - Collection name: `users`
3. Click **"Create"**
4. Repeat to create these collections (use "+" icon in sidebar):
   - `products`
   - `orders`
   - `notifications`

### 1.4 Enable Data API
1. Left sidebar → **"App Services"**
2. Click **"Create an App"**
3. Name: `DressLux-API`
4. Click **"Create"**
5. Left menu → **"Data API"**
6. Click **"Enable Data API"**
7. **Copy the Base URL** (looks like: `https://data.mongodb-api.com/app/...`)

### 1.5 Create API Key
1. **Data API** → **API Keys**
2. Click **"Create API Key"**
3. Name: `dresslux-web`
4. Copy the key (SAVE IT - you won't see it again!)

## Step 2: Configure DressLux (2 minutes)

### 2.1 Update API Configuration
1. Open file: `js/api.js`
2. Find these lines (around line 4-5):
```javascript
const API_BASE = "https://data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1/action";
const API_KEY = "YOUR_ATLAS_API_KEY";
```

3. Replace with your values:
   - **YOUR_APP_ID**: Extract from your Base URL
     - Base URL: `https://data.mongodb-api.com/app/abc123xyz789/endpoint/data/v1`
     - App ID: `abc123xyz789`
   
   - **YOUR_ATLAS_API_KEY**: Paste the key you copied in Step 1.5

**Example of filled config:**
```javascript
const API_BASE = "https://data.mongodb-api.com/app/abc123xyz789/endpoint/data/v1/action";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

## Step 3: Add Sample Data (2 minutes)

### 3.1 Add Admin User
1. Go to MongoDB Atlas → Collections
2. Click on `users` collection
3. Click **"Insert Document"**
4. Replace `{ }` with:
```json
{
  "name": "Admin User",
  "email": "admin@dresslux.com",
  "password": "1234567890",
  "role": "admin",
  "createdAt": new Date()
}
```
5. Click **"Insert"**

### 3.2 Add Sample Products
1. Click on `products` collection
2. Click **"Insert Document"**
3. Paste each product below (repeat 3-4 times):

**Product 1: Classic Evening Gown**
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
  "createdAt": new Date()
}
```

**Product 2: Summer Casual Dress**
```json
{
  "name": "Summer Casual Dress",
  "description": "Light and comfortable cotton dress for summer days",
  "price": 1299,
  "category": "Casual",
  "sizes": ["S", "M", "L", "XL"],
  "stock": 25,
  "imageUrl": "https://images.unsplash.com/photo-1552565612-5f33e7212e5d?w=500&h=650&fit=crop",
  "isNew": false,
  "createdAt": new Date()
}
```

**Product 3: Party Sequin Dress**
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
  "createdAt": new Date()
}
```

**Product 4: Traditional Saree**
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
  "createdAt": new Date()
}
```

## Step 4: Run the Website (1 minute)

### Option A: Live Server (VS Code) - EASIEST
1. Install extension: **"Live Server"** by Ritwick Dey
2. Right-click on `index.html`
3. Select **"Open with Live Server"**
4. Opens automatically in browser!

### Option B: Python
```bash
python -m http.server 8000
# Then open: http://localhost:8000/dresslux/
```

### Option C: Node.js
```bash
npx http-server dresslux/
# Then open: http://127.0.0.1:8080
```

## Step 5: Test the Website

### User Registration & Browsing
1. You should see **Login page** automatically
2. Click **"Register here"**
3. Enter:
   - Full Name: Your name
   - Email: your@email.com
   - Password: password123
   - Confirm: password123
4. Click **"Create Account"**
5. You'll be redirected to **Login page**
6. Login with your credentials
7. See **Product grid** with 4 products!

### Shopping Flow
1. Click any product → See details
2. Select size → Click **"Add to Cart"**
3. Click 🛒 icon → See cart items
4. Click **"Proceed to Order"**
5. Fill delivery address → Click **"Place Order"**
6. See ✓ **Order Confirmed** page!

### Admin Testing
1. Go to http://localhost:XXXX/dresslux/pages/admin/admin-login.html
2. Login with:
   - Email: `admin@dresslux.com`
   - Password: `admin123`
3. See **Admin Dashboard** with stats!
4. Click **"Add New Product"** to add more items
5. Click **"Orders"** to manage orders
6. Click **"Customers"** to see all users

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "API error" on product load | Check API key & Base URL in js/api.js |
| Login not working | Verify admin user exists in MongoDB |
| Images not showing | Use valid image URLs or from unsplash.com |
| Cart empty | Check browser localStorage enabled |
| Products not appearing | Ensure collections have data |

## File Structure You Have

```
dresslux/
├── index.html                 ← Start here
├── pages/
│   ├── login.html             ← User login
│   ├── register.html          ← User signup
│   ├── dashboard.html         ← Shop page
│   ├── product.html           ← Product details
│   ├── cart.html              ← Shopping cart
│   ├── order.html             ← Checkout
│   ├── payment.html           ← Order success
│   ├── my-orders.html         ← Order history
│   ├── notifications.html     ← Notifications
│   └── admin/
│       ├── admin-login.html   ← Admin login
│       ├── admin-dashboard.html ← Admin home
│       ├── add-product.html   ← Add products
│       ├── view-orders.html   ← Manage orders
│       └── view-customers.html ← View customers
├── css/
│   ├── style.css              ← Global styles
│   ├── navbar.css             ← Navbar
│   ├── auth.css               ← Login/Signup
│   ├── dashboard.css          ← Shop grid
│   ├── product.css            ← Product page
│   ├── cart.css               ← Cart page
│   └── admin.css              ← Admin pages
└── js/
    ├── api.js                 ← ⚠️ EDIT THIS
    ├── auth.js                ← Login logic
    ├── products.js            ← Product logic
    ├── cart.js                ← Cart logic
    ├── orders.js              ← Order logic
    ├── notifications.js       ← Notifications
    └── admin.js               ← Admin logic
```

## Default Credentials (After Setup)

**Admin:**
- Email: `admin@dresslux.com`
- Password: `admin123`

**New Users:**
- Create via Register page
- Any email, password (min 6 chars)

## Key Features Ready to Use

✅ User registration & login  
✅ Product listing with search  
✅ Category filtering  
✅ Shopping cart  
✅ Order placement (Cash on Delivery)  
✅ Order history  
✅ Notifications  
✅ Admin dashboard  
✅ Admin product management  
✅ Responsive design  
✅ LocalStorage caching  

## Next Steps (Optional)

- Customize colors in `css/style.css`
- Add more products in MongoDB
- Integrate payment gateway
- Add email notifications
- Deploy to Netlify/Vercel

**Enjoy your DressLux e-commerce website! 👗✨**
