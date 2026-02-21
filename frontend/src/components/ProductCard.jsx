import Card from "./ui/Card";
import Button from "./ui/Button";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 h-full flex flex-col">

      <img
        src={product.image}
        alt={product.name}
        className="h-40 sm:h-48 w-full object-cover rounded-lg mb-3 sm:mb-4"
      />

      <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 line-clamp-2">
        {product.name}
      </h3>

      <p className="text-primary text-lg sm:text-xl font-bold mb-4">
        ₹{product.price}
      </p>

      <Button
        variant="primary"
        className="w-full mt-auto text-sm sm:text-base"
        onClick={() => addToCart(product)}
      >
        Add to Cart
      </Button>

    </Card>
  );
};

export default ProductCard;