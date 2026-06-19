import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../api";
import ProductCard from "../components/ProductCard";
import "./Pages.css";

const CATEGORIES = [
  { name: "Electronics", icon: "⚡", color: "#4a9dec", desc: "Gadgets & Tech" },
  { name: "Fashion", icon: "👗", color: "#e85d4a", desc: "Style & Trends" },
  { name: "Home & Garden", icon: "🏡", color: "#2ecc71", desc: "Living Spaces" },
  { name: "Sports", icon: "⚽", color: "#e8a838", desc: "Stay Active" },
  { name: "Books", icon: "📚", color: "#8b5cf6", desc: "Read & Learn" },
  { name: "Health & Beauty", icon: "✨", color: "#ec4a8e", desc: "Self Care" },
];



const Home = () => {
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");
  const location = useLocation();

  // Show order success message when redirected from Payment
  useEffect(() => {
    if (location.state?.orderMsg) {
      setMsg(location.state.orderMsg);
      // Clear the state so message doesn't reappear on refresh
      window.history.replaceState({}, "");
      setTimeout(() => setMsg(""), 5000);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get("/products/featured");
        if (data.products?.length > 0) setProducts(data.products);
      } catch {
        // Use demo data
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home-page">
      {/* ── Hero Section ── */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="hero-inner container">
          <div className="hero-content">
              {msg && (
                    <div style={{
                        background: "rgba(46,204,113,0.15)",
                        color: "#1a9f55",
                        padding: "1rem 1.5rem",
                        borderRadius: "10px",
                        marginBottom: "1.5rem",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        textAlign: "center",
                        border: "1px solid rgba(46,204,113,0.3)",
                    }}>
                        {msg}
                    </div>
                )}
            <span className="hero-eyebrow anim-fade-up">◆ The Modern Marketplace</span>
            <h1 className="hero-title anim-fade-up" style={{ animationDelay: ".1s" }}>
              Buy & Sell<br />
              <span className="highlight">Anything</span> You Love
            </h1>
            <p className="hero-sub anim-fade-up" style={{ animationDelay: ".2s" }}>
              A beautifully curated platform where buyers find extraordinary products
              and sellers build thriving businesses.
            </p>
            <div className="hero-actions anim-fade-up" style={{ animationDelay: ".3s" }}>
              <Link to="/shop" className="btn btn-primary btn-lg">
                Start Shopping →
              </Link>
              <Link to="/auth" className="btn btn-outline btn-lg">
                Become a Seller
              </Link>
            </div>
            <div className="hero-stats anim-fade-up" style={{ animationDelay: ".4s" }}>
              <div className="stat"><strong>12K+</strong><span>Products</span></div>
              <div className="stat-divider" />
              <div className="stat"><strong>3.2K</strong><span>Sellers</span></div>
              <div className="stat-divider" />
              <div className="stat"><strong>50K+</strong><span>Happy Buyers</span></div>
            </div>
          </div>
          <div className="hero-visual anim-fade-up" style={{ animationDelay: ".2s" }}>
            <div className="hero-card hero-card-1">
              <div className="hero-card-emoji">🛍️</div>
              <span>Shop 12K+ products</span>
            </div>
            <div className="hero-card hero-card-2">
              <div className="hero-card-emoji">💰</div>
              <span>Start selling today</span>
            </div>
            <div className="hero-card hero-card-3">
              <div className="hero-card-emoji">🚀</div>
              <span>Fast free delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="section categories-section container">
        <h2 className="section-title">Browse by <span>Category</span></h2>
        <p className="section-sub">Explore our curated collections across every interest</p>
        <div className="categories-grid">
          {CATEGORIES.map((cat, i) => (
            <Link
              to={`/shop?category=${cat.name}`}
              key={cat.name}
              className="category-card anim-fade-up"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="cat-icon" style={{ background: `${cat.color}18`, color: cat.color }}>
                {cat.icon}
              </div>
              <h3>{cat.name}</h3>
              <p>{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="section products-section container">
        <h2 className="section-title">Trending <span>Products</span></h2>
        <p className="section-sub">Hand-picked by our team, loved by thousands</p>
        <div className="products-grid">
          {products.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link to="/shop" className="btn btn-dark btn-lg text-white">View All Products →</Link>
        </div>
      </section>

      {/* ── Seller CTA ── */}
      <section className="section seller-cta">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <span className="hero-eyebrow">◆ For Entrepreneurs</span>
              <h2>Turn Your Passion<br />Into <span className="highlight">Profit</span></h2>
              <p>
                Join thousands of sellers on MarketVerse. Set up your store in minutes,
                reach millions of buyers, and grow your business with powerful tools.
              </p>
              <div className="cta-perks">
                <div className="perk">✓ Zero setup fees</div>
                <div className="perk">✓ Seller dashboard</div>
                <div className="perk">✓ Inventory tools</div>
                <div className="perk">✓ Order management</div>
              </div>
              <Link to="/auth" className="btn btn-primary btn-lg">Start Selling Free →</Link>
            </div>
            <div className="cta-visual">
              <div className="cta-stat-card">
                <div className="cta-stat-value">$12.4K</div>
                <div className="cta-stat-label">Avg. Monthly Revenue</div>
                <div className="cta-stat-bar">
                  <div className="cta-stat-fill" style={{ width: "72%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="section trust-section container">
        <div className="trust-grid">
          {[
            { icon: "🔒", title: "Secure Payments", desc: "SSL encrypted checkout" },
            { icon: "🚚", title: "Free Shipping", desc: "On orders over $50" },
            { icon: "↩️", title: "Easy Returns", desc: "30-day return policy" },
            { icon: "💬", title: "24/7 Support", desc: "Always here to help" },
          ].map((t, i) => (
            <div key={i} className="trust-item anim-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="trust-icon">{t.icon}</div>
              <h4>{t.title}</h4>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
