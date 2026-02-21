# 🛒 E-Commerce Shop

A full-stack e-commerce application built with React, Node.js, Express, and MongoDB. This modern shopping platform provides a seamless user experience with comprehensive product management, secure authentication, order processing, and admin controls.

## ✨ Features

### 🛍️ Customer Features
- **Product Browsing** - View products with detailed descriptions, images, and pricing
- **Product Search & Filter** - Find products by category, price range, and ratings
- **Shopping Cart** - Add/remove items, update quantities
- **Wishlist** - Save favorite products for later
- **Product Reviews** - Read and write product reviews with star ratings
- **User Authentication** - Secure registration and login with JWT
- **Order Management** - Place orders, view order history, track orders
- **User Profile** - Manage personal information and preferences
- **Payment Processing** - Secure checkout with multiple payment options
- **Coupon/Discount Codes** - Apply promotional codes for discounts

### 👨‍💼 Admin Features
- **Dashboard** - Overview of sales, orders, and customers
- **Product Management** - Add, edit, delete products
- **Order Management** - View all orders, update order status
- **User Management** - Manage customer accounts and roles
- **Coupon Management** - Create and manage promotional codes
- **Analytics** - Sales reports and customer insights
- **Category Management** - Organize products by categories

### 🔒 Security Features
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Role-Based Access Control** - Different permissions for users and admins
- **CORS Protection** - Cross-origin resource sharing configuration
- **Rate Limiting** - Prevent abuse with rate limiting
- **Error Handling** - Comprehensive error handling and validation
- **Environment Variables** - Sensitive data protection

## 📚 Tech Stack

### Frontend
```
- React 19.2.0          - User interface library
- Vite 7.3.1            - Build tool and dev server
- Tailwind CSS 3.4.19   - Utility-first CSS framework
- React Router 7.13     - Client-side routing
- Axios 1.13.5          - HTTP client
- Framer Motion 12.34   - Animation library
- React Toastify 11.0   - Toast notifications
```

### Backend
```
- Node.js & Express 5.2.1  - Web framework
- MongoDB & Mongoose 9.2   - Database and ODM
- JWT (jsonwebtoken)       - Authentication tokens
- bcryptjs 3.0.3          - Password hashing
- Helmet 8.1              - Security headers
- CORS 2.8.6              - Cross-origin support
- Morgan 1.10             - HTTP request logger
- Rate Limiter            - Request rate limiting
- dotenv 17.3             - Environment variables
```

## 📁 Project Structure

```
E_COMMERCE_SHOP/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── context/            # React Context API
│   │   ├── hooks/              # Custom hooks
│   │   ├── utils/              # Utility functions
│   │   ├── assets/             # Images, icons, fonts
│   │   ├── App.jsx             # Main App component
│   │   └── main.jsx            # Entry point
│   ├── public/                 # Static files
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
├── server/                      # Express backend server
│   ├── config/                 # Configuration files
│   │   └── db.js              # MongoDB connection
│   ├── controllers/            # Route controllers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── adminController.js
│   │   ├── couponController.js
│   │   └── reviewController.js
│   ├── models/                # Database schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Coupon.js
│   │   └── Review.js
│   ├── routes/                # API routes
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── couponRoutes.js
│   │   └── reviewRoutes.js
│   ├── middleware/            # Custom middleware
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── services/              # Business logic services
│   ├── logs/                  # Application logs
│   ├── .env                   # Environment variables
│   ├── server.js              # Express app entry point
│   └── package.json
│
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 16+ (https://nodejs.org/)
- **npm** or **yarn** package manager
- **MongoDB** (Local or MongoDB Atlas)
- **Git** for version control

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd E_COMMERCE_SHOP
```

#### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env    # If .env.example exists, otherwise create manually

# Configure .env file with:
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Start backend server
npm run dev    # Development with nodemon
# or
npm start      # Production mode
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start frontend development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints (`/api/auth`)

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
Response: { user, token }
```

#### Get Profile
```
GET /api/auth/profile
Authorization: Bearer <token>
```

### Products Endpoints (`/api/products`)

#### Get All Products
```
GET /api/products
Query Parameters:
  - page: 1
  - limit: 10
  - category: electronics
  - minPrice: 0
  - maxPrice: 1000
  - search: laptop
```

#### Get Product by ID
```
GET /api/products/:id
```

#### Create Product (Admin)
```
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "electronics",
  "stock": 100,
  "images": ["url1", "url2"]
}
```

#### Update Product (Admin)
```
PUT /api/products/:id
Authorization: Bearer <admin_token>
```

#### Delete Product (Admin)
```
DELETE /api/products/:id
Authorization: Bearer <admin_token>
```

### Orders Endpoints (`/api/orders`)

#### Create Order
```
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    { "productId": "id", "quantity": 2 }
  ],
  "shippingAddress": { ... },
  "paymentMethod": "credit_card"
}
```

#### Get User Orders
```
GET /api/orders
Authorization: Bearer <token>
```

#### Get Order by ID
```
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Update Order Status (Admin)
```
PUT /api/orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "shipped"  # pending, shipped, delivered, cancelled
}
```

