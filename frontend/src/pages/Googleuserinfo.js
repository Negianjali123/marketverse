import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext";
import { useNavigate} from "react-router-dom";


const Googleuserinfo = () => {
    const { googlesignup,load } = useAuth();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchUser = async () => {
            try {
                await googlesignup();
                navigate("/shop");
            } catch (err) {
                setError(err.response?.data?.message || "Something went wrong");
            }
            setLoading(false);

        };

        fetchUser();
    }, []);
}
export default Googleuserinfo;