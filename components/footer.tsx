import React from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 h-[8vh] flex justify-center items-center">
      <div className="max-w-7xl mx-auto">
        <div className="text-center text-gray-500 flex items-center gap-2">
          <p>Copyright &copy; {currentYear}</p>
          <a
            href="https://techsierra.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/logo.svg"
              alt="Tech Sierra Logo"
              className="h-5 inline-block"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
