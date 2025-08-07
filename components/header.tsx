"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronDown, LogOut, Key } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// --- Separated Password Update Form ---
type PasswordUpdateFormProps = { onClose: () => void };

const PasswordUpdateForm = React.memo(({ onClose }: PasswordUpdateFormProps) => {
  const [data, setData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setData(prev => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (data.newPassword !== data.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${BASE_URL}/api/auth/update-password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        setSuccess("Password updated successfully!");
        setData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => onClose(), 2000);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Network error. Please try again.";
      setError(msg);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Password</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["currentPassword", "newPassword", "confirmPassword"].map((field, idx) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field === "currentPassword"
                    ? "Current Password"
                    : field === "newPassword"
                    ? "New Password"
                    : "Confirm Password"}
                </label>
                <input
                  name={field}
                  type="password"
                  value={(data as any)[field]}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#06A9CA] focus:ring-1 focus:ring-[#06A9CA] bg-white text-black"
                />
              </div>
            ))}
            <div className="md:col-span-3 flex items-center space-x-4">
              <button
                type="submit"
                className="bg-[#06A9CA] hover:bg-[#0891b3] text-white px-6 py-2 rounded-lg"
              >
                Update Password
              </button>
              <button type="button" onClick={onClose} className="text-gray-600 hover:text-gray-800">
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

// --- Header Component ---
interface User {
  name: string;
  email: string;
}

export default function Header() {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setUser({ name: userStr, email: userStr.toLowerCase().replace(/\s/g, ".") });
      }
    } catch {}
  }, []);

  const initials = useMemo(() => (user ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : ""), [user]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      modalRef.current &&
      !modalRef.current.contains(e.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(e.target as Node)
    ) {
      setProfileOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isProfileOpen, handleClickOutside]);

  const handleLogout = () => {
    localStorage.clear();
    setProfileOpen(false);
    router.push("/");
  };

  if (!user) return null;

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div
                className="w-20 h-16 rounded-lg overflow-hidden flex items-center justify-center bg-white cursor-pointer hover:bg-gray-50"
                onClick={() => (window.location.href = "/pages/dashboard")}
              >
                <Image src="/logo.png" alt="Tech Sierra Logo" width={80} height={70} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: "#06A9CA" }}>
                    {initials}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-900">{user.name}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isProfileOpen && (
                  <div
                    ref={modalRef}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 min-w-[315px]"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold" style={{ backgroundColor: "#06A9CA" }}>
                        {initials}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                      </div>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowPwdForm(true);
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Key className="w-4 h-4 text-gray-400" />
                        <span>Update password</span>
                      </button>
                    </div>

                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {isProfileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 sm:hidden"
          onClick={() => setProfileOpen(false)}
        />
      )}

      {showPwdForm && <PasswordUpdateForm onClose={() => setShowPwdForm(false)} />}
    </>
  );
}
