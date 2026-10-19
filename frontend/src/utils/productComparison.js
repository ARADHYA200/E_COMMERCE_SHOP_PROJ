
const STORAGE_KEY = "ecommerceCompareProducts";
const MAX_PRODUCTS = 4;

export const getCompareProducts = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const addCompareProduct = (product) => {
  const products = getCompareProducts();

  if (products.some((item) => item._id === product._id)) {
    return { success: false, message: "Product is already selected." };
  }

  if (products.length >= MAX_PRODUCTS) {
    return {
      success: false,
      message: "You can select a maximum of 4 products.",
    };
  }

  products.push(product);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

  return { success: true };
};

export const removeCompareProduct = (productId) => {
  const products = getCompareProducts().filter(
    (product) => product._id !== productId
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

export const clearCompareProducts = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const saveCompareProducts = (products) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
};

export const MAX_COMPARE_PRODUCTS = MAX_PRODUCTS;
