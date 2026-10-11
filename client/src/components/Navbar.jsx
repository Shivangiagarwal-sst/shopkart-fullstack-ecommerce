import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const [wishlistCount, setWishlistCount] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { totalQuantity } = useCart();

  const fetchWishlistCount = async () => {
    try {
      const response = await api.get("/wishlist");
      if (response.data && typeof response.data.count === "number") {
        setWishlistCount(response.data.count);
      }
    } catch {
      setWishlistCount(null);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlistCount();
    } else {
      setWishlistCount(null);
    }

    const handleUpdate = () => {
      if (user) fetchWishlistCount();
    };

    window.addEventListener("wishlistUpdated", handleUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleUpdate);
  }, [user]);

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");
    } catch (error) {
      console.log(error);
    } finally {
      logout();
      navigate("/login");
    }
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <Link
          to="/products"
          className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition tracking-tight"
        >
          ShopKart
        </Link>

        {user && (
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/home"
              className="text-gray-700 hover:text-indigo-600 font-medium transition text-sm sm:text-base"
            >
              Home
            </Link>

            <Link
              to="/products"
              className="text-gray-700 hover:text-indigo-600 font-medium transition text-sm sm:text-base"
            >
              Products
            </Link>

            <Link
              to="/wishlist"
              className="text-gray-700 hover:text-indigo-600 font-medium transition text-sm sm:text-base flex items-center gap-1.5"
            >
              <span>Wishlist</span>
              {wishlistCount !== null && wishlistCount > 0 && (
                <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="text-gray-700 hover:text-indigo-600 font-medium transition text-sm sm:text-base flex items-center gap-1.5"
            >
              <span>Cart ({totalQuantity})</span>
            </Link>

            <Link
              to="/orders"
              className="text-gray-700 hover:text-indigo-600 font-medium transition text-sm sm:text-base flex items-center gap-1.5"
            >
              My Orders
            </Link>
          </div>
        )}
      </div>

      {user ? (
        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
        >
          Logout
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;