import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);
  
  // const googlelogin = async(e)=>{
  //   const {data}=await API.get("/auth/google");
  //   if (data.success) {
  //     localStorage.setItem("user", JSON.stringify(data.user));
  //     setUser(data.user);
  //   }
  //   return data;
  // }

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    if (data.success) {
      // localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const register = async (userData) => {
    const { data } = await API.post("/auth/register", userData);
    if (data.success) {
      // localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const logout = async() => {
  await API.get("/auth/logout");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
