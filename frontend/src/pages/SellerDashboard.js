import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./Pages.css";

const CATEGORIES = [
  "Electronics", "Fashion", "Home & Garden", "Sports",
  "Books", "Toys", "Health & Beauty", "Automotive", "Food & Beverage", "Other",
];

const emptyProduct = {
  name: "", description: "", price: "", comparePrice: "",
  category: "Electronics", stock: "", tags: "", images: "",
};

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const formData = new FormData();


  useEffect(() => {
    if (!user || user.role !== "seller") {
      navigate("/auth");
      return;
    }
    fetchProducts();
    fetchOrders();
  }, [user, navigate]);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get("/products/seller/my-products");
      if (data.products) setProducts(data.products);
    } catch { /* demo mode */ }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/orders/seller-orders");
      if (data.orders) setOrders(data.orders);
    } catch { /* demo mode */ }
  };

  const handleChange = (e) => {
    if (e.target.name == "image") {
      setForm({ ...form, [e.target.name]: e.target.files[0] });
    }
    else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(form);
    setLoading(true);
    try {

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("comparePrice", form.comparePrice);
       formData.append("stock", form.stock);
      // formData.append("tags", form.tags?form.tags : "");
      formData.append("image", form.image);

      // console.log(formData)
      if (editing) {
        await API.put(`/products/${editing}`, formData,{
           headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setMsg("Product updated!");
      } else {
        await API.post(`/products`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setMsg("Product created!");
      }
      setForm(emptyProduct);
      setEditing(null);
      fetchProducts();
    } catch (err) {
      setMsg(err.response?.data?.message || "Error saving product");
    }
    setLoading(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      comparePrice: p.comparePrice || "",
      category: p.category,
      stock: p.stock,
      tags: p.tags?.join(", ") || "",
      image:  p.image.files,
    });
    setEditing(p._id);
    setActiveTab("add");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch { /* demo */ }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      fetchOrders();
    } catch { /* demo */ }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalSold = orders.reduce((sum, o) => sum + o.items?.length, 0);

  return (
    <div className="dashboard-page container">
      <div className="dash-header">
        <div>
          <h1>Seller <span className="highlight">Dashboard</span></h1>
          <p style={{ color: "var(--slate)", marginTop: "0.25rem" }}>
            {user?.storeName || "Your Store"} — Manage your products & orders
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setActiveTab("add"); setEditing(null); setForm(emptyProduct); }}
        >
          + Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        <div className="dash-stat-card">
          <h4>Products</h4>
          <div className="stat-value">{products.length}</div>
        </div>
        <div className="dash-stat-card" style={{ borderLeftColor: "var(--emerald)" }}>
          <h4>Total Orders</h4>
          <div className="stat-value">{orders.length}</div>
        </div>
        <div className="dash-stat-card" style={{ borderLeftColor: "var(--sky)" }}>
          <h4>Items Sold</h4>
          <div className="stat-value">{totalSold}</div>
        </div>
        <div className="dash-stat-card" style={{ borderLeftColor: "var(--violet)" }}>
          <h4>Revenue</h4>
          <div className="stat-value">{totalRevenue.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dash-tabs">
        <button className={activeTab === "products" ? "active" : ""} onClick={() => setActiveTab("products")}>
          My Products
        </button>
        <button className={activeTab === "add" ? "active" : ""} onClick={() => { setActiveTab("add"); setEditing(null); setForm(emptyProduct); }}>
          {editing ? "Edit Product" : "Add Product"}
        </button>
        <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
          Orders
        </button>
      </div>

      {msg && (
        <div style={{
          background: "rgba(46,204,113,0.1)",
          color: "#1a9f55",
          padding: "0.75rem 1rem",
          borderRadius: "var(--radius-sm)",
          marginBottom: "var(--space-lg)",
          fontWeight: 600,
        }}>
          {msg}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="products-table">
          {products.length === 0 ? (
            <div className="cart-empty">
              <div style={{ fontSize: "3rem" }}>📦</div>
              <h2>No products yet</h2>
              <p style={{ color: "var(--slate)", margin: "0.5rem 0 1.5rem" }}>
                Add your first product to start selling!
              </p>
              <button className="btn btn-primary" onClick={() => setActiveTab("add")}>
                + Add Product
              </button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td className="table-product-name">{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.price.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</td>
                    <td>{p.stock}</td>
                    <td>
                      <span className={`badge ${p.status === "active" ? "badge-green" : "badge-coral"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-edit" onClick={() => handleEdit(p)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(p._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add/Edit Product Tab */}
      {activeTab === "add" && (
        <div className="add-product-form">
          <h2>{editing ? "Edit Product" : "Add New Product"}</h2>
          <form className="upload-form" encType="multipart/form-data" onSubmit={handleSubmit} >
            <div className="form-group">
              <label>Product Name</label>
              <input className="form-input" name="name" placeholder="e.g. Wireless Headphones" value={form.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea className="form-input" name="description" placeholder="Describe your product..." value={form.description} onChange={handleChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price </label>
                <input className="form-input" type="number" name="price" step="0.01" min="0" placeholder="29.99" value={form.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Compare Price </label>
                <input className="form-input" type="number" name="comparePrice" step="0.01" min="0" placeholder="49.99" value={form.comparePrice} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select className="form-input" name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input className="form-input" type="number" name="stock" min="0" placeholder="50" value={form.stock} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Image Names (comma-separated)</label>
              {/* <input className="form-input" name="images" placeholder="bottle.webp, headphones.png" value={form.images}
               onChange={handleChange} /> */}
              <input type="file" name="image" accept="image/png, image/jpeg, .jpg, .jpeg, .png , .webp , .WEBP " onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input className="form-input" name="tags" placeholder="wireless, bluetooth, audio" value={form.tags} onChange={handleChange} />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? "Saving..." : editing ? "Update Product" : "Create Product"}
              </button>
              {editing && (
                <button type="button" className="btn btn-secondary btn-lg" onClick={() => { setEditing(null); setForm(emptyProduct); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="cart-empty">
              <div style={{ fontSize: "3rem" }}>📋</div>
              <h2>No orders yet</h2>
              <p style={{ color: "var(--slate)" }}>Orders will appear here once buyers purchase your products.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <h3>Order #{order._id?.slice(-8)}</h3>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span className={`badge ${order.orderStatus === "delivered" ? "badge-green" :
                      order.orderStatus === "shipped" ? "badge-sky" :
                        order.orderStatus === "cancelled" ? "badge-coral" : "badge-amber"
                      }`}>
                      {order.orderStatus}
                    </span>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      style={{ padding: "0.35rem 0.5rem", borderRadius: "6px", border: "1px solid var(--cloud)", fontSize: "0.8rem" }}
                    >
                      <option value="processing">Processing</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="order-items">
                  {order.items?.map((item, i) => (
                    <div key={i} className="order-item-row">
                      <span>{item.name} × {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-total">Total: ${order.totalAmount?.toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
