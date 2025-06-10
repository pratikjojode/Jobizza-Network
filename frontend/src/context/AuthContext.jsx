import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (e) {
        console.error("Failed to parse user or token from localStorage:", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const verifyOtp = async (email, otp) => {
    try {
      const verifyOtpRes = await axios.post("/api/v1/auth/verify-otp", {
        email,
        otp: otp,
      });

      const { token: receivedToken, user: userData } = verifyOtpRes.data;

      localStorage.setItem("token", receivedToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(receivedToken);
      setUser(userData);

      return {
        success: true,
        user: userData,
        message: "OTP verified successfully!",
      };
    } catch (error) {
      console.error(
        "OTP verification failed:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "OTP verification failed",
      };
    }
  };

  const login = async (email, password, role) => {
    try {
      await axios.post("/api/v1/auth/login", { email, password, role });

      navigate("/verify-otp", { state: { email } });

      return { success: true, message: "OTP sent. Please verify." };
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post("/api/v1/auth/register", userData);
      return { success: true, message: res.data.message };
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        logout,
        verifyOtp,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
