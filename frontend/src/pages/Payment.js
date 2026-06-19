import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAddress } from "../context/AddressContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import API from "../api";

const Payment = () => {
    const navigate = useNavigate();
    const { pubaddress, editing } = useAddress();
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState("");
    const [error, setError] = useState("");

    const tax = +(cartTotal * 0.08).toFixed(2);
    const shipping = cartTotal > 50 ? 0 : 5.99;
    const total = +(cartTotal + tax + shipping).toFixed(2);

    useEffect(() => {
        if (!pubaddress) {
            navigate("/add-address");
        }
        if (!cart || cart.length === 0) {
            navigate("/cart");
        }
    }, []);

    // Build order payload that matches backend Order model
    const buildOrderPayload = (paymentMethod, paymentDetails = {}) => {
        return {
            items: cart.map((item) => ({
                product: item._id,
                quantity: item.quantity,
            })),
            shippingAddress: {
                street: `${pubaddress?.buildingname || ""}, ${pubaddress?.areaname || ""}`,
                city: pubaddress?.city || "",
                state: pubaddress?.state || "",
                zip: pubaddress?.pincode || "",
                country: "India",
            },
            paymentMethod,
            ...paymentDetails,
        };
    };

    // ── COD Order ──
    const handleCOD = async () => {
        setLoading("cod");
        setError("");
        try {
            const payload = buifdOrderPayload("cod");
            const { data } = await API.post("/orders", payload);
            if (data.success) {
                clearCart();
                navigate("/", { state: { orderMsg: "Your order has been placed successfully! Payment will be collected on delivery." } });
            } else {
                setError(data.message || "Failed to place order");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        }
        setLoading("");
    };

    // ── Razorpay Online Payment ──
    // const handlePayNow = async () => {
    //     setLoading("online");
    //     setError("");
    //     try {
    //         // Step 1: Create Razorpay order on backend
    //         const { data } = await API.post("/orders/create-razorpay-order", { amount: total });
    //         if (!data.success) {
    //             setError("Failed to create payment order");
    //             setLoading("");
    //             return;
    //         }

    //         // Step 2: Open Razorpay checkout
    //         const options = {
    //             key: data.key,
    //             amount: data.order.amount,
    //             currency: data.order.currency,
    //             name: "MarketVerse",
    //             description: `Order - ${cart.length} item(s)`,
    //             order_id: data.order.id,
    //             handler: async (response) => {
    //                 try {
    //                     // Step 3: Verify payment
    //                     const verifyRes = await API.post("/orders/verify-payment", {
    //                         razorpay_order_id: response.razorpay_order_id,
    //                         razorpay_payment_id: response.razorpay_payment_id,
    //                         razorpay_signature: response.razorpay_signature,
    //                     });

    //                     if (verifyRes.data.success) {
    //                         // Step 4: Create the order
    //                         const orderPayload = buildOrderPayload("razorpay", {
    //                             razorpayOrderId: response.razorpay_order_id,
    //                             razorpayPaymentId: response.razorpay_payment_id,
    //                             razorpaySignature: response.razorpay_signature,
    //                         });
    //                         const orderRes = await API.post("/orders", orderPayload);

    //                         if (orderRes.data.success) {
    //                             clearCart();
    //                             navigate("/", { state: { orderMsg: "Payment successful! Your order has been placed." } });
    //                         } else {
    //                             setError("Payment done but order creation failed. Contact support.");
    //                         }
    //                     } else {
    //                         setError("Payment verification failed. If money was deducted, contact support.");
    //                     }
    //                 } catch (err) {
    //                     setError("Error processing payment. Please contact support.");
    //                 }
    //                 setLoading("");
    //             },
    //             prefill: {
    //                 name: user?.name || "",
    //                 email: user?.email || "",
    //                 contact: user?.phone || "",
    //             },
    //             theme: { color: "#111" },
    //             modal: {
    //                 ondismiss: () => setLoading(""),
    //             },
    //         };

    //         const rzp = new window.Razorpay(options);
    //         rzp.on("payment.failed", (response) => {
    //             setError(`Payment failed: ${response.error.description}`);
    //             setLoading("");
    //         });
    //         rzp.open();

    //     } catch (err) {
    //         setError(err.response?.data?.message || "Failed to initiate payment");
    //         setLoading("");
    //     }
    // };

    if (!pubaddress || !cart || cart.length === 0) return null;

    return (
        <div className="checkout-page container">
            <h1>Choose <span className="highlight">Payment</span></h1>

            {error && (
                <div style={{
                    background: "rgba(231,76,60,0.1)",
                    color: "#e74c3c",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    fontWeight: 600,
                }}>
                    {error}
                </div>
            )}

            <div className="row">
                {/* Order Summary */}
                <div className="col-7">
                    <div className="cart-summary">
                        <h3>Order Summary</h3>
                        {cart.map((item) => (
                            <div className="summary-row" key={item._id}>
                                <span>{item.name} x {item.quantity}</span>
                                <span>{(item.price * item.quantity).toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
                            </div>
                        ))}
                        <hr />
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{cartTotal.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax (8%)</span>
                            <span>{tax.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>{shipping === 0 ? "Free" : shipping.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
                        </div>
                        <hr />
                        <div className="summary-row">
                            <h3>Total</h3>
                            <h3>{total.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</h3>
                        </div>
                    </div>
                </div>

                {/* Delivery & Payment */}
                <div className="col">
                    <div className="cart-summary">
                        <h3>Delivery Address</h3>
                        <p style={{ margin: "0.5rem 0", lineHeight: 1.6 }}>
                            {pubaddress.buildingname}, {pubaddress.areaname}<br />
                            {pubaddress.city} {pubaddress.state} - {pubaddress.pincode}
                        </p>
                        <button className="btn btn-secondary" style={{ marginTop: "0.5rem" }} onClick={() => navigate("/add-address")}>
                            Change Address
                        </button>

                        <hr />
                        <h3>Payment Method</h3>

                        <button
                            className="btn btn-primary btn-lg btn-block"
                            style={{ width: "100%", marginTop: "1rem" }}
                            onClick={handleCOD}
                            disabled={!!loading}
                        >
                            {loading === "cod" ? "Placing Order..." : "Cash on Delivery (COD)"}
                        </button>

                        <button
                            className="btn btn-lg btn-block"
                            style={{
                                width: "100%",
                                marginTop: "0.75rem",
                                background: "#2563eb",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                padding: "0.75rem",
                                fontWeight: 600,
                                cursor: loading ? "not-allowed" : "pointer",
                            }}
                            onClick={handlePayNow}
                            disabled={!!loading}
                        >
                            {loading === "online" ? "Processing..." : `Pay Now - ${total.toLocaleString("en-IN", { style: "currency", currency: "INR" })}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
