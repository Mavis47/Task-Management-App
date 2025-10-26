import axios from "axios";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, type User } from "../contexts/auth.context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    try {
  setLoading(true);
  const res = await axios.post("http://localhost:5000/api/auth/login", {
    email,
    password,
  });

  const token = res.data.token;


  const payload = JSON.parse(atob(token.split(".")[1])); 

  const userData = { ...payload, token };
  setUser(userData);
  localStorage.setItem("user", JSON.stringify(userData));

  if (payload.role === "admin") {
    navigate("/adminPanel");
  } else {
    navigate("/userPanel");
  }
} catch (error: any) {
  console.error("Login failed:", error.response?.data?.message || error.message);
} finally {
  setLoading(false);
}
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
