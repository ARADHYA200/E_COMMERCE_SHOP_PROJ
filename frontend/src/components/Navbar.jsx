import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import Button from "./ui/Button";

const Navbar = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { cartItems } = useContext(CartContext);
  const { wishlistItems } = useContext(WishlistContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const isAdmin = Boolean(user?.isAdmin === true || user?.role === "admin");
  const isCustomer = Boolean(user && !isAdmin);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-all">

      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-lg sm:text-2xl font-bold text-primary">
          ECOMMERCE
        </Link>

        {/* Mobile Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex flex-col gap-1"
        >
          <span className="w-6 h-0.5 bg-gray-700 dark:bg-gray-300"></span>
          <span className="w-6 h-0.5 bg-gray-700 dark:bg-gray-300"></span>
          <span className="w-6 h-0.5 bg-gray-700 dark:bg-gray-300"></span>
        </button>

        {/* ================= DESKTOP MENU ================= */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">

          <Link to="/" className="nav-link">Home</Link>
          <Link to="/products" className="nav-link">Products</Link>

          {/* ===== ADMIN LINKS FIRST ===== */}
          {isAdmin && (
            <>
              <Link to="/admin" className="nav-link">
                Admin
              </Link>
              <Link to="/admin/users" className="nav-link">
                Customer Info
              </Link>
            </>
          )}

          {/* ===== CUSTOMER LINKS ===== */}
          {isCustomer && (
            <>

              <Link to="/wishlist" className="relative nav-icon" title="Wishlist">
                ❤️
                {wishlistItems?.length > 0 && (
                  <span className="badge">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="relative nav-icon" title="Cart">
                🛒
                {cartItems?.length > 0 && (
                  <span className="badge">
                    {cartItems.length}
                  </span>
                )}
              </Link>

              <Link to="/orders" className="nav-link">
                My Orders
              </Link>
            </>
          )}

         {/* User Section */}
        {user ? (
          <div className="relative">
            {/* Profile Icon */}
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-primary transition text-lg"
            >
              👤
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-3 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 z-50">

                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  Personal Info
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  Logout
                </button>

              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="text-gray-700 dark:text-gray-300 hover:text-primary transition text-sm lg:text-base"
          >
            Login
          </Link>
        )}

          {/* Theme */}
          <Button onClick={toggleTheme} variant="secondary" className="text-sm px-3 py-2">
            {darkMode ? "☀️" : "🌙"}
          </Button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-3 flex flex-col">

            <Link to="/" onClick={closeMobileMenu} className="mobile-link">
              Home
            </Link>

            <Link to="/products" onClick={closeMobileMenu} className="mobile-link">
              Products
            </Link>

            {/* ADMIN FIRST */}
            {isAdmin && (
              <>
                <Link to="/admin" onClick={closeMobileMenu} className="mobile-link">
                  Admin
                </Link>

                <Link to="/admin/users" onClick={closeMobileMenu} className="mobile-link">
                  Customer Info
                </Link>
              </>
            )}

            {/* CUSTOMER */}
            {isCustomer && (
              <>
                <Link to="/wishlist" onClick={closeMobileMenu} className="mobile-link">
                  ❤️ Wishlist ({wishlistItems?.length || 0})
                </Link>

                <Link to="/cart" onClick={closeMobileMenu} className="mobile-link">
                  🛒 Cart ({cartItems?.length || 0})
                </Link>

                <Link to="/orders" onClick={closeMobileMenu} className="mobile-link">
                  My Orders
                </Link>
              </>
            )}

            {user ? (
              <>
                <Link to="/profile" onClick={closeMobileMenu} className="mobile-link">
                  My Profile
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="mobile-link text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMobileMenu} className="mobile-link">
                  Login
                </Link>

                <Link to="/register" onClick={closeMobileMenu} className="mobile-link">
                  Register
                </Link>
              </>
            )}

            <button
              onClick={() => {
                toggleTheme();
                closeMobileMenu();
              }}
              className="mobile-link text-left"
            >
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

          </div>
        </div>
      )}

    </nav>
  );
};

export default Navbar;