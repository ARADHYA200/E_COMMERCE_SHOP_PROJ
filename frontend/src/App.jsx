import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Checkout from "./pages/Checkout";
import LoginCustomer from "./pages/LoginCustomer";
import RegisterCustomer from "./pages/RegisterCustomer";
import ProtectedRoute from "./components/ProtectedRoute";
import OrderHistory from "./pages/OrderHistory";
import UserProfile from "./pages/UserProfile";
import Wishlist from "./pages/Wishlist";
import PasswordReset from "./pages/PasswordReset";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";
import AdminCoupons from "./pages/AdminCoupons";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-all flex flex-col">
          <Navbar />

          <main className="flex-1 container mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Routes>

              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetails />} />

              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                }
              />

              <Route path="/login" element={<LoginCustomer />} />
              <Route path="/register" element={<RegisterCustomer />} />
              <Route path="/forgot-password" element={<PasswordReset />} />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                }
              />

              {/* ADMIN ROUTES */}

              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/coupons"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminCoupons />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />

          <ToastContainer
            position="top-right"
            autoClose={2000}
            theme="colored"
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;