### Reviews Endpoints (`/api/reviews`)

#### Create Review
```
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "id",
  "rating": 5,
  "comment": "Great product!"
}
```

#### Get Product Reviews
```
GET /api/reviews/product/:productId
```

### Coupons Endpoints (`/api/coupons`)

#### Get Coupons
```
GET /api/coupons
```

#### Validate Coupon
```
POST /api/coupons/validate
Content-Type: application/json

{
  "code": "SAVE20",
  "cartTotal": 100
}
```

## 🔧 Environment Variables

### Backend (.env file)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Payment Gateway (Optional)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Frontend (.env file - optional)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🎨 Main Components

### Frontend Components
- **Navbar** - Navigation bar with logo, search, cart, user menu
- **Footer** - Footer with links, newsletter, social media
- **ProductCard** - Individual product display card
- **ProductGrid** - Grid layout for multiple products
- **Cart** - Shopping cart with items management
- **Checkout** - Order review and payment
- **UserProfile** - User account and preferences
- **AdminDashboard** - Admin overview and controls
- **ProductManagement** - Admin product CRUD
- **OrderManagement** - Admin order management

### Backend Controllers
- **authController** - User registration, login, profile management
- **productController** - Product CRUD operations
- **orderController** - Order creation and management
- **adminController** - Admin-specific operations
- **couponController** - Coupon validation and management
- **reviewController** - Product reviews management

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  address: String,
  phone: String,
  preferences: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  stock: Number,
  images: [String],
  rating: Number,
  reviews: [ObjectId] (ref: Review),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  userId: ObjectId (ref: User),
  items: [
    {
      productId: ObjectId,
      quantity: Number,
      price: Number
    }
  ],
  totalPrice: Number,
  discountAmount: Number,
  coupon: ObjectId (ref: Coupon),
  shippingAddress: Object,
  paymentMethod: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚢 Deployment

### Backend Deployment (Heroku/Railway/Render)

1. **Create Production .env**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your-atlas-uri>
   JWT_SECRET=<secure-random-key>
   ```

2. **Deploy**
   ```bash
   # Using Railway (recommended)
   npm install -g railway
   railway init
   railway up
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy**
   ```bash
   # Using Vercel
   npm install -g vercel
   vercel
   ```

## 🧪 Testing

### Test Backend API with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'

# Get products
curl http://localhost:5000/api/products

# Create order (with token)
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"items":[...]}'
```

## 📊 Development Workflow

### Running Both Frontend & Backend

**Terminal 1 - Backend**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

**Terminal 3 - MongoDB (if local)**
```bash
mongod
```

### Browser
```
Frontend: http://localhost:5173
Backend API: http://localhost:5000/api
```

## 🔒 Security Best Practices

```
✅ Passwords hashed with bcryptjs (10 rounds)
✅ JWT tokens for authentication (7-day expiration)
✅ CORS configured for security
✅ Helmet for security headers
✅ Rate limiting on API endpoints
✅ Input validation on all endpoints
✅ Environment variables for sensitive data
✅ Error handling without exposing sensitive info
✅ SQL injection prevention with MongoDB
✅ XSRF protection enabled
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Error
```
✓ Ensure mongod is running
✓ Check MONGODB_URI in .env
✓ For Atlas: Verify IP whitelist
✓ Check username/password credentials
```

### CORS Error
```
✓ Check CORS_ORIGIN in .env
✓ Ensure frontend URL matches
✓ Check Authorization header format
```

### Token Expired
```
✓ Clear browser localStorage
✓ Delete stored token
✓ Login again to get new token
```

## 📚 Additional Resources

### Documentation
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Vite Docs](https://vitejs.dev/)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
- [VS Code](https://code.visualstudio.com/) - Code editor

## 📋 Features Checklist

- [x] User Authentication (Register/Login)
- [x] Product Management (CRUD)
- [x] Shopping Cart
- [x] Order Processing
- [x] User Reviews
- [x] Admin Dashboard
- [x] Coupon System
- [x] Search & Filter
- [x] JWT Security
- [x] Error Handling
- [ ] Payment Integration (Stripe)
- [ ] Email Notifications
- [ ] Wishlist functionality
- [ ] Product recommendations
- [ ] Real-time notifications

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👥 Authors

- Development Team - Full-stack E-Commerce Platform

## 📞 Support

For issues and questions:
- Check existing issues on GitHub
- Create a new issue with detailed description
- Contact development team

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email notifications system
- [ ] Advanced analytics dashboard
- [ ] Inventory management system
- [ ] Recommendation engine
- [ ] Multi-language support
- [ ] AR product preview
- [ ] Subscription products
- [ ] Affiliate program

---

**Happy Shopping! 🛍️**

*Last Updated: February 2026*
