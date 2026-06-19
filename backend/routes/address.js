import express from "express";
import Address from "../models/Address.js"
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();
router.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const HasAddress = await Address.findOne({ userid: id })
        if (HasAddress) {
            return res.status(200).json({ success: true, HasAddress });
        }
        else {
            return res.status(200).json({ success: false, message: "donot have data" })
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });

    }

})
router.post("/updateaddress", async (req, res) => {
    try {
        const { userid, buildingname, areaname, pincode, city, state } = req.body;

        if (!userid) {
            return res.status(400).json({ success: false, message: "userid is required" });
        }

        // Update existing address or create new one
        const existing = await Address.findOne({ userid });

        if (existing) {
            existing.buildingname = buildingname;
            existing.areaname = areaname;
            existing.pincode = pincode;
            existing.city = city || "";
            existing.state = state || "";
            await existing.save();
            return res.status(200).json({ success: true, message: "Address updated", data: existing });
        }

        const newAddress = await Address.create({ userid, buildingname, areaname, pincode, city: city || "", state: state || "" });
        return res.status(201).json({ success: true, message: "Address created", data: newAddress });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
})

export default router;