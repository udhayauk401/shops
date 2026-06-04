# DressLux Backend Setup Complete ✅

Your DressLux e-commerce website now has a **Node.js/Express backend** connected to MongoDB Atlas!

## 🏗️ Architecture

```
Frontend (HTML/CSS/JS)  →  Express Backend (Node.js)  →  MongoDB Atlas
http://localhost:8000        http://localhost:3000         Your Cluster0
```

## 🚀 Running the Website

You need **2 terminal windows**:

### Terminal 1: Backend Server (Port 3000)
Already running! ✓

The backend is serving these endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/orders` - Place order
- `POST /api/admin/orders` - Get all orders
- And more...

### Terminal 2: Frontend Server (Port 8000)

Open a **new terminal** and run:

```powershell
cd c:\Users\udhaya\new\dresslux
python -m http.server 8000
```

Or use **Live Server** in VS Code:
1. Right-click `index.html` → **Open with Live Server**

Then open your browser:
```
http://localhost:8000
```

## 📝 Test the Website

### 1. Register a New User
- Click "Register here"
- Fill in name, email, password
- Submit

### 2. Login
- Use your registered email & password
- You'll see the product dashboard

### 3. Try Admin Features

**First, create an admin user in MongoDB:**

1. Open MongoDB Compass (or Atlas UI)
2. Go to `dresslux` → `users` collection
3. Insert this document:
```json
{
  "name": "Admin",
  "email": "admin@dresslux.com",
  "password": "$2b$10$F0r.nxXqmLX4.0l5Ov6.5OVFDJuW0fQPHhWmM1c9V8YpWrXkVQvZG",
  "role": "admin",
  "createdAt": {
    "$date": "2026-06-04T00:00:00Z"
  }
}
```

4. Go to `admin/admin-login.html`
5. Login with: `admin@dresslux.com` / `admin123`

## 🛍️ Add Sample Products

**In MongoDB Compass**, go to `dresslux` → `products` collection and insert:

```json
{
  "name": "Elegant Evening Gown",
  "description": "Stunning deep rose evening gown with intricate beading",
  "price": 5999,
  "category": "Formal",
  "sizes": ["XS", "S", "M", "L", "XL"],
  "stock": 15,
  "imageUrl": "https://images.unsplash.com/photo-1595777712802-ec7dd9b6b4a7?w=500",
  "isNew": true,
  "createdAt": {
    "$date": "2026-06-04T00:00:00Z"
  }
}
```

Add more products with different categories (Casual, Party, Traditional).

## 🔧 Stopping the Backend

In the terminal running the backend, press:
```
Ctrl + C
```

Then to restart:
```powershell
cd dresslux
node server.js
```

## ✅ Checklist

- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 8000  
- [ ] Can access http://localhost:8000
- [ ] Can register a new user
- [ ] Can login with registered account
- [ ] Can see products on dashboard (after adding to MongoDB)
- [ ] Can create admin user and login as admin
- [ ] Can add products as admin
- [ ] Can place orders
- [ ] Can view orders

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check if port 3000 is already in use |
| MongoDB connection error | Verify `.env` file has correct connection string |
| Frontend can't reach backend | Ensure backend is running AND check console for CORS errors |
| Products don't show | Add products to MongoDB `products` collection |
| Login fails | Verify user exists in MongoDB `users` collection |

## 📦 Production Deployment

When ready to deploy:

1. **Backend**: Deploy to Heroku, Railway, or Render
2. **Frontend**: Deploy to Netlify, Vercel, or GitHub Pages
3. **Update**: Change `API_BASE` in `js/api.js` to production backend URL

---

**Your DressLux store is ready! Start shopping!** 🎉👗
