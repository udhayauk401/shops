# DressLux - Complete Project Documentation

## Project Overview

DressLux is a fully functional, responsive e-commerce website for luxury dress shopping. Built with vanilla HTML5, CSS3, and JavaScript (ES6+), it uses MongoDB Atlas Data API for backend operations.

## 📦 Complete File List & Structure

### Root Level
```
dresslux/
├── index.html                 # Entry point - redirects to login or dashboard
├── README.md                  # Complete documentation
├── SETUP.md                   # Quick start guide (read this first!)
├── css/                       # Stylesheets
├── js/                        # JavaScript modules
└── pages/                     # HTML pages
```

## 🎨 CSS Files (6 files)

| File | Purpose | Size |
|------|---------|------|
| `css/style.css` | Global styles, variables, typography, utilities | ~500 lines |
| `css/navbar.css` | Sticky navbar, mobile menu, cart badge | ~150 lines |
| `css/auth.css` | Login/register forms, auth card styling | ~200 lines |
| `css/dashboard.css` | Product grid, hero banner, filters, search | ~350 lines |
| `css/product.css` | Product details, gallery, size selector, reviews | ~450 lines |
| `css/cart.css` | Cart items table, order summary, checkout | ~350 lines |
| `css/admin.css` | Admin dashboard, forms, tables, stats cards | ~400 lines |

**Total CSS: ~2,400 lines**

## 🔧 JavaScript Files (7 files)

| File | Purpose | Functions |
|------|---------|-----------|
| `js/api.js` | MongoDB Atlas Data API wrapper | `atlasAPI()`, `findOne()`, `find()`, `insertOne()`, `updateOne()`, `deleteOne()`, toast helpers |
| `js/auth.js` | Authentication & session management | `registerUser()`, `loginUser()`, `logoutUser()`, `getCurrentUser()`, `isAuthenticated()`, password validation |
| `js/products.js` | Product listing & details | `fetchAllProducts()`, `fetchProductById()`, `filterByCategory()`, `searchProducts()`, `renderProducts()`, `displayProductDetail()` |
| `js/cart.js` | Shopping cart management | `addToCart()`, `removeFromCart()`, `updateQuantity()`, `getCart()`, `saveCart()`, `renderCartItems()`, `updateOrderSummary()` |
| `js/orders.js` | Order placement & tracking | `placeOrder()`, `fetchUserOrders()`, `initOrderPage()`, `initPaymentPage()`, `validateOrderForm()` |
| `js/notifications.js` | Notification management | `fetchUserNotifications()`, `markAsRead()`, `deleteNotification()`, `renderNotifications()`, `createNotification()` |
| `js/admin.js` | Admin dashboard & management | `getAdminStats()`, `addNewProduct()`, `fetchOrdersWithUsers()`, `updateOrderStatus()`, `fetchAllCustomers()` |

**Total JS: ~1,200 lines**

## 📄 User-Facing Pages (9 files)

### Authentication Pages
1. **register.html** - User registration form
   - Full name, email, password fields
   - Validation & duplicate email check
   - Links to login page

2. **login.html** - User login form
   - Email & password fields
   - Role-based redirect (user/admin)
   - Links to registration page

### Shopping Pages
3. **dashboard.html** - Main shopping page
   - Sticky navbar with cart & notification badges
   - Hero banner section
   - Search bar with real-time filtering
   - Category filter buttons (All, Casual, Formal, Party, Traditional)
   - Responsive product grid (3 cols desktop, 2 tablet, 1 mobile)
   - Product cards with hover effects

4. **product.html** - Product detail page
   - Read product ID from URL parameter
   - Product gallery with main image
   - Size selector (XS, S, M, L, XL)
   - Quantity selector
   - Add to cart & wishlist buttons
   - Sticky product info sidebar
   - Related products section

5. **cart.html** - Shopping cart page
   - List all cart items with images
   - Quantity +/- buttons for each item
   - Remove item buttons
   - Real-time total calculation
   - Order summary sidebar
   - "Proceed to Order" & "Continue Shopping" buttons

6. **order.html** - Order placement page
   - Delivery address form (Name, Phone, Address, City, Pincode)
   - Payment method selector (COD only)
   - Order summary with items
   - Form validation
   - Place order button

7. **payment.html** - Order confirmation page
   - Success checkmark icon
   - Order details display
   - Delivery address summary
   - "View Orders" & "Continue Shopping" buttons

8. **my-orders.html** - Order history page
   - List all user's orders
   - Order cards with ID, date, total, items, status
   - Status badges (color-coded)
   - View details buttons

9. **notifications.html** - Notifications center
   - List all notifications for user
   - Unread notifications highlighted
   - Mark as read & delete buttons
   - Relative time display
   - Mark all as read button

## 👨‍💼 Admin Pages (5 files)

### Admin Authentication
1. **admin/admin-login.html** - Admin login page
   - Same layout as user login
   - Email & password fields
   - Redirects to admin dashboard on success

### Admin Management
2. **admin/admin-dashboard.html** - Admin overview
   - 4 stat cards (Products, Orders, Customers, Revenue)
   - Quick action buttons
   - Real-time data from MongoDB

3. **admin/add-product.html** - Add new product
   - Form fields: Name, Description, Price, Category
   - Size checkboxes (XS, S, M, L, XL)
   - Stock quantity
   - Image URL with preview
   - Form validation
   - Submit button

4. **admin/view-orders.html** - Order management
   - Table of all orders
   - Order ID, Customer, Items, Total, Date, Status
   - Status dropdown (Pending, Processing, Shipped, Delivered)
   - Real-time status updates
   - View order details button

