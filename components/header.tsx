"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, User, LogOut, Key } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

interface User {
  name: string;
  email: string;
}

export default function Header() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // Get user data from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const userEmail = localStorage.getItem("user") || "";
    if (userData) {
      setUser({
        name: userData,
        email: userEmail || `${userData.toLowerCase().replace(" ", ".")}`,
      });
    }
  }, []);

  const TechSierraLogo = () => (
    <div
      className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-colors duration-200"
      onClick={() => (window.location.href = "/")}
      title="Go to Home Page"
    >
      <Image src="/logo.png" alt="Tech Sierra Logo" width={48} height={32} />
    </div>
  );

  // Function to get user initials
  const getUserInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsProfileModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    setIsProfileModalOpen(false);
    router.push("/");
  };

  const handleProfileSettings = () => {
    setShowUpdatePassword(true);
    setIsProfileModalOpen(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError("");
    setUpdateSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setUpdateError("New passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${BASE_URL}/api/auth/update-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setUpdateSuccess("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setShowUpdatePassword(false), 2000);
      }
    } catch (error: unknown) {
      let errorMessage = "Network error. Please try again.";
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } })
          .response === "object"
      ) {
        errorMessage =
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message || "Network error. Please try again.";
      }
      setUpdateError(errorMessage);
    }
  };

  if (!user) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <TechSierraLogo />
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <TechSierraLogo />
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>

            {/* Right side - Profile */}
            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setIsProfileModalOpen(!isProfileModalOpen)}
                  className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  {/* Profile Avatar with Initials */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                    style={{ backgroundColor: "#06A9CA" }}
                  >
                    {getUserInitials(user.name)}
                  </div>

                  {/* User Name */}
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                  </div>

                  {/* Dropdown Arrow */}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      isProfileModalOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Modal/Dropdown */}
                {isProfileModalOpen && (
                  <div
                    ref={modalRef}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 min-w-[315px]"
                  >
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold"
                          style={{ backgroundColor: "#06A9CA" }}
                        >
                          {getUserInitials(user.name)}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">
                            {user.name}
                          </div>
                          {/* <div className="text-sm text-gray-500">
                            {user.email}
                          </div> */}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleProfileSettings}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Key className="w-4 h-4 text-gray-400" />
                        <span>Update password</span>
                      </button>
                    </div>

                    {/* Logout Section */}
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
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

        {/* Overlay for mobile */}
        {isProfileModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40 sm:hidden"
            onClick={() => setIsProfileModalOpen(false)}
          />
        )}
      </header>

      {/* Password Update Form */}
      {showUpdatePassword && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Password
              </h3>
              <form
                onSubmit={handlePasswordUpdate}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#06A9CA] focus:ring-1 focus:ring-[#06A9CA] bg-white text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#06A9CA] focus:ring-1 focus:ring-[#06A9CA] bg-white text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#06A9CA] focus:ring-1 focus:ring-[#06A9CA] bg-white text-black"
                  />
                </div>

                <div className="md:col-span-3 flex items-center space-x-4">
                  <button
                    type="submit"
                    className="bg-[#06A9CA] hover:bg-[#0891b3] text-white px-6 py-2 rounded-lg transition-colors duration-200"
                  >
                    Update Password
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUpdatePassword(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>

                {updateError && (
                  <div className="md:col-span-3 bg-red-50 text-red-600 p-3 rounded-lg border-l-4 border-red-500">
                    {updateError}
                  </div>
                )}

                {updateSuccess && (
                  <div className="md:col-span-3 bg-green-50 text-green-600 p-3 rounded-lg border-l-4 border-green-500">
                    {updateSuccess}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
