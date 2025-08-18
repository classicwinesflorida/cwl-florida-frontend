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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const dynamic = "force-dynamic";

interface ExtractedData {
  [key: string]: string | number | boolean | null;
}

interface FileProcessingResult {
  filename: string;
  status: "success" | "error" | "skipped";
  documentType?: string;
  detectedType?: string;
  processingMethod?: string;
  data?: ExtractedData[];
  reason?: string;
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
    success?: number;
    moved?: number;
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
  emailDelivery?: {
    sent: boolean;
    error?: string;
  };
  details?: {
    files: FileProcessingResult[];
  };
}

export default function POCreatorClient() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] =
    useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingMode, setProcessingMode] = useState<"single" | "multiple">(
    "single"
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setSelectedFiles([]);
      setProcessingResult(null);
      setError(null);
      return;
    }

    const fileArray = Array.from(files);

    // Validate file types
    const invalidFiles = fileArray.filter(
      (file) => file.type !== "application/pdf"
    );
    if (invalidFiles.length > 0) {
      setError(
        `Invalid file types: ${invalidFiles
          .map((f) => f.name)
          .join(", ")}. Please upload PDF files only.`
      );
      setSelectedFiles([]);
      e.target.value = "";
      return;
    }

    // Validate file sizes (50MB limit per file)
    const maxSize = 50 * 1024 * 1024;
    const oversizedFiles = fileArray.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setError(
        `Files too large: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}. Each file must be less than 50MB.`
      );
      setSelectedFiles([]);
      e.target.value = "";
      return;
    }

    setSelectedFiles(fileArray);
    setError(null);
    setProcessingResult(null);

    // Set processing mode based on number of files
    setProcessingMode(fileArray.length > 1 ? "multiple" : "single");
  };

  const uploadAndProcessPDFs = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setError("Please select PDF file(s) first");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingResult(null);

    try {
      if (processingMode === "single" && selectedFiles.length === 1) {
        // Single file processing
        const formData = new FormData();
        formData.append("pdf", selectedFiles[0]);

        const response = await fetch(`${API_BASE_URL}/api/upload-process-pdf`, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to process PDF");
        }
        setProcessingResult(result);
      } else {
        // Multiple file processing
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append("pdfs", file);
        });

        const response = await fetch(
          `${API_BASE_URL}/api/process-folder-pdfs`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to process PDFs");
        }
        setProcessingResult(result);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setProcessingResult(null);
    setError(null);
    setProcessingMode("single");
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
            PDF Reader
          </h2>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-b-xl shadow-lg flex flex-col">
          <div className="p-8 flex-1 flex flex-col">
            <div className="mb-4">
              <div className="border-2 border-dashed border-[#00B3CC] rounded-lg p-8 text-center bg-[#F6F7FA]">
                <p className="text-[#00B3CC] mb-4">
                  Drag and drop your PDF(s) here
                </p>
                <p className="text-[#00B3CC] text-sm mb-4">or</p>
                <label className="bg-[#00B3CC] hover:bg-[#0090A3] text-white px-6 py-2 rounded-lg inline-block cursor-pointer font-semibold transition-colors">
                  Select PDF File(s)
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                    multiple // Enable multiple file selection
                  />
                </label>
              </div>
              <p className="text-xs text-gray-600 text-center mt-2">
                Select single PDF or multiple PDFs
              </p>
              <p className="text-xs text-red-600 text-center mt-1">
                Only PDF files accepted (Max 50MB each)
              </p>
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

            {/* Selected Files Info */}
            {selectedFiles.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="text-[#5B6AC7]" size={20} />
                  <span className="font-medium text-[#2B3A67]">
                    Selected Files ({selectedFiles.length}):
                  </span>
                  <span className="text-sm text-[#5B6AC7] bg-blue-100 px-2 py-1 rounded">
                    {processingMode === "single"
                      ? "Single Processing"
                      : "Batch Processing"}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-[#2B3A67] truncate flex-1 mr-2">
                        {file.name}
                      </span>
                      <span className="text-[#5B6AC7]">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={uploadAndProcessPDFs}
                    disabled={isProcessing}
                    className="bg-[#5B6AC7] hover:bg-[#3B4CA7] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Processing {selectedFiles.length} file(s)...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Process & Create Invoice
                        {selectedFiles.length > 1 ? "s" : ""}
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

                {/* Single file result */}
                {processingMode === "single" && (
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-[#2B3A67]">
                          Document Type:
                        </span>
                        <p className="text-[#5B6AC7]">
                          {processingResult.processing?.documentType ||
                            processingResult.detectedType ||
                            "Unknown"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-[#2B3A67]">
                          Processing Method:
                        </span>
                        <p className="text-[#5B6AC7]">
                          {processingResult.processing?.processingMethod ||
                            processingResult.processingMethod ||
                            "Unknown"}
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
                      <div>
                        <span className="font-medium text-[#2B3A67]">
                          Email Delivery:
                        </span>
                        <p
                          className={
                            processingResult.emailDelivery?.sent
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {processingResult.emailDelivery?.sent
                            ? "✓ Sent"
                            : "✗ Failed"}
                        </p>
                      </div>
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
                )}

                {/* Multiple files result */}
                {processingMode === "multiple" && (
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {processingResult.processing?.success || 0}
                        </div>
                        <div className="text-green-700">Successful</div>
                      </div>
                      <div className="text-center p-3 bg-blue-100 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {processingResult.zohoProcessing?.success ? 1 : 0}
                        </div>
                        <div className="text-blue-700">Zoho Success</div>
                      </div>
                      <div className="text-center p-3 bg-gray-100 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">
                          {processingResult.processing?.moved || 0}
                        </div>
                        <div className="text-gray-700">Files Moved</div>
                      </div>
                    </div>

                    {processingResult.details?.files &&
                      processingResult.details.files.length > 0 && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-[#5B6AC7] font-medium hover:text-[#3B4CA7]">
                            View File Processing Details (
                            {processingResult.details.files.length} files)
                          </summary>
                          <div className="mt-2 space-y-2">
                            {processingResult.details.files.map(
                              (fileResult, index) => (
                                <div
                                  key={index}
                                  className={`p-3 rounded-lg border ${
                                    fileResult.status === "success"
                                      ? "bg-green-50 border-green-200"
                                      : fileResult.status === "error"
                                      ? "bg-red-50 border-red-200"
                                      : "bg-yellow-50 border-yellow-200"
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="font-medium text-[#2B3A67]">
                                        {fileResult.filename}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        {fileResult.documentType ||
                                          fileResult.detectedType ||
                                          "Unknown"}{" "}
                                        |
                                        {fileResult.processingMethod ||
                                          "Unknown"}{" "}
                                        | Status: {fileResult.status}
                                      </div>
                                      {fileResult.data &&
                                        fileResult.data.length > 0 && (
                                          <div className="text-xs text-[#5B6AC7]">
                                            Records: {fileResult.data.length}
                                          </div>
                                        )}
                                      {fileResult.reason && (
                                        <div className="text-xs text-red-600">
                                          Reason: {fileResult.reason}
                                        </div>
                                      )}
                                    </div>
                                    <div
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        fileResult.status === "success"
                                          ? "bg-green-100 text-green-700"
                                          : fileResult.status === "error"
                                          ? "bg-red-100 text-red-700"
                                          : "bg-yellow-100 text-yellow-700"
                                      }`}
                                    >
                                      {fileResult.status.toUpperCase()}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </details>
                      )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