5. **admin/view-customers.html** - Customer management
   - Table of all customers
   - Name, Email, Join Date, Order Count
   - Search/filter by name or email
   - Customer count display

## 🗄️ Data Collections (MongoDB)

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase),
  password: String (hashed),
  role: "user" | "admin",
  createdAt: Date
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: "Casual" | "Formal" | "Party" | "Traditional",
  sizes: [String], // ["XS", "S", "M", "L", "XL"]
  stock: Number,
  imageUrl: String,
  isNew: Boolean,
  createdAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  items: [{
    productId: String,
    name: String,
    price: Number,
    imageUrl: String,
    size: String,
    quantity: Number
  }],
  totalAmount: Number,
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    pincode: String
  },
  paymentMethod: "COD",
  status: "pending" | "processing" | "shipped" | "delivered",
  createdAt: Date
}
```

### Notifications Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  message: String,
  type: String, // "order", "payment", "shipping", "delivery"
  isRead: Boolean,
  createdAt: Date
}
```

## 🎨 Design System

### Color Palette
- **Primary Rose**: #993556
- **Light Rose**: #D4537E
- **Blush**: #FBEAF0
- **Dark**: #1a1a1a
- **Gray**: #666
- **White**: #ffffff
- **Border**: #e8d5dc

### Typography
- **Headings**: Cormorant Garamond (serif)
- **Body**: Nunito (sans-serif)

### Spacing & Sizing
- Border radius: 12px
- Card shadow: 0 4px 20px rgba(153, 53, 86, 0.12)
- Breakpoints: 480px, 768px, 1024px, 1200px+

## 🚀 Key Features Implemented

### User Features
- ✅ Email registration with validation
- ✅ Secure login with password check
- ✅ Session persistence (localStorage)
- ✅ Profile viewing
- ✅ Product browsing with search
- ✅ Category filtering
- ✅ Product detail page
- ✅ Add to cart functionality
- ✅ Shopping cart management
- ✅ Order placement (COD)
- ✅ Order history tracking
- ✅ Notification center
- ✅ Responsive design

### Admin Features
- ✅ Admin login
- ✅ Dashboard with stats
- ✅ Add new products
- ✅ Manage orders (status updates)
- ✅ View all customers
- ✅ Revenue tracking

### Technical Features
- ✅ REST API integration (MongoDB Atlas)
- ✅ Client-side form validation
- ✅ LocalStorage for cart & session
- ✅ Toast notifications
- ✅ Mobile hamburger menu
- ✅ Responsive grid layouts
- ✅ Smooth animations & transitions
- ✅ Skeleton loaders for async data
- ✅ Error handling

## 📊 Statistics

| Metric | Count |
|--------|-------|
| Total Files | 26 |
| HTML Pages | 14 |
| CSS Files | 7 |
| JavaScript Files | 7 |
| Total Lines of Code | ~4,500+ |
| Collections (MongoDB) | 4 |
| API Endpoints | 6 |
| Responsive Breakpoints | 3 |

## 🔐 Security Considerations

### Implemented
- ✅ Email format validation
- ✅ Password strength validation (min 6 chars)
- ✅ Client-side form validation
- ✅ Role-based page access (localStorage check)
- ✅ CORS-safe API calls

### Not Implemented (For Production)
- ❌ Server-side password hashing (bcrypt)
- ❌ JWT/secure tokens
- ❌ HTTPS enforcement
- ❌ SQL injection prevention
- ❌ Rate limiting
- ❌ Payment gateway security

## 🎯 Getting Started

1. **Read**: `SETUP.md` (quick start guide)
2. **Setup**: MongoDB Atlas & API key
3. **Configure**: Update `js/api.js` with credentials
4. **Add Data**: Insert sample products via MongoDB
5. **Run**: Use Live Server or Python HTTP server
6. **Test**: Register, shop, and place orders!

## 📱 Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Android)

## 🎓 Learning Resources

This project demonstrates:
- Vanilla JavaScript (ES6+)
- REST API integration
- Responsive CSS Grid & Flexbox
- Client-side routing (URL parameters)
- LocalStorage API
- Async/Await
- DOM manipulation
- Event handling
- Form validation

## 📝 Code Organization

Each JavaScript module is self-contained and focused:
- **api.js**: All database operations
- **auth.js**: All authentication logic
- **products.js**: Product listing & details
- **cart.js**: Cart state & operations
- **orders.js**: Order creation & tracking
- **notifications.js**: Notification management
- **admin.js**: Admin-specific operations

## 🔄 Data Flow

```
User Registration
    ↓
[auth.js] validateForm() → [api.js] insertOne(users)
    ↓
Redirect to Login

User Login
    ↓
[auth.js] loginUser() → [api.js] findOne(users)
    ↓
Store in localStorage → Redirect to Dashboard

Product Browsing
    ↓
[products.js] fetchAllProducts() → [api.js] find(products)
    ↓
renderProducts() → Display grid

Add to Cart
    ↓
[cart.js] addToCart() → Save to localStorage
    ↓
updateCartBadge()

Place Order
    ↓
[orders.js] placeOrder() → [api.js] insertOne(orders)
    ↓
[api.js] insertOne(notifications) → Redirect to payment
```

## 🚀 Deployment (Future)

To deploy DressLux:
1. Move to Firebase Hosting, Netlify, or Vercel
2. Implement server-side API (Node.js/Express)
3. Add proper authentication (JWT)
4. Integrate payment gateway
5. Setup database security rules
6. Add email notifications
7. Implement rate limiting

---

**DressLux is ready to use! Start with `SETUP.md` for step-by-step instructions.** 👗✨
