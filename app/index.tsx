"use client";
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function Homepage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (error) setError("");
    },
    [error]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isLoading) return;

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          credentials: "include", // This is crucial for cookies
        });

        if (!response.ok) {
          const data = await response
            .json()
            .catch(() => ({ message: "Login failed" }));
          throw new Error(data.message || "Login failed");
        }

        const data = await response.json();

        // Store minimal data in localStorage (keep for compatibility)
        localStorage.setItem("user", formData.email);
        localStorage.setItem("name", data?.user?.name || "");
        
        // Don't store token in localStorage since we're using HTTP-only cookies
        // localStorage.setItem("token", data.token); // Remove this line

        // Add a small delay to ensure cookie is set before redirect
        setTimeout(() => {
          // Force a full page reload to ensure middleware picks up the cookie
          window.location.href = "/pages/dashboard";
        }, 100);

      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Network error. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [formData, isLoading, router]
  );

  // Rest of your component remains the same...
  const isFormValid = useMemo(() => {
    return formData.email.trim() !== "" && formData.password.trim() !== "";
  }, [formData.email, formData.password]);

  const buttonClasses = useMemo(() => {
    const baseClasses =
      "w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200";
    const enabledClasses =
      "bg-[#06A9CA] hover:bg-[#0891b3] transform hover:-translate-y-0.5";
    const disabledClasses = "bg-gray-300 text-gray-500 cursor-not-allowed";

    return `${baseClasses} ${
      !isFormValid || isLoading ? disabledClasses : enabledClasses
    }`;
  }, [isFormValid, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#06A9CA] to-[#0891b3] p-5">
      <div className="bg-white pt-10 pl-10 pr-10 pb-2 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p>Sign in to your Classic Wines account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#06A9CA] focus:ring-[#06A9CA] focus:ring-opacity-20 focus:ring-2 transition-colors duration-200"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold mb-2"
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
              autoComplete="current-password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#06A9CA] focus:ring-[#06A9CA] focus:ring-opacity-20 focus:ring-2 transition-colors duration-200"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg border-l-4 border-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={buttonClasses}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <footer className="text-center py-4 pt-6 text-[#00B3CC] text-sm font-medium opacity-80 flex items-center justify-center">
          Powered by
          <Image
            src="/logo.svg"
            alt="Tech Sierra Logo"
            width={48}
            height={32}
            className="object-contain ml-2"
            priority={false}
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCA0OCAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjMyIiBmaWxsPSIjZjNmNGY2Ii8+Cjwvc3ZnPgo="
          />
        </footer>
      </div>
    </div>
  );
}