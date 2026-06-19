import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import "./Pages.css";

const Auth = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("buyer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", storeName: "",
    storeDescription: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };
  const handleGoogle = async (e) => {
    e.preventDefault();
    // setLoading(true);
    setError("");
    try {
      // const { data } = await API.get("/auth/google");
      window.location.href = "http://localhost:5000/api/auth/google";
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    // setLoading(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register({ ...form, role });
      }
      navigate(role === "seller" ? "/seller/dashboard" : "/shop");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: "center", fontSize: "2rem", marginBottom: "0.5rem" }}>◆</div>
        <h2>{isLogin ? "Welcome Back" : "Join MarketVerse"}</h2>
        <p className="auth-sub">
          {isLogin
            ? "Sign in to your account to continue"
            : "Create your account and start your journey"}
        </p>

        {/* Login / Register Tabs */}
        <div className="auth-tabs">
          <button className={isLogin ? "active" : ""} onClick={() => { setIsLogin(true); setError(""); }}>
            Sign In
          </button>
          <button className={!isLogin ? "active" : ""} onClick={() => { setIsLogin(false); setError(""); }}>
            Create Account
          </button>
        </div>

        {/* Role Toggle — only for register */}
        {!isLogin && (
          <div className="role-toggle">
            <button className={role === "buyer" ? "active" : ""} onClick={() => setRole("buyer")}>
              🛍️ I want to Buy
            </button>
            <button className={role === "seller" ? "active" : ""} onClick={() => setRole("seller")}>
              💼 I want to Sell
            </button>
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                className="form-input"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={handleChange}
              minLength={6}
            />
          </div>

          {/* Seller-specific fields */}
          {!isLogin && role === "seller" && (
            <>
              <div className="form-group">
                <label>Store Name</label>
                <input
                  className="form-input"
                  name="storeName"
                  placeholder="My Awesome Store"
                  value={form.storeName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Store Description</label>
                <textarea
                  className="form-input"
                  name="storeDescription"
                  placeholder="Tell buyers what your store is about..."
                  value={form.storeDescription}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Sign In"
                : `Create ${role === "seller" ? "Seller" : "Buyer"} Account`}
          </button>
        </form>
        <hr />
        {isLogin || role == "buyer" ?
          <button
            type="button"
            // href="http://localhost:5000/api/auth/google"
            onClick={handleGoogle}
            className="google-btn"
          >
            <img src="/logo_google.svg" alt="Google" className="google-icon" />
            <span>Continue with Google</span>
          </button> : ""}
        <div className="auth-switch">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => { setIsLogin(!isLogin); setError(""); }}>
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
