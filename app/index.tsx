"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

export default function Homepage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", formData.email);
        router.push("/pages/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#06A9CA] to-[#0891b3] p-5">
      <div className="bg-white pt-10 pl-10 pr-10 pb-2 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your Classic Wines account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#06A9CA] focus:ring-[#06A9CA] focus:ring-opacity-20 focus:ring-2 transition-all duration-200 text-black"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#06A9CA] focus:ring-[#06A9CA] focus:ring-opacity-20 focus:ring-2 transition-all duration-200 text-black"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg border-l-4 border-red-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#06A9CA] hover:bg-[#0891b3] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <footer className="text-center py-4 pt-6 text-[#00B3CC] text-sm font-medium opacity-80 flex items-center justify-center">
          Powered by
          <Image
            src="/logo.png"
            alt="Tech Sierra Logo"
            width={48}
            height={32}
            className="object-contain ml-2"
          />
        </footer>
      </div>
    </div>
  );
}
