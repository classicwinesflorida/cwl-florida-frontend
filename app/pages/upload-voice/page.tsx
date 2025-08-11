export const dynamic = "force-dynamic";
import React from "react";
import Breadcrumb from "@/components/breadcrumb";
import POCreatorClient from "./POCreatorClient";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Breadcrumb />
      <main className="flex-1">
        <POCreatorClient />
      </main>
    </div>
  );
}