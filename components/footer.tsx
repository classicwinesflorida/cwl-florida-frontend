import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 h-[8vh] flex justify-center items-center">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-500">
            <p>Copyright &copy; {currentYear} Tech Sierra.</p>
          </div>
        </div>
    </footer>
  );
}