import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="footer-inner container">
      <div className="footer-grid">
        {/* Brand */}
        <div className="footer-brand">
          <div className="navbar-logo" style={{ marginBottom: "1rem" }}>
            <span className="logo-icon">◆</span>
            <span className="logo-text">Market<span>Verse</span></span>
          </div>
          <p>A modern marketplace where buyers discover amazing products and sellers grow their business.</p>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/shop">All Products</Link>
          <Link to="/shop?category=Electronics">Electronics</Link>
          <Link to="/shop?category=Fashion">Fashion</Link>
          <Link to="/shop?category=Home & Garden">Home & Garden</Link>
        </div>

        <div className="footer-col">
          <h4>Sellers</h4>
          <Link to="/auth">Start Selling</Link>
          <Link to="/seller/dashboard">Seller Dashboard</Link>
          <Link to="/">Seller Resources</Link>
          <Link to="/">Pricing</Link>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <Link to="/">Help Center</Link>
          <Link to="/">Contact Us</Link>
          <Link to="/">Returns</Link>
          <Link to="/">Privacy Policy</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} MarketVerse. Built with ❤️</p>
        <div className="footer-socials">
          <a href="#!" aria-label="Twitter">𝕏</a>
          <a href="#!" aria-label="Instagram">◉</a>
          <a href="#!" aria-label="LinkedIn">in</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
