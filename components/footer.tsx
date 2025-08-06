import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-500">
            <p>&copy; {currentYear} Business Dashboard. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}