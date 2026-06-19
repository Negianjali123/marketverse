import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import API from "../api"
import { useCart } from "../context/CartContext"
import { useAddress } from "../context/AddressContext";

const Checkout = () => {

    const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, updateImage } = useCart();
    const { pubaddress, editing ,userid} = useAddress();
    const navigate = useNavigate();

    const [loading, setLoading] = useState("");
    const [error, setError] = useState("");
    const images = cart.map((item) => ({ image: item.image, _id: item._id }));
    const discount = cart.comparePrice
        ? Math.round(((cart.comparePrice - cart.price) / cart.comparePrice) * 100)
        : 0;
    const tax = +(cartTotal * 0.08).toFixed(2);
    const shipping = cartTotal > 50 ? 0 : 5.99;
    const total = +(cartTotal + tax + shipping).toFixed(2);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await API.post(`/products/cartImage`, images)
                if (data.Product) {
                    updateImage(data.Product)
                }
            } catch { /* demo mode */ }
        };
        fetchProducts();
    }, [])

    // Build order payload that matches backend Order model
    const buildOrderPayload = (paymentMethod) => {
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

        };
    };
    
    // ── COD Order ──
    const handleCOD = async () => {
        setLoading("cod");
        setError("");
        try {
            const payload = buildOrderPayload("cod");

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
    const handleEdit = () => {
        navigate("/add-address");
    }

    return (
        <>
            <div className="checkout-page container">
                <h1 >Review <span className="highlight">Order</span></h1>
                {/* Items */}

                <div className="row">
                    <div className="col-7">
                        {cart.map((item, i) => (

                            <div className="row" key={item._id} style={{ animationDelay: `${i * 0.06}s` }}>

                                <div className="col">
                                    <Link to={`/product/${item._id}`}>
                                        <img src={item.imageUrl} alt={item.name} loading="lazy" />
                                    </Link>

                                </div>
                                <div className="col-6">
                                    <span className="-category">{item.category}</span>
                                    <h3 className="">{item.name}</h3>
                                    <span className="">Quantity is {item.quantity}</span><br />
                                    <span className="current-price">{(item.price * item.quantity).toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
                                    {cart.discount > 0 && <span className="discount-tag">discount is-{cart.discount}%</span>}
                                    {item.comparePrice > 0 && (
                                        <span className="compare-price price-distance">{(item.comparePrice * item.quantity).toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
                                    )}
                                    <br />
                                    <span>{item.seller.storeName}</span>
                                    <br></br>
                                    <span className="">{item.description}</span>
                                </div>
                                <hr />
                            </div>
                        ))}
                    </div>
                    <div className="col">
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
                            <div className="summary-row">
                                <h4>Total</h4>
                                <h4>{total.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</h4>
                            </div>
                            <hr />
                            {pubaddress ? (
                                <span>
                                    <div className="summary-row">
                                        <h3>Delivery Address</h3>

                                        <span><button className="btn-edit table-actions p-2" onClick={handleEdit}>
                                            Edit it →
                                        </button></span>
                                    </div>

                                    <div className="summary-row">
                                        <p style={{ margin: "0.5rem 0", lineHeight: 1.6 }}>
                                            {pubaddress.buildingname}, {pubaddress.areaname}<br />
                                            {pubaddress.city} {pubaddress.state} - {pubaddress.pincode}
                                        </p>
                                    </div>

                                </span>
                            ) : (
                                <span>
                                    <div className="summary-row">
                                        <button className="btn btn-primary btn-lg" onClick={handleEdit}>
                                            + Add Address
                                        </button>
                                    </div>

                                </span>
                            )}
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
                                // onClick={handlePayNow}
                                disabled={!!loading}
                            >
                                {loading === "online" ? "Processing..." : `Pay Now - ${total.toLocaleString("en-IN", { style: "currency", currency: "INR" })}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Checkout
