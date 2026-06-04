# DressLux Setup Verification Checklist

Use this checklist to verify your DressLux installation is complete and working.

## ✅ File Structure Verification

### Root Files
- [ ] `index.html` exists and contains redirect logic
- [ ] `README.md` exists (full documentation)
- [ ] `SETUP.md` exists (quick start guide)
- [ ] `PROJECT_SUMMARY.md` exists (project overview)

### CSS Files (should be in `css/` folder)
- [ ] `css/style.css` - Global styles (should have CSS variables)
- [ ] `css/navbar.css` - Navbar styling
- [ ] `css/auth.css` - Login/register styling
- [ ] `css/dashboard.css` - Product grid styling
- [ ] `css/product.css` - Product detail styling
- [ ] `css/cart.css` - Cart page styling
- [ ] `css/admin.css` - Admin page styling

### JavaScript Files (should be in `js/` folder)
- [ ] `js/api.js` - Contains API wrapper functions
- [ ] `js/auth.js` - Contains authentication functions
- [ ] `js/products.js` - Contains product functions
- [ ] `js/cart.js` - Contains cart functions
- [ ] `js/orders.js` - Contains order functions
- [ ] `js/notifications.js` - Contains notification functions
- [ ] `js/admin.js` - Contains admin functions

### User Pages (should be in `pages/` folder)
- [ ] `pages/register.html` - Registration page
- [ ] `pages/login.html` - Login page
- [ ] `pages/dashboard.html` - Shopping home page
- [ ] `pages/product.html` - Product details page
- [ ] `pages/cart.html` - Shopping cart page
- [ ] `pages/order.html` - Order placement page
- [ ] `pages/payment.html` - Order confirmation page
- [ ] `pages/my-orders.html` - Order history page
- [ ] `pages/notifications.html` - Notifications page

### Admin Pages (should be in `pages/admin/` folder)
- [ ] `pages/admin/admin-login.html` - Admin login page
- [ ] `pages/admin/admin-dashboard.html` - Admin dashboard
- [ ] `pages/admin/add-product.html` - Add product page
- [ ] `pages/admin/view-orders.html` - Orders management
- [ ] `pages/admin/view-customers.html` - Customers list

## 🔧 MongoDB Atlas Configuration

### Account & Database Setup
- [ ] MongoDB Atlas account created
- [ ] Cluster created (M0 free tier)
- [ ] Database "dresslux" created
- [ ] Collections created:
  - [ ] `users` collection
  - [ ] `products` collection
  - [ ] `orders` collection
  - [ ] `notifications` collection

### Data API Setup
- [ ] Data API enabled in App Services
- [ ] API App created ("DressLux-API")
- [ ] Base URL copied and saved
- [ ] API Key generated and saved

### API Configuration
- [ ] `js/api.js` updated with correct API Base URL
- [ ] `js/api.js` updated with correct API Key
- [ ] Base URL format: `https://data.mongodb-api.com/app/[APP_ID]/endpoint/data/v1/action`

## 📊 Sample Data

### Admin User
- [ ] Admin user created in `users` collection:
  - Email: `admin@dresslux.com`
  - Password: (hashed or plain)
  - Role: `admin`

### Sample Products (at least 1)
- [ ] At least 1 product in `products` collection
- [ ] Each product has:
  - [ ] `name` field
  - [ ] `price` field (number)
  - [ ] `category` field (Casual, Formal, Party, or Traditional)
  - [ ] `description` field
  - [ ] `sizes` field (array with at least one size)
  - [ ] `stock` field (number > 0)
  - [ ] `imageUrl` field (valid image URL)
  - [ ] `createdAt` field (date)

## 🚀 Running the Website

### Method Selected (choose one)
- [ ] Live Server (VS Code extension)
- [ ] Python HTTP Server
- [ ] Node.js HTTP Server
- [ ] Other: ___________

### Server Running
- [ ] Web server started successfully
- [ ] No port conflicts
- [ ] Browser accessible at: ___________
- [ ] index.html loads without errors

## 🧪 Testing - User Workflow

### Registration
- [ ] Navigate to login page from index.html
- [ ] Click "Register here" link
- [ ] Fill form with test data
- [ ] Submit registration
- [ ] See success message
- [ ] Redirected to login page

