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
    res.status(500).json({ success: false, message: err.message });
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
    res.status(500).json({ success: false, message: err.message });
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
      const product = await Product.findByIdAndUpdate({
        _id: item.product,
        stock: { $gte: item.quantity }
      }, {
        $inc: { stock: -item.quantity } // decrease stock
      },
        {
          new: true // return updated document
        }
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
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
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/my-orders — buyer's orders
router.get("/my-orders", protect, authorize("buyer"), async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("items.product", "name images")
      .sort("-createdAt");
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/seller-orders — seller sees orders with their products
router.get("/seller-orders", protect, authorize("seller"), async (req, res) => {
  try {
    const orders = await Order.find({ "items.seller": req.user._id })
      .populate("buyer", "name email")
      .populate("items.product", "name images")
      .sort("-createdAt");
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "name email")
      .populate("items.product", "name images price");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
