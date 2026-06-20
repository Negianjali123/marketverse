import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    googleID:{
      type:String,
      unique: true,
      sparse: true, 
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
      required: true,
    },

    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      trim: true,
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zip: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    // Seller-specific fields
    storeName: { type: String, default: "" },
    storeDescription: { type: String, default: "" },
    storeLogo: { type: String, default: "" },
    isVerifiedSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
   if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
