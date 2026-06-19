import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { useAddress } from "../context/AddressContext";

const Address = () => {
    const navigate = useNavigate();
    const { pubaddress, setPubaddress, editing, fetchAddress } = useAddress();
    const [form, setForm] = useState({ buildingname: "", areaname: "", pincode: "", city: "", state: "" });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    // Pre-fill form when existing address loads from context
    useEffect(() => {
        if (pubaddress) {
            setForm({
                buildingname: pubaddress.buildingname || "",
                areaname: pubaddress.areaname || "",
                pincode: pubaddress.pincode || "",
                city: pubaddress.city || "",
                state: pubaddress.state || "",
            });
        }
    }, [pubaddress]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editing) {
            setMsg("Please login first");
            return;
        }
        setLoading(true);
        try {
            const res = await API.post("/address/updateaddress", { ...form, userid: editing });
            if (res.data.success) {
                setPubaddress(res.data.data);
                setMsg("Address saved successfully!");
                setTimeout(() => navigate("/checkout"), 1500);
            } else {
                setMsg("Failed to save address");
            }
        } catch (err) {
            setMsg(err.response?.data?.message || "Error saving address");
        }
        setLoading(false);
        setTimeout(() => setMsg(""), 3000);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCancel = () => {
        navigate("/checkout");
    };

    return (
        <>
            <div className="checkout-page container">
                <h1><span className="highlight">{pubaddress ? "Edit Address" : "Add New Address"}</span></h1>

                {msg && (
                    <div style={{
                        background: msg.includes("success") ? "rgba(46,204,113,0.1)" : "rgba(231,76,60,0.1)",
                        color: msg.includes("success") ? "#1a9f55" : "#e74c3c",
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        marginBottom: "1rem",
                        fontWeight: 600,
                    }}>
                        {msg}
                    </div>
                )}

                <div className="cart-summary center-screen">
                    <form className="upload-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>House no./Building Name *</label>
                            <input className="form-input" name="buildingname" value={form.buildingname} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Road Name / Area / Colony *</label>
                            <input className="form-input" name="areaname" value={form.areaname} onChange={handleChange} required />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Pincode *</label>
                                <input className="form-input" name="pincode" value={form.pincode} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>City</label>
                                <input className="form-input" name="city" value={form.city} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>State</label>
                                <input className="form-input" name="state" value={form.state} onChange={handleChange} />
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                {loading ? "Saving..." : "Save Address"}
                            </button>
                            <button type="button" className="btn btn-secondary btn-lg" onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Address;