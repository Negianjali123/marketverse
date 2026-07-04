import mongoose from "mongoose";

const AddressSchema =new mongoose.Schema(
    {
    userid:{type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    buildingname: { type: String, required: true },
    city: { type: String, required: false },
    state: { type: String, required: false },
    areaname:{type:String,required:true},
    pincode: { type: String, required: true },
    }
)

// Index for fast lookup by user
AddressSchema.index({ userid: 1 }, { unique: true });

export default mongoose.model("Address", AddressSchema);