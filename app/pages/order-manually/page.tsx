"use client";

import React, { useState } from "react";
import {
  UserPlus,
  Users,
  Building,
  Building2,
  Package,
  List,
  FileText,
  ScrollText,
  PlusCircle,
} from "lucide-react";
import Header from "@/components/header";

interface BookingOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  type: "form" | "list";
}

interface FormData {
  [key: string]: string;
}

export default function ManualBookingPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({});

  const bookingOptions: BookingOption[] = [
    {
      id: "customer-form",
      title: "Customer Form",
      description: "Add new customer information",
      icon: <UserPlus className="w-8 h-8" />,
      gradient: "from-blue-500 to-cyan-500",
      type: "form",
    },
    {
      id: "customer-list",
      title: "Customer List",
      description: "View and manage existing customers",
      icon: <Users className="w-8 h-8" />,
      gradient: "from-blue-400 to-blue-600",
      type: "list",
    },
    {
      id: "vendor-form",
      title: "Vendor Form",
      description: "Add new vendor information",
      icon: <Building className="w-8 h-8" />,
      gradient: "from-green-500 to-teal-500",
      type: "form",
    },
    {
      id: "vendor-list",
      title: "Vendor List",
      description: "View and manage existing vendors",
      icon: <Building2 className="w-8 h-8" />,
      gradient: "from-green-400 to-green-600",
      type: "list",
    },
    {
      id: "item-form",
      title: "Item Form",
      description: "Add new products or services",
      icon: <Package className="w-8 h-8" />,
      gradient: "from-purple-500 to-pink-500",
      type: "form",
    },
    {
      id: "item-lists",
      title: "Item Lists",
      description: "View and manage inventory items",
      icon: <List className="w-8 h-8" />,
      gradient: "from-purple-400 to-purple-600",
      type: "list",
    },
    {
      id: "invoice-form",
      title: "Invoice Form",
      description: "Create new invoices",
      icon: <FileText className="w-8 h-8" />,
      gradient: "from-orange-500 to-red-500",
      type: "form",
    },
    {
      id: "invoice-lists",
      title: "Invoice Lists",
      description: "View and manage all invoices",
      icon: <ScrollText className="w-8 h-8" />,
      gradient: "from-orange-400 to-red-600",
      type: "list",
    },
  ];

  const handleCardClick = (sectionId: string): void => {
    setActiveSection(sectionId);
    setFormData({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <Header />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Manual <span style={{ color: "#06A9CA" }}>Booking System</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive tools for managing your business operations manually.
            Create and manage customers, vendors, inventory, and invoices.
          </p>
        </div>

        {/* Booking Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {bookingOptions.map((option) => (
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

                  <div
                    className="mt-4 px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor:
                        option.type === "form" ? "#06A9CA" : "#10B981",
                      color: "white",
                    }}
                  >
                    {option.type === "form" ? "Create New" : "View List"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
