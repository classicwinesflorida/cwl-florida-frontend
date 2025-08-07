"use client";
import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive: boolean;
}

export default function Breadcrumb() {
  const router = useRouter();
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname
      .split("/")
      .filter((segment) => segment !== "");
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: "Home",
        href: "/pages/dashboard",
        isActive: false,
      },
    ];

    // Map path segments to readable labels
    const pathLabels: { [key: string]: string } = {
      pages: "",
      "ai-page": "AI Tools",
      "order-manually": "Manual Booking",
      "po-sms-text": "SMS Text Processing",
      "po-sms-screenshot": "SMS Screenshot Processing",
      "upload-pdf": "PDF Upload",
      "upload-voice": "Voice Upload",
    };

    // Dynamically get AI tool pages from pathLabels (exclude 'pages', 'ai-page', 'order-manually')
    const excludedPages = ["pages", "ai-page", "order-manually"];
    const aiToolPages = Object.keys(pathLabels).filter(
      (page) => pathLabels[page] !== "" && !excludedPages.includes(page)
    );
    const isAiToolPage = pathSegments.some((segment) =>
      aiToolPages.includes(segment)
    );

    // If it's an AI tool page, add AI Tools breadcrumb first
    if (isAiToolPage) {
      breadcrumbs.push({
        label: "AI Tools",
        href: "/pages/ai-page",
        isActive: false,
      });
    }

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = pathLabels[segment];

      // Only add breadcrumb if there's a label (skip 'pages' segment)
      if (label) {
        breadcrumbs.push({
          label,
          href: currentPath,
          isActive: index === pathSegments.length - 1,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleBreadcrumbClick = (href: string, isActive: boolean) => {
    if (!isActive) {
      console.log("Navigating to:", href);
      router.push(href);
    }
  };

  // Don't render breadcrumbs on home page
  if (pathname === "/") {
    return null;
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
              <button
                onClick={() => handleBreadcrumbClick(item.href, item.isActive)}
                className={`flex items-center space-x-1 transition-colors duration-200 ${
                  item.isActive
                    ? "text-gray-900 font-medium cursor-default"
                    : "text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                }`}
                disabled={item.isActive}
              >
                {index === 0 && <Home className="w-4 h-4" />}
                <span>{item.label}</span>
              </button>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
