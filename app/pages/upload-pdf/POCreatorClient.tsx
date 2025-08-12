"use client";
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

function toTitleCase(str: string): string {
  if (!str) return "";
  return str.replace(/\w\S*/g, (txt: string) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const dynamic = "force-dynamic";

interface ExtractedData {
  [key: string]: string | number | boolean | null;
}

interface ProcessingResult {
  success: boolean;
  message: string;
  processing: {
    filename: string;
    documentType: string;
    detectedType: string;
    processingMethod: string;
    recordCount: number;
    fileSize: number;
  };
  zohoProcessing: {
    success: boolean;
    error?: string;
  };
  data: ExtractedData[];
  zohoResponse?: Record<string, unknown>;
  metadata: {
    textLength: number;
    hasImages: boolean;
    textPreview: string;
  };
  detectedType: string;
  processingMethod: string;
  recordCount: number;
}

export default function POCreatorClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] =
    useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const userName = searchParams.get("user_name") || null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setSelectedFile(null);
      setProcessingResult(null);
      setError(null);
      return;
    }
    const file = files[0];
    // Validate file type
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file only");
      setSelectedFile(null);
      e.target.value = "";
      return;
    }
    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 50MB");
      setSelectedFile(null);
      e.target.value = "";
      return;
    }
    setSelectedFile(file);
    setError(null);
    setProcessingResult(null);
  };

  const uploadAndProcessPDF = async () => {
    if (!selectedFile) {
      setError("Please select a PDF file first");
      return;
    }
    setIsProcessing(true);
    setError(null);
    setProcessingResult(null);
    try {
      const formData = new FormData();
      formData.append("pdf", selectedFile);
      const response = await fetch(`${API_BASE_URL}/api/upload-process-pdf`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to process PDF");
      }
      setProcessingResult(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setProcessingResult(null);
    setError(null);
    // Reset file input value
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  return (
    <div className="min-h-[75vh] bg-[#F6F7FA] flex flex-col items-center justify-center my-4">
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
              Classic Wines Florida - Po Creator
            </h2>
            <div className="mb-4">
              <label className="text-[#00B3CC] font-medium mb-2 flex items-center gap-2">
                <FileText className="text-[#00B3CC]" size={22} />
                PDF Upload
              </label>
              <div className="border-2 border-dashed border-[#00B3CC] rounded-lg p-8 text-center bg-[#F6F7FA]">
                <p className="text-[#2B3A67] mb-4">
                  Drag and drop your PDF here
                </p>
                <p className="text-[#00B3CC] text-sm mb-4">or</p>
                <label className="bg-[#00B3CC] hover:bg-[#0090A3] text-white px-6 py-2 rounded-lg inline-block cursor-pointer font-semibold transition-colors">
                  Select PDF File
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                  />
                </label>
                <p className="text-[#00B3CC] text-xs mt-2 opacity-80">
                  Only PDF files accepted
                </p>
              </div>
            </div>
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="text-red-500" size={20} />
                <span className="text-red-700">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {/* Selected File Info */}
            {selectedFile && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="text-[#5B6AC7]" size={20} />
                  <span className="font-medium text-[#2B3A67]">
                    Selected File:
                  </span>
                </div>
                <p className="text-[#2B3A67] mb-1">
                  <strong>Name:</strong> {selectedFile.name}
                </p>
                <p className="text-[#2B3A67] mb-4">
                  <strong>Size:</strong> {formatFileSize(selectedFile.size)}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={uploadAndProcessPDF}
                    disabled={isProcessing}
                    className="bg-[#5B6AC7] hover:bg-[#3B4CA7] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Process & Create Invoice
                      </>
                    )}
                  </button>
                  <button
                    onClick={clearSelection}
                    disabled={isProcessing}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <X size={16} />
                    Clear
                  </button>
                </div>
              </div>
            )}
            {/* Processing Results */}
            {processingResult && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="text-green-500" size={20} />
                  <span className="font-semibold text-green-700">
                    Processing Results
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-[#2B3A67]">
                        Document Type:
                      </span>
                      <p className="text-[#5B6AC7]">
                        {processingResult.processing?.documentType ||
                          processingResult.detectedType}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-[#2B3A67]">
                        Processing Method:
                      </span>
                      <p className="text-[#5B6AC7]">
                        {processingResult.processing?.processingMethod ||
                          processingResult.processingMethod}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-[#2B3A67]">
                        Records Found:
                      </span>
                      <p className="text-[#5B6AC7]">
                        {processingResult.processing?.recordCount ||
                          processingResult.recordCount ||
                          0}
                      </p>
                    </div>
                    {processingResult.zohoProcessing && (
                      <div>
                        <span className="font-medium text-[#2B3A67]">
                          Zoho Integration:
                        </span>
                        <p
                          className={
                            processingResult.zohoProcessing.success
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {processingResult.zohoProcessing.success
                            ? "✓ Success"
                            : "✗ Failed"}
                        </p>
                      </div>
                    )}
                  </div>
                  {processingResult.data &&
                    processingResult.data.length > 0 && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-[#5B6AC7] font-medium hover:text-[#3B4CA7]">
                          View Extracted Data ({processingResult.data.length}{" "}
                          items)
                        </summary>
                        <div className="mt-2 p-3 bg-gray-100 rounded-lg max-h-60 overflow-auto">
                          <pre className="text-xs text-[#2B3A67]">
                            {JSON.stringify(processingResult.data, null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}