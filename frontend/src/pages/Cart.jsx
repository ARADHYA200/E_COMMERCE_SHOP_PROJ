import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import Button from "../components/ui/Button";

const Cart = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    totalPrice,
  } = useContext(CartContext);

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12 sm:py-20 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">
          Your Cart is Empty
        </h1>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6">

      <h1 className="text-2xl sm:text-3xl font-bold">
        Your Cart
      </h1>

      {cartItems.map((item) => (
        <div
          key={item._id}   
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center 
          gap-4 sm:gap-6 bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-md"
        >
          <div className="flex items-center gap-3 sm:gap-6 flex-1">
            <img
              src={item.image}
              alt={item.name}
              className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded flex-shrink-0"
            />
            <div className="min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                {item.name}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                ₹{item.price}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">

            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) =>
                updateQuantity(item._id, Number(e.target.value))
              }
              className="w-16 sm:w-20 px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base border rounded-lg 
              dark:bg-gray-800 dark:border-gray-700"
            />

            <Button
              variant="danger"
              onClick={() => removeFromCart(item._id)}
              className="text-xs sm:text-sm px-3 sm:px-4"
            >
              Remove
            </Button>

          </div>
        </div>
      ))}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center 
      gap-4 sm:gap-6 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">

        <div className="text-xl sm:text-2xl font-bold">
          Total: ₹{totalPrice}
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/checkout")}
          className="w-full sm:w-auto"
        >
          Proceed to Checkout
        </Button>

      </div>

    </div>
  );
};

export default Cart;