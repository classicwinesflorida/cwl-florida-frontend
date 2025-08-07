"use client";
import React from "react";
import {
  ExternalLink,
  BarChart3,
  PlusCircle,
  Bot
} from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";

// Logo image paths
const zohoLogo = "/zohoo.png";
const quickbooksLogo = "/quickbooklogoo.png";

interface MenuItem {
  title: string;
  description: string;
  icon?: React.ReactNode;
  url: string;
  type: "external" | "internal";
  isImage?: boolean;
  imageSrc?: string;
}

export default function Dashboard() {
  const router = useRouter();

  const menuItems: MenuItem[] = [
    {
      title: "Go to Zoho Books",
      description: "Access your Zoho Books accounting platform",
      isImage: true,
      imageSrc: zohoLogo,
      url: "https://accounts.zoho.com/signin?servicename=ZohoBooks&signupurl=https://www.zoho.com%2fin/books/signup/",
      type: "external",
    },
    {
      title: "Go to Quick Books",
      description: "Navigate to your QuickBooks dashboard",
      isImage: true,
      imageSrc: quickbooksLogo,
      url: "https://accounts.intuit.com/app/sign-in?app_group=QBO&asset_alias=Intuit.accounting.core.qbowebapp&locale=en-ROW&state=%7B%22queryParams%22%3A%7B%22locale%22%3A%22en-ROW%22%7D%7D&app_environment=prod",
      type: "external",
    },
    {
      title: "Book an Order Manually",
      description: "Create and manage orders manually",
      icon: <PlusCircle className="w-20 h-20 text-[#8e24aa]" />,
      url: "/pages/order-manually",
      type: "internal",
    },
    {
      title: "Check Zoho Reports",
      description: "View detailed analytics and reports",
      icon: <BarChart3 className="w-20 h-20 text-[#fb8c00]" />,
      url: "https://books.zoho.com/app/889334426#/reports",
      type: "external",
    },
    {
      title: "Let AI Book My Order",
      description: "Use AI assistance to automate order booking",
      icon: <Bot className="w-20 h-20 text-[#3949ab]" />,
      url: "/pages/ai-page",
      type: "internal",
    },
  ];

  const handleCardClick = (item: MenuItem): void => {
    if (item.type === "external") {
      window.open(item.url, "_blank", "noopener,noreferrer");
    } else if (item.type === "internal") {
      router.push(item.url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <Header />

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Classic Wines <span style={{ color: "#06A9CA" }}>Dashboard</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handleCardClick(item)}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden"
                style={{ minHeight: "220px" }}
              >
                {/* Card Content */}
                <div className="relative flex flex-col h-full p-6 pl-8">
                  {/* Logo and Title Row */}
                  <div className="flex flex-row items-center w-full">
                    {/* Logo/Icon Container - always white, always same size */}
                    <div className="w-24 h-24 rounded-lg flex items-center justify-center bg-white border border-gray-200">
                      {item.isImage && item.imageSrc ? (
                        <img
                          src={item.imageSrc}
                          alt={item.title}
                          className={
                            item.title === "Go to Zoho Books"
                              ? "object-contain w-20 h-20 scale-125"
                              : "object-contain w-20 h-20"
                          }
                        />
                      ) : (
                        item.icon
                      )}
                    </div>
                    {/* Title */}
                    <h3 className="text-3xl font-bold text-gray-900 ml-8">
                      {item.title}
                    </h3>
                  </div>
                  {/* Subtitle/Description */}
                  <p className="text-gray-600 leading-relaxed mt-4 text-lg">
                    {item.description}
                  </p>
                  {/* External Link Icon at Bottom Right */}
                  <div className="absolute bottom-4 right-4">
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
      <Footer />
    </div>
  );
}