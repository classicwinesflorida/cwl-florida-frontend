export const dynamic = "force-dynamic";
import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Breadcrumb from "@/components/breadcrumb";
import POCreatorClient from "./POCreatorClient";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />
      <div className="h-[5vh]">
        <Breadcrumb />
      </div>
      <main className="flex-1 h-[76vh] overflow-y-scroll scrollbar-hide [&::-webkit-scrollbar]:hidden">
        <POCreatorClient />
      </main>
      <Footer />
    </div>
  );
}
