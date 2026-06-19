import { createContext, useContext, useEffect, useState } from "react";
import API from "../api";
import { useAuth } from "./AuthContext";
const AddressContext = createContext();

export const useAddress = () => useContext(AddressContext);

export const AddressProvider = ({ children }) => {
    const [pubaddress, setPubaddress] = useState(null);
    const [editing, setEditing] = useState("");
    const [msg, setMsg] = useState("");
    const {user}=useAuth()

    const fetchAddress = async (userid) => {
        
        const id = userid || editing;

        if (!id) return;
        try {
            const res = await API.get(`/address/${id}`);
            if (res.data.success && res.data.HasAddress) {
                setPubaddress(res.data.HasAddress);
            }
        } catch (error) {
            console.error("Address fetch error:", error);
        }
    };

    useEffect(() => {
        
       if (!user?._id) {                      // ← user from AuthContext, not localStorage
            setPubaddress(null);               // ← clear on logout
            setEditing("");
            return;
        }
        setEditing(user._id);
        fetchAddress(user._id);
    }, [user]); 

    return (
        <AddressContext.Provider value={{ pubaddress, setPubaddress, editing, setEditing, fetchAddress,msg, setMsg }}>
            {children}
        </AddressContext.Provider>
    );
};