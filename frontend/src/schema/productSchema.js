import * as Yup from "yup";

export const productSchema = Yup.object({
  name: Yup.string()
    .min(3, "Product name must be at least 3 characters")
    .max(100, "Product name is too long")
    .required("Product name is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),
  price: Yup.number()
    .positive("Price must be positive")
    .required("Price is required"),
  comparePrice: Yup.number()
    .min(0, "Compare price cannot be negative")
    .nullable(),
  category: Yup.string()
    .oneOf(["Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Toys", "Health & Beauty", "Automotive", "Food & Beverage", "Other"])
    .required("Category is required"),
  stock: Yup.number() 
    .integer("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .required("Stock is required"),
  tags: Yup.string(),
});