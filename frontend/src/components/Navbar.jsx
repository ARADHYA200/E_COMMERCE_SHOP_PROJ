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

  // Read user synchronously from localStorage.
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Determine if current user is admin.
  const isAdmin = Boolean(user?.isAdmin === true || user?.role === "admin");

  // Cart should be visible only for logged-in non-admin customers
  const showCart = Boolean(user && !isAdmin);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md transition-all sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-lg sm:text-2xl font-bold text-primary shrink-0">
          ECOMMERCE
        </Link>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex flex-col gap-1"
        >
          <span className="w-6 h-0.5 bg-gray-700 dark:bg-gray-300"></span>
          <span className="w-6 h-0.5 bg-gray-700 dark:bg-gray-300"></span>
          <span className="w-6 h-0.5 bg-gray-700 dark:bg-gray-300"></span>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">

          <Link
            to="/"
            className="text-gray-700 dark:text-gray-300 hover:text-primary transition text-sm lg:text-base"
          >
            Home
          </Link>

          <Link
            to="/products"
            className="text-gray-700 dark:text-gray-300 hover:text-primary transition text-sm lg:text-base"
          >
            Products
          </Link>

          {/* Wishlist - visible to logged-in customers */}
          {showCart && (
            <Link
              to="/wishlist"
              className="relative text-gray-700 dark:text-gray-300 hover:text-primary transition text-lg"
              title="Wishlist"
            >
              ❤️
              {wishlistItems?.length > 0 && (
                <span className="absolute -top-2 -right-3 bg-danger text-white text-xs px-2 py-0.5 rounded-full">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
          )}
          
          {/* Cart - only visible to logged-in customers (non-admins) */}
          {showCart && (
            <Link
              to="/cart"
              className="relative text-gray-700 dark:text-gray-300 hover:text-primary transition text-lg"
              title="Shopping Cart"
            >
              🛒
              {cartItems?.length > 0 && (
                <span className="absolute -top-2 -right-3 bg-danger text-white text-xs px-2 py-0.5 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </Link>
          )}
          {/* My Orders - visible to logged-in customers (non-admins) */}
            {showCart && (
              <Link
                to="/orders"
                className="text-gray-700 dark:text-gray-300 hover:text-primary transition text-sm lg:text-base"
              >
                My Orders
              </Link>
            )}


          {isAdmin && (
            <Link
              to="/admin"
              className="text-gray-700 dark:text-gray-300 hover:text-primary transition text-sm lg:text-base"
            >
              Admin
            </Link>
          )}

          {/* User Section */}
          {user ? (
            <div className="flex items-center gap-2 lg:gap-4">
              <Link
                to="/profile"
                className="text-gray-700 dark:text-gray-300 hover:text-primary transition text-sm"
              >
                👤
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 dark:text-gray-300 hover:text-danger transition text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 lg:gap-4">
              <Link
                to="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-primary transition text-sm"
              >
                Login
              </Link>
            </div>
          )}

          {/* Theme Toggle */}
          <Button onClick={toggleTheme} variant="secondary" className="text-sm px-3 py-2">
            {darkMode ? "☀️" : "🌙"}
          </Button>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-4 space-y-3 flex flex-col">

            <Link
              to="/"
              onClick={closeMobileMenu}
              className="text-gray-700 dark:text-gray-300 hover:text-primary transition py-2"
            >
              Home
            </Link>

            <Link
              to="/products"
              onClick={closeMobileMenu}
              className="text-gray-700 dark:text-gray-300 hover:text-primary transition py-2"
            >
              Products
            </Link>

            {showCart && (
              <>
                <Link
                  to="/wishlist"
                  onClick={closeMobileMenu}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary transition py-2"
                >
                  ❤️ Wishlist ({wishlistItems?.length || 0})
                </Link>

                <Link
                  to="/cart"
                  onClick={closeMobileMenu}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary transition py-2"
                >
                  🛒 Cart ({cartItems?.length || 0})
                </Link>
              </>
            )}

            {user && (
              <Link
                to="/orders"
                onClick={closeMobileMenu}
                className="text-gray-700 dark:text-gray-300 hover:text-primary transition py-2"
              >
                My Orders
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={closeMobileMenu}
                className="text-gray-700 dark:text-gray-300 hover:text-primary transition py-2"
              >
                Admin
              </Link>
            )}

            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary transition py-2"
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="text-gray-700 dark:text-gray-300 hover:text-danger transition py-2 text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary transition py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary transition py-2"
                >
                  Register
                </Link>
              </>
            )}

            <button
              onClick={() => {
                toggleTheme();
                closeMobileMenu();
              }}
              className="text-gray-700 dark:text-gray-300 hover:text-primary transition py-2 text-left w-full"
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