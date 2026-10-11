import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function ProductCard({ product, isWishlisted = false, onWishlistToggle }) {
  const [imageError, setImageError] = useState(false);
  const [isSaved, setIsSaved] = useState(isWishlisted);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [wishlistError, setWishlistError] = useState("");
  const [loadingCart, setLoadingCart] = useState(false);
  const [cartError, setCartError] = useState("");

  const navigate = useNavigate();
  const { cartItems, addToCart } = useCart();

  useEffect(() => {
    setIsSaved(isWishlisted);
  }, [isWishlisted]);

  const cartItem = cartItems?.find(
    (item) => item.product && item.product._id === product._id
  );
  const isInCart = Boolean(cartItem);
  const isOutOfStock = product.stock <= 0;
  const isMaxInCart = cartItem && cartItem.quantity >= product.stock;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loadingWishlist) return;

    setLoadingWishlist(true);
    setWishlistError("");

    try {
      if (isSaved) {
        await api.delete(`/wishlist/${product._id}`);
        setIsSaved(false);
        if (onWishlistToggle) onWishlistToggle(product._id, false);
      } else {
        await api.post(`/wishlist/${product._id}`);
        setIsSaved(true);
        if (onWishlistToggle) onWishlistToggle(product._id, true);
      }
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      if (err.response?.status === 409) {
        setIsSaved(true);
        return;
      }
      setWishlistError("Unable to save product. Please try again.");
      setTimeout(() => setWishlistError(""), 3500);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loadingCart || isOutOfStock || isMaxInCart) return;

    setLoadingCart(true);
    setCartError("");

    try {
      await addToCart(product._id);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setCartError(err.response?.data?.message || "Failed to add to cart");
      setTimeout(() => setCartError(""), 3500);
    } finally {
      setLoadingCart(false);
    }
  };

  return (
    <div className="product-card group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="relative w-full h-52 bg-gray-50 overflow-hidden flex items-center justify-center">
          {!imageError && product.image ? (
            <img
              src={product.image}
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 p-4">
              <svg
                className="w-12 h-12 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs">No image preview</span>
            </div>
          )}

          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {product.category}
          </span>

          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={loadingWishlist}
            aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
            title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-transform duration-200 hover:scale-110 active:scale-95 shadow-sm ${
              isSaved
                ? "bg-pink-50 text-pink-600 hover:bg-pink-100"
                : "bg-white/85 text-gray-400 hover:text-pink-600 hover:bg-white"
            }`}
          >
            <svg
              className={`w-4 h-4 ${isSaved ? "fill-current text-pink-600" : "fill-none stroke-current"}`}
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        <div className="p-5">
          <h2
            className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1"
            title={product.name}
          >
            {product.name}
          </h2>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Price</p>
              <p className="text-xl font-black text-indigo-600">
                ₹{product.price}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium mb-1">Status</p>
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  In Stock ({product.stock})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  Out of Stock
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-0 space-y-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={loadingCart || isOutOfStock || isMaxInCart}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm ${
            isOutOfStock
              ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
              : isMaxInCart
              ? "bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed"
              : loadingCart
              ? "bg-indigo-500 text-white cursor-wait"
              : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white hover:shadow"
          }`}
        >
          {loadingCart ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Adding...</span>
            </>
          ) : isOutOfStock ? (
            <span>Out of Stock</span>
          ) : isMaxInCart ? (
            <span>Max in Cart ({cartItem.quantity})</span>
          ) : isInCart ? (
            <span>Add Another</span>
          ) : (
            <span>Add to Cart</span>
          )}
        </button>

        {cartError && (
          <p className="text-xs text-red-600 text-center font-medium">
            {cartError}
          </p>
        )}

        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={loadingWishlist}
          className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition border flex items-center justify-center gap-1.5 ${
            loadingWishlist
              ? "bg-gray-100 text-gray-500 border-gray-200 cursor-wait"
              : isSaved
              ? "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100"
              : "bg-white text-gray-700 border-gray-300 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50/50"
          }`}
        >
          {loadingWishlist ? (
            <span>Saving...</span>
          ) : isSaved ? (
            <>
              <span className="text-pink-600">♥</span>
              <span>Added to Wishlist</span>
            </>
          ) : (
            <>
              <span>♡</span>
              <span>Add to Wishlist</span>
            </>
          )}
        </button>

        {wishlistError && (
          <p className="text-xs text-red-600 text-center font-medium">
            {wishlistError}
          </p>
        )}

        <Link
          to={`/products/${product._id}`}
          className="block w-full text-center py-2 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;