import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function OrderSuccess() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                if (data.success) {
                    setOrder(data.order);
                } else {
                    setError(data.message || "Order not found");
                }
            } catch (err) {
                if (err.response?.status === 403 || err.response?.status === 404) {
                    navigate("/orders", { replace: true });
                } else {
                    setError(err.response?.data?.message || "Failed to load order details");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 text-sm">Loading order details...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-3xl border border-red-200 p-10 text-center shadow-sm">
                        <p className="text-red-600 font-semibold mb-4">{error}</p>
                        <Link to="/orders" className="text-indigo-600 font-semibold text-sm hover:underline">View My Orders</Link>
                    </div>
                ) : order && (
                    <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                                ✓
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Placed Successfully!</h1>
                            <p className="text-gray-500 text-sm">Thank you for shopping with ShopKart. Your order has been confirmed.</p>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-5 mb-6 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-medium">Order ID</span>
                                <span className="text-gray-800 font-mono text-xs">{order._id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-medium">Date</span>
                                <span className="text-gray-800">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-medium">Status</span>
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">{order.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-medium">Payment</span>
                                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">{order.paymentStatus}</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-gray-200">
                                <span className="text-base font-bold text-gray-900">Total</span>
                                <span className="text-xl font-black text-indigo-600">₹{order.totalAmount}</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                to="/orders"
                                className="flex-1 text-center py-3 px-6 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition shadow-md"
                            >
                                View My Orders
                            </Link>
                            <Link
                                to="/products"
                                className="flex-1 text-center py-3 px-6 rounded-xl border border-indigo-600 text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default OrderSuccess;
