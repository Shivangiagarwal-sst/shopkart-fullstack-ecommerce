import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { user, authLoading } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchCart = useCallback(async () => {
        if (!user) {
            setCartItems([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await api.get("/cart");
            if (response.data && Array.isArray(response.data.cart)) {
                setCartItems(response.data.cart);
            } else {
                setCartItems([]);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load your cart.");
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (authLoading) return;

        if (user) {
            fetchCart();
        } else {
            setCartItems([]);
            setLoading(false);
            setError("");
        }
    }, [user, authLoading, fetchCart]);

    const addToCart = useCallback(async (productId) => {
        const response = await api.post(`/cart/${productId}`);
        if (response.data && Array.isArray(response.data.cart)) {
            setCartItems(response.data.cart);
        } else {
            await fetchCart();
        }
        return response.data;
    }, [fetchCart]);

    const updateCartQuantity = useCallback(async (productId, quantity) => {
        const response = await api.patch(`/cart/${productId}`, { quantity });
        if (response.data && Array.isArray(response.data.cart)) {
            setCartItems(response.data.cart);
        } else {
            await fetchCart();
        }
        return response.data;
    }, [fetchCart]);

    const removeFromCart = useCallback(async (productId) => {
        const response = await api.delete(`/cart/${productId}`);
        if (response.data && Array.isArray(response.data.cart)) {
            setCartItems(response.data.cart);
        } else {
            await fetchCart();
        }
        return response.data;
    }, [fetchCart]);

    const totalQuantity = useMemo(() => {
        return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
    }, [cartItems]);

    const subtotal = useMemo(() => {
        return cartItems.reduce(
            (total, item) => total + (item.product?.price || 0) * (item.quantity || 0),
            0
        );
    }, [cartItems]);

    const value = useMemo(
        () => ({
            cartItems,
            loading,
            error,
            fetchCart,
            addToCart,
            updateCartQuantity,
            removeFromCart,
            totalQuantity,
            cartCount: totalQuantity,
            subtotal
        }),
        [
            cartItems,
            loading,
            error,
            fetchCart,
            addToCart,
            updateCartQuantity,
            removeFromCart,
            totalQuantity,
            subtotal
        ]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
