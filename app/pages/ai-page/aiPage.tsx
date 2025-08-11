"use client";
import React, { useCallback, useState } from "react";
import { MessageSquare, Camera, FileText, Mic, Loader2 } from "lucide-react";
import Breadcrumb from "@/components/breadcrumb";
import { useRouter } from "next/navigation";

export default function AIPage() {
  const router = useRouter();
  const [loadingOption, setLoadingOption] = useState<string | null>(null);

  const readerOptions = [
    {
      id: "text",
      title: "Text Message Reader",
      description: "Enter invoice details here...",
      icon: <MessageSquare className="w-8 h-8" />,
      gradient: "from-blue-500 to-cyan-500",
      acceptedFiles: "text/*",
    },
    {
      id: "screenshot",
      title: "Screenshot Reader",
      description: "Upload screenshot of invoice or proof",
      icon: <Camera className="w-8 h-8" />,
      gradient: "from-green-500 to-teal-500",
      acceptedFiles: "image/*",
    },
    {
      id: "pdf",
      title: "PDF Reader",
      description: "Upload PDF invoice or attachment",
      icon: <FileText className="w-8 h-8" />,
      gradient: "from-purple-500 to-pink-500",
      acceptedFiles: ".pdf",
    },
    {
      id: "voice",
      title: "Voice Recording Reader",
      description: "Record or upload voice notes for invoice detail",
      icon: <Mic className="w-8 h-8" />,
      gradient: "from-orange-500 to-red-500",
      acceptedFiles: "audio/*",
    },
  ];

  const handleCardClick = useCallback(
    async (optionId: string) => {
      const routes: { [key: string]: string } = {
        text: "/pages/po-sms-text",
        screenshot: "/pages/po-sms-screenshot",
        pdf: "/pages/upload-pdf",
        voice: "/pages/upload-voice",
      };

      const route = routes[optionId];
      if (route) {
        console.log("route:", route);

        // Show loading state immediately
        setLoadingOption(optionId);

        try {
          // Use router.push with prefetch
          await router.push(route);
        } catch (error) {
          console.error("Navigation error:", error);
          setLoadingOption(null);
        }
      }
    },
    [router]
  );

  // Prefetch routes on component mount
  React.useEffect(() => {
    const routes = [
      "/pages/po-sms-text",
      "/pages/po-sms-screenshot",
      "/pages/upload-pdf",
      "/pages/upload-voice",
    ];

    routes.forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Breadcrumb />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Smart <span style={{ color: "#06A9CA" }}>Invoice Generator</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            An intelligent tool that creates accurate and customized invoices
            with minimal input.
          </p>
        </div>

        {/* Reader Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {readerOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleCardClick(option.id)}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Loading overlay */}
              {loadingOption === option.id && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-2xl">
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#06A9CA]" />
                    <p className="text-sm text-gray-600 mt-2">Loading...</p>
                  </div>
                </div>
              )}

              <div
                className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              ></div>

              <div className="relative p-6">
                <div className="flex flex-col items-center text-center">
                  <div
                    className="p-4 rounded-xl text-white mb-4 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: "#06A9CA" }}
                  >
                    {option.icon}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {option.title}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
