import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { cartItems, addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [imageError, setImageError] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartSuccess, setCartSuccess] = useState(false);
    const [cartError, setCartError] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");
                setImageError(false);

                const response = await api.get(`/products/${id}`);
                setProduct(response.data.product);
            } catch (err) {
                console.error("Fetch product details error:", err);
                setError(
                    err.response?.data?.message ||
                    "Failed to load product details"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const cartItem = cartItems?.find(
        (item) => item.product && item.product._id === product?._id
    );
    const isOutOfStock = product?.stock <= 0;
    const isMaxInCart = cartItem && cartItem.quantity >= product?.stock;

    const handleAddToCart = async () => {
        if (!product || isOutOfStock || isMaxInCart || addingToCart) return;

        setAddingToCart(true);
        setCartError("");

        try {
            await addToCart(product._id);
            setCartSuccess(true);
            setTimeout(() => {
                setCartSuccess(false);
            }, 2500);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }
            setCartError(err.response?.data?.message || "Failed to add to cart");
            setTimeout(() => setCartError(""), 3500);
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="max-w-5xl mx-auto px-4 py-16 flex-1 w-full flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="text-lg font-semibold text-gray-700">Loading product details...</h2>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="max-w-lg mx-auto px-4 py-16 flex-1 w-full flex items-center justify-center">
                    <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 text-center shadow-sm w-full">
                        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            {error || "Product not found"}
                        </h2>
                        <p className="text-gray-500 text-sm mb-6">
                            The requested product may not exist or an invalid ID was provided.
                        </p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
                        >
                            ← Back to Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
                <div className="mb-6">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Products
                    </Link>
                </div>

                <div className="product-details bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                        <div className="relative rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center p-6 min-h-[320px] sm:min-h-[420px]">
                            {!imageError && product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    onError={() => setImageError(true)}
                                    className="max-h-96 w-full object-contain hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                    <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1.5"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium">Image preview unavailable</span>
                                </div>
                            )}

                            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm md:hidden">
                                {product.category}
                            </span>
                        </div>

                        <div className="flex flex-col justify-between h-full">
                            <div>
                                <span className="hidden md:inline-block bg-indigo-50 text-indigo-700 font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                                    {product.category}
                                </span>

                                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-4">
                                    {product.name}
                                </h1>

                                <div className="flex items-baseline gap-3 mb-6">
                                    <span className="text-3xl sm:text-4xl font-black text-indigo-600">
                                        ₹{product.price}
                                    </span>
                                </div>

                                <div className="mb-6">
                                    {product.stock > 0 ? (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            In Stock ({product.stock} units available)
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-red-50 text-red-700 border border-red-200">
                                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                            Out of Stock
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-b border-gray-100 py-6 mb-8">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        Description
                                    </h3>
                                    <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                                        {product.description}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        disabled={isOutOfStock || isMaxInCart || addingToCart}
                                        className={`py-3.5 px-8 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm ${
                                            isOutOfStock
                                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                : isMaxInCart
                                                ? "bg-amber-100 text-amber-800 cursor-not-allowed"
                                                : addingToCart
                                                ? "bg-indigo-400 text-white cursor-wait"
                                                : cartSuccess
                                                ? "bg-emerald-600 text-white shadow-emerald-200"
                                                : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-200 hover:shadow-md"
                                        }`}
                                    >
                                        {addingToCart ? (
                                            <>
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                Adding to Cart...
                                            </>
                                        ) : isOutOfStock ? (
                                            "Out of Stock"
                                        ) : isMaxInCart ? (
                                            `Max in Cart (${cartItem.quantity})`
                                        ) : cartSuccess ? (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Added to Cart!
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Add to Cart
                                            </>
                                        )}
                                    </button>
                                </div>

                                {cartError && (
                                    <p className="text-xs text-red-600 font-medium">
                                        {cartError}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ProductDetails;