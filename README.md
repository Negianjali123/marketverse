# ◆ MarketVerse — E-Commerce Marketplace

A full-stack e-commerce platform where **buyers** discover amazing products and **sellers** grow their business. Built with React + Node.js + MongoDB.

---

## Features

### 🛍️ For Buyers
- Browse & search products by category, price, and keywords
- Add to cart with quantity controls
- Checkout with order tracking
- Leave product reviews & ratings
- View order history

### 💼 For Sellers
- Dedicated seller dashboard with analytics
- Add, edit, delete products (name, price, stock, images, tags)
- Manage incoming orders & update statuses
- Revenue tracking & sales metrics
- Store profile customization

### ⚡ Technical
- JWT authentication with role-based access (buyer/seller/admin)
- RESTful API with Express.js
- MongoDB with Mongoose ODM
- React Router v6 with protected routes
- Cart persisted in localStorage
- Responsive design (mobile-first)
- Beautiful UI with custom design system

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd ecom-project

# Backend
cd backend
npm install
cp .env.example .env   # Edit with your MongoDB URI & JWT secret

# Frontend
cd ../frontend
npm install
```

### 2. Run Development

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm start
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health

### 3. Production Build

```bash
cd frontend
npm run build

# Backend serves the build in production mode
cd ../backend
NODE_ENV=production npm start
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (buyer or seller) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (filters, pagination) |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/:id` | Product details |
| POST | `/api/products` | Create product (seller) |
| PUT | `/api/products/:id` | Update product (seller) |
| DELETE | `/api/products/:id` | Delete product (seller) |
| POST | `/api/products/:id/reviews` | Add review (buyer) |
| POST | `/api/products/cartImage` | Geting imageurl in cart (buyer) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order (buyer) |
| GET | `/api/orders/my-orders` | Buyer's orders |
| GET | `/api/orders/seller-orders` | Seller's orders |
| PUT | `/api/orders/:id/status` | Update status (seller) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Axios |
| Styling | Custom CSS Design System (Outfit + Playfair Display) |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Icons | React Icons |

---

## Project Structure

```
ecom-project/
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   └── orders.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── api.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── CartContext.js
│   │   ├── components/
│   │   │   ├── Navbar.js / .css
│   │   │   ├── ProductCard.js / .css
│   │   │   └── Footer.js / .css
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Shop.js
│   │   │   ├── Auth.js
│   │   │   ├── Cart.js
│   │   │   ├── Orders.js
│   │   │   ├── SellerDashboard.js
│   │   │   └── Pages.css
│   │   ├── styles/global.css
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── README.md
```

---

Built with ❤️ for MarketVerse
