import Card from "./ui/Card";
import Button from "./ui/Button";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  return (
      <Card className="group bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col p-4">

    <div className="relative w-full h-56 overflow-hidden rounded-xl mb-4">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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