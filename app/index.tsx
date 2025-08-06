"use client";
import React from "react";
import {
  ExternalLink,
  BookOpen,
  BarChart3,
  PlusCircle,
  Bot,
  Calculator,
} from "lucide-react";
import Header from "@/components/header";
import { useRouter } from "next/navigation";
import Footer from "@/components/footer";

interface MenuItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  gradient: string;
  type: "external" | "internal";
}

export default function Home() {
  const router = useRouter();
  const menuItems: MenuItem[] = [
    {
      title: "Go to Zoho Books",
      description: "Access your Zoho Books accounting platform",
      icon: <BookOpen className="w-8 h-8" />,
      url: "https://accounts.zoho.com/signin?servicename=ZohoBooks&signupurl=https://www.zoho.com%2fin/books/signup/",
      gradient: "from-blue-500 to-cyan-500",
      type: "external",
    },
    {
      title: "Go to Quick Books",
      description: "Navigate to your QuickBooks dashboard",
      icon: <Calculator className="w-8 h-8" />,
      url: "https://accounts.intuit.com/app/sign-in?app_group=QBO&asset_alias=Intuit.accounting.core.qbowebapp&locale=en-ROW&state=%7B%22queryParams%22%3A%7B%22locale%22%3A%22en-ROW%22%7D%7D&app_environment=prod",
      gradient: "from-green-500 to-teal-500",
      type: "external",
    },
    {
      title: "Book an Order Manually",
      description: "Create and manage orders manually",
      icon: <PlusCircle className="w-8 h-8" />,
      url: "pages/order-manually", // Replace with your actual route
      gradient: "from-purple-500 to-pink-500",
      type: "internal",
    },
    {
      title: "Check Zoho Reports",
      description: "View detailed analytics and reports",
      icon: <BarChart3 className="w-8 h-8" />,
      url: "https://reports.zoho.com",
      gradient: "from-orange-500 to-red-500",
      type: "external",
    },
    {
      title: "Let AI Book My Order",
      description: "Use AI assistance to automate order booking",
      icon: <Bot className="w-8 h-8" />,
      url: "pages/ai-page", // This should be your AI page route
      gradient: "from-indigo-500 to-purple-500",
      type: "internal",
    },
  ];

  const handleCardClick = (item: MenuItem): void => {
    if (item.type === "external") {
      // Open external URLs in new tab
      window.open(item.url, "_blank", "noopener,noreferrer");
    } else if (item.type === "internal") {
      // Navigate to internal routes using Next.js router
      router.push(item.url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 hide-scrollbar overflow-hidden">
      {/* Header */}
      <Header />
      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Classic Wines <span style={{ color: "#06A9CA" }}>Dashboard</span>
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(item)}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Card Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              ></div>

              {/* Card Content */}
              <div className="relative p-8">
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="p-3 rounded-xl text-white"
                    style={{ backgroundColor: "#06A9CA" }}
                  >
                    {item.icon}
                  </div>
                  {/* <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" /> */}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800">
                  {item.title}
                </h3>

                <p className="text-gray-600 leading-relaxed mb-6">
                  {item.description}
                </p>

                <div className="flex items-center justify-end">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: "#06A9CA" }}
                  >
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Hover Border Effect */}
              <div
                className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-opacity-20 transition-all duration-300"
                style={{ borderColor: "#06A9CA" }}
              ></div>
            </div>
          ))}
        </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
