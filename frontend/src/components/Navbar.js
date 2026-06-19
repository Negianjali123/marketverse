import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text">Market<span>Verse</span></span>
        </Link>

        {/* Nav Links */}
        <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
          {user?.role === "seller" && (
            <Link to="/seller/dashboard" onClick={() => setMenuOpen(false)}>
              Seller Dashboard
            </Link>
          )}
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Cart */}
          <Link to="/cart" className="nav-cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="nav-profile" onClick={() => setProfileOpen(!profileOpen)}>
              <div className="profile-avatar">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="profile-name">{user.name?.split(" ")[0]}</span>
              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <span className="badge badge-amber">{user.role}</span>
                  </div>
                  <Link to="/orders" onClick={() => setProfileOpen(false)}>My Orders</Link>
                  {user.role === "seller" && (
                    <Link to="/seller/dashboard" onClick={() => setProfileOpen(false)}>
                      Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="dropdown-logout">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="btn btn-primary btn-sm">
              Sign In
            </Link>
          )}

          {/* Mobile Burger */}
          <button
            className={`burger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
