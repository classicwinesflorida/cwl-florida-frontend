"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { ChevronDown, LogOut, Key } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PasswordUpdateForm from "./PasswordUpdateForm";

interface User {
  name: string;
  email: string;
}

// Pre-load user data to prevent delays
const preloadUserData = (): User | null => {
  if (typeof window === "undefined") return null;

  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return {
        name: userStr,
        email: userStr.toLowerCase().replace(/\s/g, "."),
      };
    }
  } catch (error) {
    console.error("Error preloading user data:", error);
  }
  return null;
};

export default function PerformanceHeader() {
  // Initialize with preloaded data to prevent loading states
  const [user, setUser] = useState<User | null>(() => preloadUserData());
  const [isProfileOpen, setProfileOpen] = useState<boolean>(false);
  const [showPwdForm, setShowPwdForm] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // Handle mounting and ensure user data is available
  useEffect(() => {
    setIsMounted(true);

    // Double-check user data after mount
    if (!user && typeof window !== "undefined") {
      const userData = preloadUserData();
      if (userData) {
        setUser(userData);
      }
    }
  }, [user]);

  // Generate user initials
  const initials = useMemo(() => {
    if (!user) return "";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user]);

  // Optimized click outside handler
  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as Node;
    if (
      modalRef.current &&
      !modalRef.current.contains(target) &&
      buttonRef.current &&
      !buttonRef.current.contains(target)
    ) {
      setProfileOpen(false);
    }
  }, []);

  // Add/remove event listeners with proper cleanup
  useEffect(() => {
    if (isProfileOpen && isMounted) {
      // Use capture phase for better performance
      document.addEventListener("mousedown", handleClickOutside, {
        capture: true,
      });
      return () => {
        document.removeEventListener("mousedown", handleClickOutside, {
          capture: true,
        });
      };
    }
  }, [isProfileOpen, handleClickOutside, isMounted]);

  // Immediate profile toggle without delays
  const handleProfileToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Ensure immediate state update
    setProfileOpen((current) => {
      const newState = !current;
      // Force immediate DOM update
      requestAnimationFrame(() => {
        if (buttonRef.current) {
          buttonRef.current.setAttribute("aria-expanded", String(newState));
        }
      });
      return newState;
    });
  }, []);

  // Handle user logout
  const handleLogout = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.clear();
      }
      setProfileOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
      router.push("/");
    }
  }, [router]);

  // Handle logo click navigation
  const handleLogoClick = useCallback(() => {
    router.push("/pages/dashboard");
  }, [router]);

  // Handle password update
  const handlePasswordUpdate = useCallback(() => {
    setShowPwdForm(true);
    setProfileOpen(false);
  }, []);

  // Handle password form close
  const handlePasswordFormClose = useCallback(() => {
    setShowPwdForm(false);
  }, []);

  // Early return if not mounted (SSR safety)
  if (!isMounted) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-20 h-16 rounded-lg overflow-hidden flex items-center justify-center bg-white">
                <Image
                  src="/logo.png"
                  alt="Tech Sierra Logo"
                  width={80}
                  height={70}
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-[#06A9CA]"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Don't render if no user
  if (!user) return null;

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div
                className="w-20 h-16 rounded-lg overflow-hidden flex items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                onClick={handleLogoClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleLogoClick();
                  }
                }}
              >
                <Image
                  src="/logo.png"
                  alt="Tech Sierra Logo"
                  width={80}
                  height={70}
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>

            {/* User Profile Dropdown */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={handleProfileToggle}
                  className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#06A9CA] focus:ring-opacity-50 active:bg-gray-200"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                  type="button"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold select-none"
                    style={{ backgroundColor: "#06A9CA" }}
                  >
                    {initials}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-900 select-none">
                    {user.name}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-150 select-none ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div
                    ref={modalRef}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 min-w-[315px]"
                    style={{
                      animation: "fadeIn 150ms ease-out forwards",
                      transformOrigin: "top right",
                    }}
                  >
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center space-x-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold select-none"
                        style={{ backgroundColor: "#06A9CA" }}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handlePasswordUpdate}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 active:bg-gray-100"
                        type="button"
                      >
                        <Key className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>Update password</span>
                      </button>
                    </div>

                    {/* Logout Section */}
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 active:bg-red-100"
                        type="button"
                      >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
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

      {/* Mobile Overlay */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 sm:hidden"
          onClick={() => setProfileOpen(false)}
          style={{ animation: "fadeIn 150ms ease-out forwards" }}
        />
      )}

      {/* Password Update Form */}
      {showPwdForm && <PasswordUpdateForm onClose={handlePasswordFormClose} />}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
}
