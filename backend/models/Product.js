import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: [true, "Product name is required"], trim: true },
    description: { type: String, required: [true, "Description is required"] },
    price: { type: Number, required: [true, "Price is required"], min: 0 },
    comparePrice: { type: Number, default: 0 },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Electronics",
        "Fashion",
        "Home & Garden",
        "Sports",
        "Books",
        "Toys",
        "Health & Beauty",
        "Automotive",
        "Food & Beverage",
        "Other",
      ],
    },
    images: [{ type: String }],
    image: {
      type: String,
      required: false
    },
    stock: { type: Number, required: true, min: 0, default: 0 },
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ["active", "draft", "out_of_stock", "archived"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Update average rating on review changes
productSchema.methods.updateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.ratings = 0;
    this.numReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.ratings = (sum / this.reviews.length).toFixed(1);
    this.numReviews = this.reviews.length;
  }
};

export default mongoose.model("Product", productSchema);
