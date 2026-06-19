import * as Yup from "yup";

export const registerSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long")
    .required("Name is required"),
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .required("Password is required"),
  role: Yup.string()
    .oneOf(["buyer", "seller"], "Invalid role")
    .required("Role is required"),
  storeName: Yup.string().when("role", {
    is: "seller",
    then: (schema) => schema.required("Store name is required for sellers"),
  }),
  storeDescription: Yup.string().max(500, "Description too long"),
});