import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [brokenImages, setBrokenImages] = useState(new Set());
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");
      setActionError("");

      const response = await api.get("/wishlist");
      if (response.data && Array.isArray(response.data.wishlist)) {
        setWishlist(response.data.wishlist);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error("Fetch wishlist error:", err);
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError(
        err.response?.data?.message || "We couldn't load your wishlist."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    if (removingId) return;

    setRemovingId(productId);
    setActionError("");

    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error("Remove from wishlist error:", err);
      setActionError("Failed to remove product from wishlist. Please try again.");
      setTimeout(() => setActionError(""), 3500);
    } finally {
      setRemovingId(null);
    }
  };

  const handleImageError = (productId) => {
    setBrokenImages((prev) => new Set(prev).add(productId));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <span>My Wishlist</span>
              <span className="text-pink-500 text-2xl">❤️</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Your saved items and favorite products
            </p>
          </div>

          {!loading && !error && wishlist.length > 0 && (
            <span className="text-sm font-semibold text-gray-700 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm self-start sm:self-auto">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
            </span>
          )}
        </div>

        {actionError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{actionError}</span>
            <button
              onClick={() => setActionError("")}
              className="text-red-500 hover:text-red-700 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-lg font-semibold text-gray-800">
              Loading your wishlist...
            </h2>
            <p className="text-sm text-gray-500 mt-1">Fetching your saved products</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl border border-red-200 p-10 text-center max-w-md mx-auto shadow-sm my-8">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Something went wrong.
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              We couldn't load your wishlist.
            </p>
            <button
              onClick={fetchWishlist}
              className="inline-flex items-center px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
            >
              Try Again
            </button>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="w-20 h-20 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">❤️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your wishlist is empty ❤️
            </h2>
            <p className="text-gray-500 text-sm sm:text-base mb-8 max-w-sm mx-auto">
              Save products you love and find them here later.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
            >
              <span>Browse Products</span>
              <span>→</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => {
              const isBroken = brokenImages.has(product._id);
              const isRemoving = removingId === product._id;

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative w-full h-52 bg-gray-50 overflow-hidden flex items-center justify-center">
                      {!isBroken && product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          onError={() => handleImageError(product._id)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 p-4">
                          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs">No image preview</span>
                        </div>
                      )}

                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                        {product.category}
                      </span>
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
                    <Link
                      to={`/products/${product._id}`}
                      className="block w-full text-center py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition shadow-sm hover:shadow"
                    >
                      View Details
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleRemove(product._id)}
                      disabled={isRemoving}
                      className="w-full py-2 px-3 rounded-xl text-xs font-semibold transition border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isRemoving ? (
                        <span>Removing...</span>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Remove from Wishlist</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Wishlist;
