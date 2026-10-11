import { useEffect, useState, useCallback, useRef } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import Navbar from "../components/Navbar";

function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState("");

    const loadingRef = useRef(true);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [category, setCategory] = useState("");
    const [wishlistIds, setWishlistIds] = useState(new Set());

    const fetchUserWishlist = useCallback(async () => {
        try {
            const res = await api.get("/wishlist");
            if (res.data && Array.isArray(res.data.wishlist)) {
                setWishlistIds(new Set(res.data.wishlist.map((item) => item._id)));
            }
        } catch {
            setWishlistIds(new Set());
        }
    }, []);

    useEffect(() => {
        fetchUserWishlist();
        window.addEventListener("wishlistUpdated", fetchUserWishlist);
        return () => window.removeEventListener("wishlistUpdated", fetchUserWishlist);
    }, [fetchUserWishlist]);

    const handleWishlistToggle = (productId, isSaved) => {
        setWishlistIds((prev) => {
            const next = new Set(prev);
            if (isSaved) {
                next.add(productId);
            } else {
                next.delete(productId);
            }
            return next;
        });
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await api.get("/products");
                if (response.data && Array.isArray(response.data.products)) {
                    const unique = [
                        ...new Set(
                            response.data.products
                                .map((p) => p.category)
                                .filter(Boolean)
                        )
                    ];
                    setCategories(unique);
                }
            } catch (err) {
                console.error("Failed to load categories:", err);
            }
        };

        loadCategories();
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            if (!loadingRef.current) {
                setIsSearching(true);
            }
            setError("");

            const params = {};
            if (debouncedSearch.trim()) {
                params.search = debouncedSearch.trim();
            }
            if (category.trim()) {
                params.category = category.trim();
            }

            const response = await api.get("/products", { params });
            const fetched = response.data?.products || [];
            setProducts(fetched);

            if (categories.length === 0 && fetched.length > 0 && !debouncedSearch && !category) {
                const unique = [...new Set(fetched.map((p) => p.category).filter(Boolean))];
                setCategories(unique);
            }
        } catch (err) {
            console.error("Fetch products error:", err);
            setError(
                err.response?.data?.message || "Failed to load products. Please check your connection."
            );
        } finally {
            loadingRef.current = false;
            setLoading(false);
            setIsSearching(false);
        }
    }, [debouncedSearch, category, categories.length]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleClearFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setCategory("");
    };

    const hasActiveFilters = Boolean(search || category);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Product Catalog
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Explore our latest collection of premium products
                        </p>
                    </div>

                    {!loading && !error && (
                        <span className="text-xs sm:text-sm font-medium text-gray-500 bg-white px-3.5 py-1.5 rounded-full border border-gray-200 self-start sm:self-auto shadow-sm">
                            {products.length} {products.length === 1 ? "product" : "products"} found
                        </span>
                    )}
                </div>

                <SearchBar
                    search={search}
                    setSearch={setSearch}
                    category={category}
                    setCategory={setCategory}
                    categories={categories}
                    onClear={handleClearFilters}
                />

                {isSearching && (
                    <div className="flex items-center gap-2 mb-4 text-indigo-600 text-sm font-medium animate-pulse">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Searching...
                    </div>
                )}

                {loading ? (
                    <div className="products-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl border border-gray-200 p-4 h-80 animate-pulse flex flex-col justify-between"
                            >
                                <div className="w-full h-44 bg-gray-200 rounded-xl mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-lg mx-auto shadow-sm">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">{error}</h2>
                        <p className="text-gray-500 text-sm mb-5">Something went wrong while fetching products.</p>
                        <button
                            onClick={fetchProducts}
                            className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md mx-auto shadow-sm">
                        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                            {hasActiveFilters ? "No products found" : "No products available"}
                        </h2>
                        <p className="text-gray-500 text-sm mb-6">
                            {hasActiveFilters
                                ? "No products match your current search or category filter. Try clearing them to see all products."
                                : "Check back soon for new inventory."}
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={handleClearFilters}
                                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="relative">
                        {isSearching && (
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 rounded-2xl flex items-start justify-center pt-20 transition-opacity">
                                <span className="bg-white/90 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full shadow-md border border-gray-100 animate-pulse">
                                    Updating...
                                </span>
                            </div>
                        )}
                        <div className="products-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    isWishlisted={wishlistIds.has(product._id)}
                                    onWishlistToggle={handleWishlistToggle}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Products;