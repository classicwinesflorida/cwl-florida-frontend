"use client";
import React, { useCallback } from "react";
import { Users, Building, Package, FileText } from "lucide-react";
import Header from "@/components/header";
import Breadcrumb from "@/components/breadcrumb";
import Footer from "@/components/footer";

interface BookingOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  formUrl: string;
  listUrl: string;
}

export default function ManualBookingPage() {
  const bookingOptions: BookingOption[] = [
    {
      id: "customer",
      title: "Customer ",
      description: "Add new customers and view existing customer records",
      icon: <Users className="w-8 h-8" />,
      gradient: "from-blue-500 to-cyan-500",
      formUrl:
        "https://creatorapp.zohopublic.com/gilberto_classicwines/customer-onboarding/form-perma/New_Customer/qqv36f0qOkwQNkDEA7d1DUjP4B8MTQjsBODXH5Vq2FB2GwN32OPGP6vJyuay0CHAsy35WFEN3B1Q5DsB39dJJ5PfGAXp3e660dU5",
      listUrl:
        "https://creatorapp.zohopublic.com/gilberto_classicwines/customer-onboarding/report-perma/All_New_Customer/G0H3YXmk0wMnRD8Jg1eVrQybjtHNXUCpYQVEjkuxe95OtXnyqCAtQr8TYX2OWVErHnTXffbW9eWwHr1hSwMQMMrabrCKZh0Rt0Ed",
    },
    {
      id: "vendor",
      title: "Vendor ",
      description: "Add new vendors and manage existing vendor information",
      icon: <Building className="w-8 h-8" />,
      gradient: "from-green-500 to-teal-500",
      formUrl:
        "https://creatorapp.zohopublic.com/gilberto_classicwines/customer-onboarding/form-perma/Vendor/6dUAJQuqwA9Js4ym5YGGsjYDdgnzazZre1pa6gFMnqRXQ7Okb3DVX30mMuEJtrP85dQE4twyq3waNW9qDnb0aEYPnWP4mk5Pjmaa",
      listUrl:
        "https://creatorapp.zohopublic.com/gilberto_classicwines/customer-onboarding/report-perma/All_Vendors/nYKayS53a9nCR0pEfhZXDeOZmtpS84FusYQSvJk4UPEnmCgWExs8JkvwqgYg8RRmdrway3qBhFMvJRCWxtMXeBxKuTFPTEJmqrPH",
    },
    {
      id: "item",
      title: "Inventory ",
      description: "Add new products or services and view inventory items",
      icon: <Package className="w-8 h-8" />,
      gradient: "from-purple-500 to-pink-500",
      formUrl:
        "https://creatorapp.zohopublic.com/gilberto_classicwines/customer-onboarding/form-perma/Item/byYgX6uGZCSgnFuaU3Zh6Dd1JyrVE675XwsC3EzubA6u3AgqwV4jrpWFF5wHwg9MQPWRwt2OZHsGMpwvw5kzTybgB7RpOyaWhOjS",
      listUrl:
        "https://creatorapp.zohopublic.com/gilberto_classicwines/customer-onboarding/report-perma/Items_List/9Sbu3ZParrmbXEEVUM1jQmDeWtGnHseq3dzpu6GvQGuhNMwrySx5h5HmsqmJGW4U4wwHNgJ456PgGX2SuBy3QT03v9Ta4XtwsqWD",
    },
    {
      id: "invoice",
      title: "Invoice ",
      description: "Create new invoices and view all existing invoices",
      icon: <FileText className="w-8 h-8" />,
      gradient: "from-orange-500 to-red-500",
      formUrl:
        "https://creatorapp.zohopublic.com/gilberto_classicwines/customer-onboarding/form-perma/Invoice/j9NyBVMbzAGyyWCbAG6NG00JGBNAJ0PXu9AsDDzWCuVez6ysJrCgphNXDvCJKaayhdhPeyH3XdCOKntqMeJgBAwSFBUahEBWqBnq",
      listUrl:
        "https://creatorapp.zohopublic.com/gilberto_classicwines/customer-onboarding/report-perma/All_Invoices/5qQRYzHfR6f4vDGARZTgFj1pb3pN73GuHOaEt2jCAq24EtO9PsZv1rTe0jMmUkYVs3krYGKKHdpYzFzFmmfwm0WaCqXDyssuwHez",
    },
  ];

  const handleButtonClick = useCallback((url: string): void => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Header */}
      <Header />
      <Breadcrumb />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Manual <span style={{ color: "#06A9CA" }}>Booking</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            All-in-one manual tools to manage customers, vendors, inventory, and
            invoices.
          </p>
        </div>

        {/* Booking Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {bookingOptions.map((option) => (
            <div
              key={option.id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
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

                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {option.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2 w-full">
                    <button
                      className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-white transition-all duration-200 hover:scale-105"
                      style={{ backgroundColor: "#06A9CA" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleButtonClick(option.formUrl);
                      }}
                    >
                      Create New
                    </button>
                    <button
                      className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-white transition-all duration-200 hover:scale-105"
                      style={{ backgroundColor: "#10B981" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleButtonClick(option.listUrl);
                      }}
                    >
                      View List
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0">
        <Footer />
      </div>
    </div>
  );
}
