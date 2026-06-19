import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./ProductCard.css";
import Cart from "../pages/Cart";

const PLACEHOLDER_IMAGES = [
];

const ProductCard = ({ product, index = 0 }) => {
  
  const { addToCart } = useCart();
  const image =
    product.image?.[0] || PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
 
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`star ${i < Math.round(product.ratings || 0) ? "filled" : ""}`}>
      ★
    </span>
  ));

  return (
    
    <div className="product-card card" style={{ animationDelay: `${index * 0.06}s` }}>
      <Link to={`/product/${product._id}`} className="product-card-image">
        <img src={product.imageUrl}  alt={product.name} loading="lazy" />
        {discount > 0 && <span className="discount-tag">-{discount}%</span>}
        {product.isFeatured && <span className="featured-tag">★ Featured</span>}
      </Link>
      <div className="product-card-body">
        <span className="product-category">{product.category}</span>
        <Link to={`/product/${product._id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>

        <div className="product-rating">
          <div className="stars">{stars}</div>
          <span className="review-count">({product.numReviews || 0})</span>
        </div>

        <div className="product-pricing">
          <span className="current-price">{product.price.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
          {product.comparePrice > 0 && (
            <span className="compare-price">₹{product.comparePrice.toFixed(2)}</span>
          )}
        </div>
        <div className="product-pricing">
          <span className="current-price text-secondary">{product.seller.storeName}</span>
        </div>
        <div className="product-card-body">
          <span className="product-description text-secondary">{product.description}</span>
        </div>

        <button
          className="btn btn-primary btn-sm btn-block add-to-cart-btn"
          onClick={(e) => {
            e.preventDefault();
            addToCart(product);
          }}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
