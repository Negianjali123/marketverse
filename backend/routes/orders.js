import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// ── Razorpay instance (lazy — only created when actually needed) ──
let razorpay = null;
const getRazorpay = () => {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

// POST /api/orders/create-razorpay-order — create Razorpay order for online payment
router.post("/create-razorpay-order", protect, async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
    };
    const razorpayOrder = await getRazorpay().orders.create(options);
    res.json({ success: true, order: razorpayOrder, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/orders/verify-payment — verify Razorpay signature after payment
router.post("/verify-payment", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }
    res.json({ success: true, message: "Payment verified" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/orders — buyer creates order
router.post("/", protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    // console.log(req.body);debugger;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in order" });
    }

    // Validate stock & build order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      // Atomic: only decrements if stock >= quantity
      const product = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!product) {
        // Check if product exists at all to give a clear message
        const exists = await Product.findById(item.product);
        return res.status(400).json({
          success: false,
          message: exists
            ? `Insufficient stock for ${exists.name}`
            : `Product ${item.product} not found`,
        });
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        price: product.price,
        quantity: item.quantity,
        seller: product.seller,
      });
      subtotal += product.price * item.quantity;
    }


    const shippingCost = subtotal > 50 ? 0 : 5.99;
    const tax = +(subtotal * 0.08).toFixed(2);
    const totalAmount = +(subtotal + shippingCost + tax).toFixed(2);

    const order = await Order.create({
      buyer: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "cod",
      paymentStatus: paymentMethod === "razorpay" ? "paid" : "pending",
      razorpayOrderId: razorpayOrderId || "",
      razorpayPaymentId: razorpayPaymentId || "",
      razorpaySignature: razorpaySignature || "",
      subtotal,
      shippingCost,
      tax,
      totalAmount,
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/orders/my-orders — buyer's orders (paginated)
router.get("/my-orders", protect, authorize("buyer"), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments({ buyer: req.user._id });
    const orders = await Order.find({ buyer: req.user._id })
      .populate("items.product", "name images")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, orders, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/orders/seller-orders — seller sees orders with their products (paginated)
router.get("/seller-orders", protect, authorize("seller"), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments({ "items.seller": req.user._id });
    const settorders = await Order.find({ "items.seller": req.user._id })
      .populate("buyer", "name email")
      .populate("items.product", "name images")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));

    const orders = settorders
      .map(order => ({
        ...order._doc,
        items: order.items.filter(item => item.seller.toString() === req.user._id.toString())
      }));
    res.json({ success: true, orders, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/orders/:id — only the buyer, the item seller, or admin can view
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "name email")
      .populate("items.product", "name images price");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    // Ownership check
    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    const isSeller = order.items.some(i => i.seller.toString() === req.user._id.toString());
    const isAdmin = req.user.role === "admin";
    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to view this order" });
    }
    res.json({ success: true, order });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/orders/:id/status — seller/admin updates status
router.put("/:id/status", protect, authorize("seller", "admin"), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    order.orderStatus = req.body.orderStatus || order.orderStatus;
    order.trackingNumber = req.body.trackingNumber || order.trackingNumber;
    if (req.body.orderStatus === "delivered") {
      order.deliveredAt = new Date();
    }
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
