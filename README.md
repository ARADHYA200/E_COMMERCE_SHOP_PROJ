# 🛒 E-Commerce Management System

### Full-Stack MERN E-Commerce Platform

A modern full-stack e-commerce platform built using the **MERN stack**, featuring secure authentication, role-based authorization, product and inventory management, customer management, order tracking, coupons, reviews, wishlist, email verification, password recovery, cloud-based image uploads, and admin analytics.

🌐 **Live Demo:**
https://e-commerce-shop-proj.vercel.app

---

# ✨ Features

## 🔐 Authentication & Security

* User Registration & Login
* JWT-based Authentication
* Role-Based Authorization for Admin and Customers
* Password Hashing using **bcrypt**
* Email Verification using **Brevo**
* Forgot Password functionality
* Secure Password Reset using token-based verification
* Protected Frontend and Backend Routes
* CORS Configuration
* Helmet Security Middleware
* API Rate Limiting
* Centralized Error Handling

---

## 👤 User Management

* Customer Registration and Login
* Customer Profile Management
* Profile Image Upload
* Admin Customer Management
* Admin/User Role Management
* Account Verification Status

---

## 🛍️ Product Management

* Product Creation, Updating and Deletion
* Product Categories
* Product Pricing
* Product Stock Management
* Product Image Upload
* Cloudinary-based Image Storage
* Product Search and Filtering
* Product Details
* Product Ratings and Review Count

---

## 🛒 Shopping & Orders

* Add Products to Cart
* Update Cart Quantity
* Remove Products from Cart
* Wishlist Management
* Checkout System
* Order Placement
* Order History
* Order Status Tracking
* Shipping Address Management
* Stock Availability Validation
* Automatic Inventory Deduction after Order Placement
* Payment Method and Payment Status Tracking
* Transaction ID Tracking

---

## ⭐ Reviews & Ratings

* Add Product Reviews
* Product Rating System
* Review Management
* Average Product Rating Calculation
* Review Count Aggregation

---

## 🎟️ Coupon Management

* Create Coupons
* Update Coupons
* Delete Coupons
* Coupon Validation
* Discount Management
* Admin Coupon Management

---

## 📊 Admin Dashboard

* Total Users
* Total Products
* Total Orders
* Total Revenue
* Low Stock Products
* Order Status Analytics
* Product Management
* Customer Management
* Order Management
* Coupon Management

---

## 🎨 UI & User Experience

* Responsive Design
* Modern React UI
* Tailwind CSS
* Dark Mode
* Reusable Components
* Protected Routes
* User-Friendly Error Pages

---

# ☁️ Cloud & Email Integration

### Cloudinary

Used for cloud-based image storage instead of storing uploaded images locally on the backend.

* Product Image Uploads
* User Profile Image Uploads
* In-memory file processing using Multer
* Cloudinary-hosted image URLs
* Separate Cloudinary folders for products and user profiles

### Brevo

Used for transactional email functionality.

* Account Verification Emails
* Forgot Password Emails
* Password Reset Links

---

# 🛠 Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router
* Context API
* Recharts

## Backend

* Node.js
* Express.js
* REST APIs
* JWT
* bcrypt
* Multer
* Helmet
* Morgan
* Express Rate Limit
* CORS

## Database

* MongoDB
* Mongoose

## Cloud Services

* Cloudinary — Image Storage
* Brevo — Transactional Emails

## Deployment

* Vercel

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      React + Vite    │
                         │    Tailwind Frontend │
                         └──────────┬───────────┘
                                    │
                                  Axios
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Express REST API   │
                         │      Node.js         │
                         └──────────┬───────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
        ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
        │   MongoDB    │    │  Cloudinary  │    │    Brevo     │
        │   Database   │    │    Images    │    │    Emails    │
        └──────────────┘    └──────────────┘    └──────────────┘
