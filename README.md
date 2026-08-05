# 🛒 Neighbour Market - Hyper-Local E-Commerce Application

[![Django](https://img.shields.io/badge/Django-5.x-092E20?style=for-the-badge&logo=django)](https://djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/DRF-SimpleJWT-red?style=for-the-badge&logo=django)](https://www.django-rest-framework.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)

> **Neighbour Market** is a full-stack hyper-local e-commerce platform connecting buyers with local neighborhood stores in Bangalore. The platform features **spatial distance filtering (Haversine formula)**, **real-time WebSocket vendor chat**, **dual Buyer/Seller dashboards**, **GPS location auto-detection**, and **global Dark/Light mode**.

---

## ✨ Core Features

- 📍 **Spatial Radius Filtering (Haversine Formula)**: Dynamically calculates great-circle distances in kilometers between the user's coordinates in Bangalore (Indiranagar, Koramangala, HSR Layout, etc.) and neighborhood shops.
- 🎯 **GPS Location Auto-Detection**: Uses HTML5 Geolocation API (`navigator.geolocation`) to auto-detect current user coordinates and filter nearby products.
- 💬 **Real-Time Vendor Chat (Django Channels & WebSockets)**: Instant messaging modal between buyers and shop owners using ASGI protocol and Channels group broadcast.
- 🏪 **Vendor Portal & Sales Analytics**: Sellers can view sales revenue charts, track customer orders, update order status (`Pending` ➔ `Processing` ➔ `Delivered`), and publish new products.
- 🛒 **Interactive Cart & Mock Payment Gateway**: Seamless checkout experience with order breakdown, Bangalore delivery address input, and simulated payment processing animation.
- ❤️ **Wishlist / Favourites**: Instant optimistic favorite toggling with local storage backup and logged-in JWT user synchronization.
- 🌓 **Global Dark / Light Theme**: Context-managed dark mode supporting system preference detection and smooth transitions.

---

## 🛠️ Tech Stack & Constraints

### **Backend**
* **Language**: Python 3.10+
* **Framework**: Django 5.x, Django REST Framework (DRF)
* **WebSockets**: Django Channels & Daphne (ASGI Server)
* **Authentication**: Simple JWT (JSON Web Tokens)
* **Database**: MySQL (configured in `settings.py` with SQLite fallback)

### **Frontend**
* **Framework**: React.js 18+ (Functional Components & Hooks)
* **Build Tool**: Vite 5.x
* **Styling**: Tailwind CSS 3.x
* **State & Routing**: React Context API (`AuthContext`, `ThemeContext`), React Router DOM v6
* **HTTP Client**: Axios with Bearer JWT Interceptors

---

## 📁 Repository Directory Structure

```
final_pro/
├── backend/
│   ├── manage.py
│   ├── neighbour_market/
│   │   ├── settings.py           # MySQL DB, DRF JWT, Channels, CORS
│   │   ├── urls.py               # Root API URLs
│   │   ├── asgi.py               # ProtocolTypeRouter for WebSockets & HTTP
│   │   └── wsgi.py
│   └── api/
│       ├── models.py             # User, Shop, Category, Product, Cart, Favourite, Order, ChatMessage
│       ├── serializers.py        # DRF ModelSerializers with calculated distance_km
│       ├── views.py              # ProductViewSet with Haversine distance spatial formula
│       ├── urls.py               # REST API & Payment mock routes
│       ├── consumers.py          # Real-time WebSocket ChatConsumer
│       ├── routing.py            # WebSocket URL patterns (ws/chat/<room>/)
│       ├── payment_mock.py       # Payment processing mock view
│       └── management/commands/
│           └── seed_data.py      # Seed management command for Bangalore products
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── App.jsx               # React Router DOM & ProtectedRoutes
        ├── context/
        │   ├── ThemeContext.jsx  # Dark/Light theme mode toggle
        │   └── AuthContext.jsx   # JWT login, role state & GPS location detection
        ├── utils/
        │   └── axiosConfig.js    # Axios with JWT Bearer token interceptor
        ├── components/
        │   ├── Navbar.jsx        # Home button, Dark mode toggle, location selector, cart badge
        │   ├── ProductCard.jsx   # Distance in km, heart icon wishlist toggle, vendor chat trigger
        │   ├── DistanceFilter.jsx# Delivery radius slider & preset pills
        │   └── ChatModal.jsx     # Floating WebSocket vendor chat modal
        └── pages/
            ├── BuyerHome.jsx     # Home page with location selector, radius slider, category pills
            ├── SellerDashboard.jsx# Vendor analytics chart, product inventory modal, order status table
            ├── Checkout.jsx      # Cart review, delivery address, mock payment gateway trigger
            ├── ProductDetails.jsx# Ratings, customer reviews, seller chat trigger
            └── Login.jsx         # Sign in & buyer/seller registration with quick demo account buttons
```

---

## 🚀 Quick Start & Installation

### 1️⃣ Prerequisites
Ensure you have the following installed on your machine:
- **Python**: v3.10 or higher
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher

---

### 2️⃣ Backend Setup (Django & Channels)

Open a terminal window and execute:

```bash
# Navigate to backend directory
cd backend

# Install Python packages
python -m pip install django djangorestframework djangorestframework-simplejwt django-cors-headers channels daphne

# Run database migrations
python manage.py makemigrations api
python manage.py migrate

# Seed initial Bangalore shops & products
python manage.py seed_data

# Start Django development server
python manage.py runserver 8000
```
> 🟢 **Backend API Server**: `http://localhost:8000/api/`

---

### 3️⃣ Frontend Setup (React & Vite)

Open a **second terminal window** and execute:

```bash
# Navigate to frontend directory
cd frontend

# Install Node modules
cmd /c npm install

# Start Vite development server
cmd /c npm run dev
```
> 🟢 **Frontend Web Application**: `http://localhost:3000`

---

## 🔑 Demo Login Accounts

For rapid testing, pre-configured accounts are seeded into the database and available via **Instant Demo Access** on the Login page (`http://localhost:3000/login`):

| Role | Username | Password | Neighborhood / Description |
| :--- | :--- | :--- | :--- |
| **Buyer (Customer)** | `bangalore_buyer` | `password123` | MG Road, Central Bangalore |
| **Seller (Vendor)** | `indiranagar_organics` | `password123` | Indiranagar Fresh Organics (100ft Road) |
| **Seller (Vendor)** | `koramangala_crust` | `password123` | Koramangala Crust & Co (5th Block) |

---

## 🛰️ API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Register new Buyer or Seller user |
| `POST` | `/api/auth/token/` | Simple JWT token obtain pair (login) |
| `GET` | `/api/auth/me/` | Get authenticated user profile & role |
| `GET` | `/api/products/?lat=..&lon=..&max_distance=..` | Haversine distance spatial product query |
| `POST` | `/api/cart/` | Add item to user shopping cart |
| `POST` | `/api/favourites/toggle/` | Toggle product in user wishlist |
| `POST` | `/api/orders/` | Place buyer order grouped by shop |
| `PATCH`| `/api/orders/<id>/update_status/` | Update vendor order status (`Pending`/`Processing`/`Delivered`) |
| `POST` | `/api/payment/process/` | Mock payment gateway processing endpoint |
| `WS` | `ws://localhost:8000/ws/chat/<room>/` | Real-time WebSocket vendor messaging |

---

## 📄 License
This project is licensed under the MIT License - see the `LICENSE` file for details.