### Login
- [ ] Enter admin credentials (admin@dresslux.com / admin123)
- [ ] Click Login button
- [ ] Login successful
- [ ] Redirected to dashboard (NOT admin dashboard)
- [ ] Can see products on page

### Product Browsing
- [ ] Products load from database
- [ ] Search bar works (filters products by name)
- [ ] Category buttons work:
  - [ ] "All" shows all products
  - [ ] "Casual" filters to casual dresses
  - [ ] "Formal" filters to formal dresses
  - [ ] "Party" filters to party dresses
  - [ ] "Traditional" filters to traditional dresses
- [ ] Product cards display:
  - [ ] Product image
  - [ ] Product name
  - [ ] Product price
  - [ ] "Add to Cart" button

### Product Details
- [ ] Click on a product
- [ ] Product detail page loads with URL parameter (?id=...)
- [ ] Main image displays
- [ ] Product name displays
- [ ] Product price displays
- [ ] Size selector appears with available sizes
- [ ] Quantity buttons (+/-) work
- [ ] "Add to Cart" button works

### Shopping Cart
- [ ] Products added to cart appear on cart page
- [ ] Cart items show:
  - [ ] Product image
  - [ ] Product name
  - [ ] Selected size
  - [ ] Price
  - [ ] Quantity (with +/- buttons)
  - [ ] Remove button
- [ ] Quantity adjustment updates total
- [ ] Remove item removes from cart
- [ ] Order summary shows:
  - [ ] Subtotal
  - [ ] Shipping (FREE if >₹1000, else ₹150)
  - [ ] Tax (18%)
  - [ ] Total amount
- [ ] "Proceed to Order" button works

### Order Placement
- [ ] Order page loads with cart items
- [ ] Form fields appear:
  - [ ] Full Name
  - [ ] Phone Number
  - [ ] Street Address
  - [ ] City
  - [ ] Pincode
- [ ] "Cash on Delivery" option selected
- [ ] Fill form with test data
- [ ] Click "Place Order"
- [ ] Success message shows
- [ ] Order summary displays

### Order Confirmation (Payment Page)
- [ ] Payment page shows with success icon
- [ ] Order ID displayed
- [ ] Order details shown
- [ ] Delivery address shown
- [ ] "View My Orders" button works
- [ ] "Continue Shopping" button works

### My Orders
- [ ] Previously placed order appears in list
- [ ] Order shows:
  - [ ] Order ID
  - [ ] Order date
  - [ ] Items list
  - [ ] Total amount
  - [ ] Status badge
- [ ] Status is "pending" (default)

### Notifications
- [ ] Notification from order placement appears
- [ ] Shows order placement message
- [ ] Timestamp shown ("just now")
- [ ] Can mark as read
- [ ] Can delete notification

### Cart Badge
- [ ] Cart icon shows count in navbar
- [ ] Badge updates when items added
- [ ] Badge count correct (sum of quantities)

### Logout
- [ ] Logout button visible in navbar
- [ ] Click logout
- [ ] Redirected to login page
- [ ] Local data cleared
- [ ] Cannot access dashboard without login

## 🧪 Testing - Admin Workflow

### Admin Login
- [ ] Go to admin/admin-login.html
- [ ] Enter admin credentials
- [ ] Login successful
- [ ] Redirected to admin dashboard (not user dashboard)

### Admin Dashboard
- [ ] Stats cards display:
  - [ ] Total Products count
  - [ ] Total Orders count
  - [ ] Total Customers count
  - [ ] Total Revenue amount
- [ ] Quick action buttons:
  - [ ] "Add New Product" link works
  - [ ] "View All Orders" link works
  - [ ] "View Customers" link works

### Add Product
- [ ] Form fields visible:
  - [ ] Product Name
  - [ ] Category dropdown
  - [ ] Description
  - [ ] Price
  - [ ] Stock
  - [ ] Size checkboxes
  - [ ] Image URL
- [ ] Image preview works
- [ ] Fill form with test product
- [ ] Submit button works
- [ ] Success message shows
- [ ] Redirected to dashboard
- [ ] New product appears on user dashboard

### View Orders
- [ ] Orders table shows all orders
- [ ] Columns visible:
  - [ ] Order ID
  - [ ] Customer Name
  - [ ] Items count
  - [ ] Total amount
  - [ ] Order date
  - [ ] Status dropdown
