import axios from "axios";

const API = axios.create({
  baseURL:  process.env.REACT_APP_API_URL ,
  //  baseURL: "http://localhost:5000/api",
   withCredentials: true,
});

// // Handle 401 globally
API.interceptors.response.use(
  (res) =>res,
  (err) => {
    console.log(err)
    if (err.response?.status === 401) {
      localStorage.removeItem("user");
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(err);
  }
);

export default API;
