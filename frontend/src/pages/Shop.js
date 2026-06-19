import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api";
import ProductCard from "../components/ProductCard";
import "./Pages.css";

const DEMO_PRODUCTS = [
];

const CATEGORIES = ["All", "Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Toys", "Health & Beauty", "Automotive", "Food & Beverage"];

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState(DEMO_PRODUCTS);
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-createdAt");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = {};
        if (category !== "All") params.category = category;
        if (search) params.search = search;
        params.sort = sort;
        const { data } = await API.get("/products", { params });
        if (data.products?.length > 0) setProducts(data.products);
      } catch {
        // Use demo
      }
    };
    fetchProducts();
  }, [category, search, sort]);


  const filtered = products.filter((p) => {
    const matchCat = category === "All" || p.category === category;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="shop-page container">
      <div className="shop-header">
        <h1>Shop <span className="highlight">All</span></h1>
        <div className="shop-filters">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="-createdAt">Newest</option>
            <option value="price">Price: Low → High</option>
            <option value="-price">Price: High → Low</option>
            <option value="-ratings">Top Rated</option>
          </select>
        </div>
      </div>

      <p className="shop-results">{filtered.length} products found</p>

      <div className="products-grid">
        {filtered.map((p, i) => (
          <ProductCard key={p._id} product={p} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="cart-empty">
          <div style={{ fontSize: "3rem" }}>🔍</div>
          <h2>No products found</h2>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Shop;
