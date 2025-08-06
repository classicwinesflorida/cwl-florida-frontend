"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, User, LogOut } from "lucide-react";
import Image from "next/image";
interface User {
  name: string;
  email: string;
}

export default function Header() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Mock user data - replace with your actual user data
  const user = {
    name: "Example User",
    email: "example.user@company.com",
  };
  const TechSierraLogo = () => (
    <div
      className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-colors duration-200"
      onClick={() => (window.location.href = "/")}
      title="Go to Home Page"
    >
      <Image
        src="/logo.png"
        alt="Tech Sierra Logo"
        width={48}
        height={32}
        // className="max-w-full max-h-full object-contain"
      />
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
    // Add your logout logic here
    console.log("Logging out...");
    // Example: redirect to login page, clear tokens, etc.
    setIsProfileModalOpen(false);
  };

  const handleProfileSettings = () => {
    // Add your profile settings logic here
    console.log("Opening profile settings...");
    setIsProfileModalOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <TechSierraLogo />
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
          {/* Right side - Notifications and Profile */}
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

                {/* User Name and Role */}
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
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
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
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={handleProfileSettings}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <User className="w-4 h-4 text-gray-400" />
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
  );
}