- [ ] Can change order status:
  - [ ] Select new status from dropdown
  - [ ] Status updates in database
  - [ ] Success message shows

### View Customers
- [ ] Customers table shows all users
- [ ] Columns visible:
  - [ ] Number/Index
  - [ ] Customer Name
  - [ ] Email
  - [ ] Join Date
  - [ ] Order Count
- [ ] Search filter works:
  - [ ] Type in search box
  - [ ] Filters customers by name/email
  - [ ] Hides non-matching rows

## 🐛 Error Handling

- [ ] Try to access protected page without login → Redirected to login
- [ ] Try to access admin page as regular user → Redirected to login
- [ ] Submit empty form → Error message appears
- [ ] Enter invalid email → Error message appears
- [ ] Enter mismatched passwords → Error message appears
- [ ] Try to add product with empty fields → Error message appears
- [ ] API connection fails → Error toast appears
- [ ] Try to place order with empty cart → Error message

## 📱 Responsive Design

### Desktop (1200px+)
- [ ] Product grid shows 3 columns
- [ ] All buttons and fields properly sized
- [ ] No horizontal scrolling

### Tablet (768px - 1024px)
- [ ] Product grid shows 2 columns
- [ ] Navbar menu hamburger appears
- [ ] All content accessible
- [ ] No overflow issues

### Mobile (< 480px)
- [ ] Product grid shows 1 column
- [ ] Hamburger menu works
- [ ] Forms are easy to fill
- [ ] Buttons are tappable (large enough)
- [ ] No horizontal scrolling
- [ ] Images scale properly

## 🎨 Visual Verification

### Colors
- [ ] Primary color (rose #993556) used on buttons
- [ ] Hover effects darken colors
- [ ] Blush background visible on input focus
- [ ] Status badges are color-coded:
  - [ ] Pending = amber/yellow
  - [ ] Processing = blue
  - [ ] Shipped = purple/pink
  - [ ] Delivered = green

### Animations
- [ ] Buttons have hover scale effect (1.03)
- [ ] Toast notifications slide in from right
- [ ] Cart icon has count badge
- [ ] Product cards lift on hover
- [ ] Smooth transitions on all interactive elements

### Typography
- [ ] Headings use Cormorant Garamond (serif, elegant)
- [ ] Body text uses Nunito (sans-serif, clean)
- [ ] Font sizes responsive

## 🔐 Security

- [ ] User passwords not displayed in console
- [ ] Passwords hashed in code
- [ ] Admin access restricted to role="admin"
- [ ] Session stored in localStorage (not cookies)
- [ ] No sensitive data in local storage

## ✨ Polish Check

- [ ] No console errors
- [ ] No console warnings
- [ ] All images load correctly
- [ ] No broken links
- [ ] Loading states (skeleton) show during API calls
- [ ] Empty states display when no data
- [ ] Toast notifications are readable

## 📋 Final Checklist

All systems go! ✅
- [ ] File structure complete
- [ ] MongoDB set up correctly
- [ ] API credentials configured
- [ ] Sample data added
- [ ] Website runs without errors
- [ ] User flow works end-to-end
- [ ] Admin features work
- [ ] Responsive on all devices
- [ ] No console errors
- [ ] Ready for use/deployment!

---

## 🆘 If Something Doesn't Work

1. **Check MongoDB API key** in `js/api.js`
2. **Verify database collections exist** in MongoDB Atlas
3. **Check browser console** for JavaScript errors (F12)
4. **Verify sample data** exists in MongoDB
5. **Check API Base URL** format matches exactly
6. **Try hard refresh** (Ctrl+Shift+R or Cmd+Shift+R)
7. **Clear localStorage** (console: `localStorage.clear()`)
8. **Review SETUP.md** for any missed steps

## 📞 Common Issues

| Issue | Solution |
|-------|----------|
| "API error" on page load | Check API key in js/api.js matches MongoDB |
| Login doesn't work | Verify admin user exists in users collection |
| Products don't show | Ensure products collection has data |
| Images not loading | Check image URLs are valid (use unsplash.com) |
| Cart not persisting | Enable localStorage in browser settings |
| Navbar menu stuck | Check hamburger toggle in browser console |

---

**Once all checkboxes are marked ✅, your DressLux store is ready!** 🎉👗
