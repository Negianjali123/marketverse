import * as Yup from 'yup';

export const addressSchema=Yup.object({
  buildingname: Yup.string()
   .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  areaname:Yup.string()
   .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  pincode:Yup.string()
   .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
})