```

---

# 📂 Project Structure

```text
E_COMMERCE_SHOP_PROJ/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── couponController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   ├── reviewController.js
│   │   └── wishlistController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── profileUploadMiddleware.js
│   │   └── roleMiddleware.js
│   │
│   ├── models/
│   │   ├── Coupon.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   ├── Review.js
│   │   ├── User.js
│   │   └── Wishlist.js
│   │
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── couponRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── uploadRoutes.js
│   │   ├── userRoutes.js
│   │   └── wishlistRoutes.js
│   │
│   ├── utils/
│   │   └── sendEmail.js
│   │
│   ├── server.js
│   └── package.json
│
├── screenshots/
│
└── README.md
```

---

# 🔄 Authentication Flow

```text
User Registration
        │
        ▼
Create User
        │
        ▼
Hash Password using bcrypt
        │
        ▼
Generate Verification Token
        │
        ▼
Send Verification Email via Brevo
        │
        ▼
User Verifies Account
        │
        ▼
Login using Email + Password
        │
        ▼
Generate JWT
        │
        ▼
Access Protected Resources
```

---

# 🔑 Password Reset Flow

```text
Forgot Password
       │
       ▼
Generate Reset Token
       │
       ▼
Send Reset Email via Brevo
       │
       ▼
User Opens Reset Link
       │
       ▼
Validate Token
       │
       ▼
Set New Password
       │
       ▼
Hash Password using bcrypt
       │
       ▼
Update User
```

---

# ☁️ Image Upload Flow

## Product Images

```text
Product Image
     │
     ▼
Multer Memory Storage
     │
     ▼
Image Buffer
     │
     ▼
Cloudinary Upload
     │
     ▼
Secure Cloudinary URL
     │
     ▼
Store Image URL with Product
```

## User Profile Images

```text
Profile Image
     │
     ▼
Multer Memory Storage
     │
     ▼
Cloudinary
     │
     ▼
Secure Image URL
     │
     ▼
User Profile
```

---

# 🚀 Installation

## 1. Clone Repository

```bash
git clone https://github.com/ARADHYA200/E_COMMERCE_SHOP_PROJ.git

cd E_COMMERCE_SHOP_PROJ
```

---

## 2. Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

## 3. Backend Setup

Open another terminal:

```bash
cd server

npm install

npm start
```

Backend will run on:

```text
http://localhost:5000
```

---

# 🔐 Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

BREVO_API_KEY=your_brevo_api_key
```

> Never commit `.env` files or API keys to the repository.

---

# 📸 Screenshots

## Home

![Home](screenshots/home.png)

---

## Admin Dashboard

![Admin Dashboard](screenshots/admin-dashboard.png)

---

## Login

![Login](screenshots/login.png)

---

## Products

![Products](screenshots/products.png)

---

# 🧩 Core Backend Modules

| Module         | Functionality                                          |
| -------------- | ------------------------------------------------------ |
| Authentication | Registration, Login, JWT, Verification, Password Reset |
| Authorization  | Role-based Admin/User access                           |
| Products       | Product CRUD, Categories, Stock, Images                |
| Orders         | Checkout, Orders, Status, Inventory                    |
| Coupons        | Coupon Creation, Validation, Discounts                 |
| Reviews        | Ratings and Product Reviews                            |
| Wishlist       | Add/Remove Wishlist Products                           |
| Users          | Customer and Profile Management                        |
| Admin          | Dashboard and Business Analytics                       |
| Uploads        | Cloudinary Product Image Uploads                       |
| Email          | Brevo Verification and Password Reset                  |

---

# 🔒 Security Practices

* Passwords hashed using bcrypt
* JWT-based authentication
* Role-based authorization
* Protected API routes
* Environment variables for secrets
* CORS configuration
* Helmet security headers
* Express rate limiting
* Centralized error handling
* Input validation and authorization checks

---

# 🚀 Future Improvements

* Online Payment Gateway Integration
* Advanced Admin Reports
* Order Invoice Generation
* Product Recommendation System
* Dockerization
* Automated Testing
* CI/CD Pipeline
* Advanced Search and Filtering

---

# 👨‍💻 Author

**Aradhya Agarwal**

B.Tech — Electronics & Communication Engineering
**Dr. B. R. Ambedkar National Institute of Technology, Jalandhar**

GitHub:
https://github.com/ARADHYA200