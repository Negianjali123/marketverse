import express from "express";
import Product from "../models/Product.js";
import { protect, authorize } from "../middleware/auth.js";
import axios from "axios";
import imageURL from "./imageURl.js"
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3.js";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

async function productsWithImageUrls(products) {
  return await Promise.all(
    products.map(async (product) => {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: product.image,
      });

      const imageUrl = await getSignedUrl(s3, command, {
        expiresIn: 300,
      });

      return {
        ...(product.toObject ? product.toObject() : product),
        imageUrl,
      };
    })
  );
}
async function productsUploadImage(fileDetails) {
  const key = `products/${Date.now()}-${fileDetails.originalname}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: fileDetails.buffer,
    ContentType: fileDetails.mimetype,
  });

  const imageUrl = await s3.send(command, {
    expiresIn: 300,
  });

  return key;
}

// GET /api/products — public, with filters & pagination
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      sort = "-createdAt",
      status = "active",
    } = req.query;

    const query = { status };
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("seller", "name storeName avatar")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const productDetails = await productsWithImageUrls(products)

    res.json({
      success: true,
      products: productDetails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post("/cartImage",async(req,res)=>{
  const products=req.body
  
   const Product = await productsWithImageUrls(products)
  //  console.log(imageUrls);
    //  res.json({
    //   success: true,
    //   message:"done "
    // });
    res.json({
      success: true,
      Product: Product,
    });
})
// GET /api/products/featured
router.get("/featured", async (req, res) => {
  try {
    const products = await Product.find({ status: "active" })
    .populate("seller", "storeName");
    
    const productDetails = await productsWithImageUrls(products)
    // console.log(productDetails);
    res.json({
      success: true,
      products: productDetails,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name storeName avatar storeDescription")
      .populate("reviews.user", "name avatar");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products — seller only
router.post("/", protect, authorize("seller", "admin"),upload.single("image"), async (req, res) => {
  try {
    
    const s3imagekey = await productsUploadImage(req.file)
   // Build product with all form fields + S3 key
  
    const productToSave = {
      ...req.body,
      seller: req.user._id,
      image: s3imagekey,           // S3 key stored as image name
    };

    //save in db
    const product = await Product.create(productToSave) 

    res.status(201).json({ success: true, message:"data is saved" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id — seller (own) or admin
router.put("/:id",protect, authorize("seller", "admin"),upload.single("image"), async (req, res) => {
  try {
     
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    const s3imagekey = await productsUploadImage(req.file)
   // Build product with all form fields + S3 key
  
    const productToSave = {
      ...req.body,
      seller: req.user._id,
      image: s3imagekey,           // S3 key stored as image name
    };
    product = await Product.findByIdAndUpdate(req.params.id,productToSave, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, message:"product saved" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id
router.delete("/:id", protect, authorize("seller", "admin"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    await product.deleteOne();
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products/:id/reviews — buyer only
router.post("/:id/reviews", protect, authorize("buyer"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: "Already reviewed" });
    }
    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(req.body.rating),
      comment: req.body.comment,
    });
    product.updateAverageRating();
    await product.save();
    res.status(201).json({ success: true, message: "Review added" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/seller/my-products — seller's own products
router.get("/seller/my-products", protect, authorize("seller"), async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort("-createdAt");
    res.json({ success: true, products, count: products.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/update/:id', async (req, res) => {
  const images = req.file
  const _id = req.params.id;
  const products = await Product.findByIdAndUpdate(
    _id,
    { images },
    { new: true } // return updated document
  );
  console.log("fone")
});
export default router;
