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

const PasswordUpdateForm = React.memo(
  ({ onClose }: PasswordUpdateFormProps) => {
    const [data, setData] = useState<PasswordData>({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
        // Clear errors when user starts typing
        if (error) setError("");
      },
      [error]
    );

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      setIsLoading(true);

      // Validation
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
        let msg = "Network error. Please try again.";

        type AxiosErrorResponse = {
          response?: {
            data?: {
              message?: string;
              error?: string;
              [key: string]: unknown;
            };
          };
        };

        const errorObj = err as AxiosErrorResponse;

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

    return (
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Password
            </h3>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {(
                [
                  { field: "currentPassword", label: "Current Password" },
                  { field: "newPassword", label: "New Password" },
                  { field: "confirmPassword", label: "Confirm Password" },
                ] as const
              ).map(({ field, label }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    name={field}
                    type="password"
                    value={data[field]}
                    onChange={handleChange}
                    required
                    minLength={6}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#06A9CA] focus:ring-1 focus:ring-[#06A9CA] bg-white text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
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
  }
);

PasswordUpdateForm.displayName = "PasswordUpdateForm";

export default PasswordUpdateForm;
