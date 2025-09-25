"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  ExternalLink,
  BarChart3,
  PlusCircle,
  Bot,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/header";
import Footer from "@/components/footer";

const zohoLogo = "/zohoo.svg";
const quickbooksLogo = "/quickbooklogoo.svg";

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
  const [loadingCard, setLoadingCard] = useState<string | null>(null);

  const menuItems: MenuItem[] = React.useMemo(
    () => [
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
    ],
    []
  );

  const handleCardClick = useCallback(
    async (item: MenuItem): Promise<void> => {

      if (item.type === "external") {
        window.open(item.url, "_blank", "noopener,noreferrer");
      } else if (item.type === "internal") {
        setLoadingCard(item.title);

        try {
          await router.push(item.url);
        } catch {
          // Handle navigation error silently or add error handling as needed
          setLoadingCard(null);
        }
      }
    },
    [router]
  );

  // Prefetch internal routes on component mount
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.type === "internal") {
        router.prefetch(item.url);
      }
    });
  }, [router, menuItems]);

  return (
    <>
      <Header />
      <div className="h-[84vh] bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-scroll scrollbar-hide [&::-webkit-scrollbar]:hidden">
        <main className="mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Classic Wines Florida{" "}
                <span style={{ color: "#06A9CA" }}>Dashboard</span>
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
                  {/* Loading overlay */}
                  {loadingCard === item.title && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-2xl">
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#06A9CA]" />
                        <p className="text-sm text-gray-600 mt-2">Loading...</p>
                      </div>
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="relative flex flex-col h-full p-6 pl-8">
                    {/* Logo and Title Row */}
                    <div className="flex flex-row items-center w-full">
                      {/* Logo/Icon Container - always white, always same size */}
                      <div className="w-24 h-24 rounded-lg flex items-center justify-center bg-white border border-gray-200">
                        {item.isImage && item.imageSrc ? (
                          <Image
                            src={item.imageSrc}
                            alt={item.title}
                            width={80}
                            height={80}
                            className={
                              item.title === "Go to Zoho Books"
                                ? "object-contain w-20 h-20 scale-125"
                                : "object-contain w-20 h-20"
                            }
                            priority={index < 3} // Prioritize first 3 images
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
      </div>
      <Footer />
    </>
  );
}
