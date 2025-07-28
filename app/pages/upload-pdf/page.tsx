"use client";
import { FileText } from "lucide-react";

export default function SmsPoForm() {
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
        <div className="rounded-t-xl bg-[#5B6AC7] py-3 px-4 flex justify-between items-center">
          <h2 className="text-white text-lg font-semibold text-center flex-1">
            Customer Dashboard
          </h2>
        </div>
        {/* Main Card */}
        <div className="bg-white rounded-b-xl shadow-lg flex flex-col">
          <div className="p-8 flex-1 flex flex-col">
            <h2 className="text-center text-2xl font-bold text-[#5B6AC7] mb-6">
              Classic Wines Florida - Invoice Creator
            </h2>
            <div className="mb-4">
              <label className="text-[#5B6AC7] font-medium mb-2 flex items-center gap-2">
                <FileText className="text-[#5B6AC7]" size={22} />
                PDF Upload
              </label>
              <div className="border-2 border-dashed border-[#5B6AC7] rounded-lg p-8 text-center bg-[#F6F7FA]">
                <p className="text-[#2B3A67] mb-4">Drag and drop your PDF here</p>
                <p className="text-[#5B6AC7] text-sm mb-4">or</p>
                <label className="bg-[#5B6AC7] hover:bg-[#3B4CA7] text-white px-6 py-2 rounded-lg inline-block cursor-pointer font-semibold transition-colors">
                  Select PDF File
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="text-[#5B6AC7] text-xs mt-2 opacity-80">
                  Only PDF files accepted
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <footer className="text-center py-4 text-[#5B6AC7] text-sm font-medium opacity-80">
          Powered by <span className="font-bold">Tech Sierra</span>
        </footer>
      </div>
    </div>
  );
}