"use client";
import React, { useState, useCallback } from "react";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface PasswordUpdateFormProps {
  onClose: () => void;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordUpdateForm = React.memo(({ onClose }: PasswordUpdateFormProps) => {
  const [data, setData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Track visibility for each field
  const [show, setShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const toggleShow = (field: keyof PasswordData) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setData((prev) => ({ ...prev, [name]: value }));
      if (error) setError("");
    },
    [error]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (data.newPassword !== data.confirmPassword) {
      setError("New passwords do not match");
      setIsLoading(false);
      return;
    }

    if (data.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please login again.");
        setIsLoading(false);
        return;
      }

      const res = await axios.put(
        `${BASE_URL}/api/auth/update-password`,
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        setSuccess("Password updated successfully!");
        setData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => onClose(), 2000);
      }
    } catch (err: unknown) {
      type AxiosErrorResponse = {
        response?: {
          data?: {
            message?: string;
            error?: string;
          };
        };
      };
      const errorObj = err as AxiosErrorResponse;
      let msg = "Network error. Please try again.";

      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof errorObj.response === "object" &&
        errorObj.response !== null &&
        "data" in errorObj.response
      ) {
        const data = errorObj.response?.data;
        msg = data?.message || data?.error || msg;
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setError("");
    setSuccess("");
    onClose();
  };

  // Inline SVG icons
  const EyeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
  const EyeSlashIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.54-7a9.97 9.97 0 011.67-3.043m2.924-2.924A9.972 9.972 0 0112 5c4.477 0 8.268 2.943 9.54 7a9.97 9.97 0 01-1.67 3.043m-2.924 2.924L15 15m0 0a3 3 0 11-4.243-4.243A3 3 0 0115 15z" />
    </svg>
  );

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Password</h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(
              [
                { field: "currentPassword", label: "Current Password" },
                { field: "newPassword", label: "New Password" },
                { field: "confirmPassword", label: "Confirm Password" },
              ] as const
            ).map(({ field, label }) => (
              <div key={field} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  name={field}
                  type={show[field] ? "text" : "password"}
                  value={data[field]}
                  onChange={handleChange}
                  required
                  minLength={6}
                  disabled={isLoading}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-[#06A9CA] focus:ring-1 focus:ring-[#06A9CA] bg-white text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
                <button
                  type="button"
                  onClick={() => toggleShow(field)}
                  className="absolute inset-y-0 right-3 flex items-start pt-[34px] text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {show[field] ? EyeSlashIcon : EyeIcon}
                </button>
              </div>
            ))}

            <div className="md:col-span-3 flex items-center space-x-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#06A9CA] hover:bg-[#0891b3] text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Cancel
              </button>
            </div>

            {error && (
              <div className="md:col-span-3 bg-red-50 text-red-600 p-3 rounded-lg border-l-4 border-red-500">
                {error}
              </div>
            )}

            {success && (
              <div className="md:col-span-3 bg-green-50 text-green-600 p-3 rounded-lg border-l-4 border-green-500">
                {success}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
});

PasswordUpdateForm.displayName = "PasswordUpdateForm";
export default PasswordUpdateForm;