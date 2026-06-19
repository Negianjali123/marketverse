import * as Yup from "yup";

export const addressSchema = Yup.object({
  street: Yup.string()
    .min(5, "Enter a valid street address")
    .required("Street is required"),
  city: Yup.string()
    .min(2, "Enter a valid city")
    .required("City is required"),
  state: Yup.string()
    .min(2, "Enter a valid state")
    .required("State is required"),
  zip: Yup.string()
    .matches(/^[0-9]{6}$/, "Enter a valid 6-digit PIN code")
    .required("PIN code is required"),
  country: Yup.string()
    .required("Country is required"),
});
