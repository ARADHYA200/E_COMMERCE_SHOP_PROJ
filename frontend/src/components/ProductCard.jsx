import Card from "./ui/Card";
import Button from "./ui/Button";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  return (
      <Card className="group bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col p-4">

    <div className="w-full h-56 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
      <img
        src={product.image}
        alt={product.name}
        className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
      />
    </div>

    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
      {product.name}
    </h3>

    <p className="text-indigo-600 text-xl font-bold mb-4">
      ₹{product.price}
    </p>

    <Button
      variant="primary"
      className="w-full mt-auto"
      onClick={() => addToCart(product)}
    >
      Add to Cart
    </Button>

  </Card>
  );
};

export default ProductCard;