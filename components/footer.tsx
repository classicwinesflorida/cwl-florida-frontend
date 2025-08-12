import Image from "next/image";
import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 h-[8vh] flex justify-center items-center">
      <div className="max-w-7xl mx-auto">
        <div className="text-center text-gray-500">
          <span className="flex items-center justify-center gap-2">
            Copyright &copy; {currentYear}{" "}
            <Image
              src="/logo.svg"
              alt="Tech Sierra Logo"
              width={60}
              height={50}
              priority
            />
          </span>
        </div>
      </div>
    </footer>
  );
}
