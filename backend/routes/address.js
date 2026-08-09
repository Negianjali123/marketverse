import express from "express";
import Address from "../models/Address.js"
import { protect, authorize } from "../middleware/auth.js";
import State from "../components/State-redis.js";
import City from "../Data/City.js"
import cityStateName from "../components/cityStateName.js";


const router = express.Router();

router.get("/user/:id", State, async (req, res) => {
    const id = req.params.id;
 const StateName = req.states;
    try {
        const HasAddress = await Address.findOne({ userid: id })
        if (HasAddress) {
           
            // console.log(StateName)
            const result = await cityStateName(HasAddress, StateName);

            return res.status(200).json({
                success: true,
                HasAddress: result
            });

        }
        else {
            return res.status(200).json({ success: false, message: "donot have data" })
        }
    } catch (err) {
        console.error("Address error:", err.message);
        res.status(500).json({ success: false, message: "Server error" });

    }

})
router.get("/state", State, async (req, res) => {
    try {
        const HasState = req.states
        if (HasState) {
            return res.status(200).json({ success: true, HasState });
        }
        else {
            return res.status(200).json({ success: false, message: "donot have data" })
        }
    } catch (err) {
        console.error("State error:", err.message);
        res.status(500).json({ success: false, message: "Server error" });

    }

})
router.get("/city/:id", async (req, res) => {
    try {
        const selectedstateid = req.params.id;
        if (selectedstateid) {
            const citydetails = City.filter(city => city.stateId == selectedstateid)
            return res.status(200).json({ success: true, citydetails });
        }
        else {
            return res.status(200).json({ success: false, message: "donot have data" })
        }
    } catch (err) {
        console.error("State error:", err.message);
        res.status(500).json({ success: false, message: "Server error" });

    }

})
router.post("/updateaddress", State, protect, async (req, res) => {
    
    try {
        const StateName = req.states;
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
            const result = await cityStateName(existing, StateName);
        return res.status(200).json({ success: true, message: "Address updated", data: result });

        }
        

        const newAddress = await Address.create({ userid, buildingname, areaname, pincode, city: city || "", state: state || "" });
        const result = await cityStateName(newAddress, StateName);
        return res.status(201).json({ success: true, message: "Address created", data: newAddress });

    } catch (err) {
        console.error("Address error:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
})

export default router;