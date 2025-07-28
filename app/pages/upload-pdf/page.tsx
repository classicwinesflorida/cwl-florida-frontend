"use client";
import { FileText } from "lucide-react";
import { useSearchParams } from "next/navigation";

// Optional: Helper to make the name look nice
function toTitleCase(str: string): string {
    if (!str) return "";
    return str.replace(/\w\S*/g, (txt: string) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

export default function SmsPoForm() {
  const searchParams = useSearchParams();
  const userName = searchParams.get("user_name");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      console.log("No file selected");
      return;
    }
    const file = files[0];
    console.log("File selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toLocaleString(),
    });
    if (file.type !== "application/pdf") {
      console.error("Invalid file type:", file.type);
      alert("Please upload a PDF file only");
      e.target.value = "";
      return;
    }
    console.log("Valid PDF file selected:", file.name);
  };

  return (
    <div className="min-h-screen bg-[#F6F7FA] flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl mx-auto">
        {/* Top Bar */}
        <div className="rounded-t-xl bg-[#00B3CC] py-3 px-4 flex justify-between items-center">
          <h2 className="text-white text-lg font-semibold text-center flex-1">
            {userName
              ? `${toTitleCase(userName)} Dashboard`
              : "Customer Dashboard"}
          </h2>
        </div>
        {/* Main Card */}
        <div className="bg-white rounded-b-xl shadow-lg flex flex-col">
          <div className="p-8 flex-1 flex flex-col">
            <h2 className="text-center text-2xl font-bold text-[#00B3CC] mb-6">
              Classic Wines Florida - Invoice Creator
            </h2>
            <div className="mb-4">
              <label className="text-[#00B3CC] font-medium mb-2 flex items-center gap-2">
                <FileText className="text-[#00B3CC]" size={22} />
                PDF Upload
              </label>
              <div className="border-2 border-dashed border-[#00B3CC] rounded-lg p-8 text-center bg-[#F6F7FA]">
                <p className="text-[#2B3A67] mb-4">Drag and drop your PDF here</p>
                <p className="text-[#00B3CC] text-sm mb-4">or</p>
                <label className="bg-[#00B3CC] hover:bg-[#0090A3] text-white px-6 py-2 rounded-lg inline-block cursor-pointer font-semibold transition-colors">
                  Select PDF File
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="text-[#00B3CC] text-xs mt-2 opacity-80">
                  Only PDF files accepted
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Footer - Powered by + Logo */}
        <footer className="text-center py-4 text-[#00B3CC] text-sm font-medium opacity-80 flex items-center justify-center">
          Powered by
          <img
            src="/logo.png"
            alt="Tech Sierra Logo"
            className="w-12 h-8 object-contain ml-2"
          />
        </footer>
      </div>
    </div>
  );
}