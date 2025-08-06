"use client";
import React, { useState, useRef } from "react";
import { MessageSquare, Camera, FileText, Mic } from "lucide-react";
import Header from "@/components/header";

export default function AIPage() {
  const [activeReader, setActiveReader] = useState(null);
  const recordingInterval = useRef(null);

  const readerOptions = [
    {
      id: "text",
      title: "Text Message Reader",
      description: "Analyze and extract insights from text messages",
      icon: <MessageSquare className="w-8 h-8" />,
      gradient: "from-blue-500 to-cyan-500",
      acceptedFiles: "text/*",
    },
    {
      id: "screenshot",
      title: "Screenshot Reader",
      description: "Extract text and data from screenshots",
      icon: <Camera className="w-8 h-8" />,
      gradient: "from-green-500 to-teal-500",
      acceptedFiles: "image/*",
    },
    {
      id: "pdf",
      title: "PDF Reader",
      description: "Read and analyze PDF documents",
      icon: <FileText className="w-8 h-8" />,
      gradient: "from-purple-500 to-pink-500",
      acceptedFiles: ".pdf",
    },
    {
      id: "voice",
      title: "Voice Recording Reader",
      description: "Convert speech to text and analyze audio",
      icon: <Mic className="w-8 h-8" />,
      gradient: "from-orange-500 to-red-500",
      acceptedFiles: "audio/*",
    },
  ];

  const handleCardClick = (readerId) => {
    setActiveReader(readerId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered <span style={{ color: "#06A9CA" }}>Invoice Creator</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Use our AI tools to analyze text, images, PDFs, and voice recordings
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
