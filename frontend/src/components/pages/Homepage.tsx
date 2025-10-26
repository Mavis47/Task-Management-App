"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Homepage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.role.trim())
      newErrors.role = "Role is required (admin or user)";
    else if (!["admin", "user"].includes(formData.role.toLowerCase()))
      newErrors.role = "Role must be 'admin' or 'user'";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          email: formData.email,
          password: formData.password,
          role: formData.role.toLowerCase(),
        },
        { headers: { "Content-Type": "application/json" } }
      );

      setMessage("User registered successfully!");
      setFormData({ name: "", email: "", password: "", confirmPassword: "", role: "" });
      navigate("/login");
    } catch (error: any) {
      if (error.response) {
        // Errors from server
        setMessage(error.response.data.message || "Error registering user");
      } else {
        // Network or other errors
        setMessage("Server error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-gray-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Section */}
        <div className="bg-white flex flex-col items-center justify-center p-12">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Sign Up
          </h1>
          <form className="w-full max-w-sm space-y-6" onSubmit={handleSubmit}>
            {[
              { label: "Name", name: "name", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "Password", name: "password", type: "password" },
              { label: "Confirm Password", name: "confirmPassword", type: "password" },
              { label: "Role", name: "role", type: "text", placeholder: "admin or user" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors[field.name] ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors[field.name] && (
                  <p className="text-red-600 text-sm mt-1">{errors[field.name]}</p>
                )}
              </div>
            ))}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200 font-semibold py-3 rounded-md"
            >
              {loading ? "Registering..." : "Sign Up"}
            </Button>
          </form>

          {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}

          <div className="mt-6 text-center">
            <a href="/login" className="text-indigo-600 hover:text-indigo-500 text-sm">
              Already have an account? Login
            </a>
          </div>
        </div>

        {/* Right Section */}
        <CardContent className="flex flex-col rounded items-center justify-center p-12 bg-linear-to-br from-indigo-500 text-white">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 leading-tight text-black">
            Task Management System
          </h1>
          <p className="text-lg text-center max-w-md opacity-90 text-neutral-500">
            Organize, track, and complete your tasks with ease. Boost your productivity today!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
