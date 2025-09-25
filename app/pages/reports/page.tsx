"use client";
import React, { useState } from "react";
import {
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
} from "lucide-react";

interface ReportProgress {
  status: "started" | "processing" | "completed" | "error";
  progress: number;
  message: string;
  data?: unknown[];
  summary?: {
    total_transactions: number;
    total_amount: number;
    unique_customers: number;
    unique_products: number;
    date_range: {
      from: string | null;
      to: string | null;
    };
  };
  csvData?: string;
  error?: string;
  processed?: number;
  total?: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const ZohoReportGenerator: React.FC = () => {
  const [dateFrom, setDateFrom] = useState("2023-01-01");
  const [dateTo, setDateTo] = useState("2023-12-31");
  // const [outputFormat, setOutputFormat] = useState<"csv">("csv");
  const [outputFormat] = useState<"csv">("csv");
  const [isGenerating, setIsGenerating] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [reportProgress, setReportProgress] = useState<ReportProgress | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Utility function to trigger file download
  const triggerDownload = (
    content: string,
    filename: string,
    contentType: string
  ) => {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleStartProgressPolling = (id: string) => {
    startProgressPolling(id, API_BASE_URL, setReportProgress, setIsGenerating);
  };

  const handleGenerateReport = async () => {
    await generateReport(
      dateFrom,
      dateTo,
      outputFormat,
      API_BASE_URL,
      setIsGenerating,
      setError,
      setReportProgress,
      setRequestId,
      handleStartProgressPolling
    );
  };

  const handleDownloadReport = async () => {
    await downloadReport("csv", reportProgress);
  };

  const downloadReport = async (
    format: "csv",
    reportProgress: ReportProgress | null
  ) => {
    console.log("downloadReport called with format:", format);

    if (!reportProgress) {
      console.error("No report progress data available");
      return;
    }

    if (reportProgress.status !== "completed") {
      console.error("Report is not completed yet");
      return;
    }

    try {
      if (format === "csv") {
        if (reportProgress.csvData) {
          // Generate filename with timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const filename = `zoho_transaction_report_${timestamp}.csv`;

          // Trigger download
          triggerDownload(
            reportProgress.csvData,
            filename,
            "text/csv;charset=utf-8;"
          );
          console.log("CSV file downloaded successfully");
        } else {
          console.error("CSV data not available in report progress");
        }
      }
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  const generateReport = async (
    dateFrom: string,
    dateTo: string,
    outputFormat: string,
    API_BASE_URL: string,
    setIsGenerating: (loading: boolean) => void,
    setError: (error: string | null) => void,
    setReportProgress: (progress: ReportProgress | null) => void,
    setRequestId: (id: string) => void,
    startProgressPolling: (id: string) => void
  ) => {
    try {
      setIsGenerating(true);
      setError(null);
      setReportProgress(null);

      const response = await fetch(`${API_BASE_URL}/api/generate-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateFrom,
          dateTo,
          outputFormat,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRequestId(data.requestId);
        startProgressPolling(data.requestId);
      } else {
        console.log("Error response from requestId:", requestId);
        throw new Error(data.error || "Failed to start report generation");
      }
    } catch (err) {
      console.error("Error generating report:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setIsGenerating(false);
    }
  };

  // Enhanced progress polling function to handle the updated response
  const startProgressPolling = (
    requestId: string,
    API_BASE_URL: string,
    setReportProgress: (progress: ReportProgress | null) => void,
    setIsGenerating: (loading: boolean) => void
  ) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/report-progress/${requestId}`
        );
        const data = await response.json();

        if (data.success) {
          const progress: ReportProgress = {
            status: data.status,
            progress: data.progress,
            message: data.message,
            data: data.data,
            summary: data.summary,
            csvData: data.csvData, // Include CSV data from response
            error: data.error,
          };

          setReportProgress(progress);

          if (data.status === "completed" || data.status === "error") {
            clearInterval(pollInterval);
            setIsGenerating(false);
          }
        } else {
          console.error("Error polling progress:", data.error);
          clearInterval(pollInterval);
          setIsGenerating(false);
        }
      } catch (error) {
        console.error("Error polling progress:", error);
        clearInterval(pollInterval);
        setIsGenerating(false);
      }
    }, 2000); // Poll every 2 seconds

    // Clean up interval after 5 minutes to prevent memory leaks
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 5 * 60 * 1000);
  };

  const resetForm = () => {
    setReportProgress(null);
    setRequestId(null);
    setError(null);
    setIsGenerating(false);
  };

  const getStatusIcon = () => {
    if (!reportProgress) return <Clock className="w-5 h-5 text-gray-400" />;

    switch (reportProgress.status) {
      case "started":
      case "processing":
        return <RefreshCw className="w-5 h-5 text-[#06A9CA] animate-spin" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#06A9CA] px-8 py-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-white" />
              <h1 className="text-3xl font-bold text-white">
                Zoho Transaction Report Generator
              </h1>
            </div>
            <p className="text-blue-100 mt-2">
              Generate comprehensive transaction reports from your Zoho Books
              data
            </p>
          </div>

          <div className="p-8">
            {/* Form Section */}
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06A9CA] focus:border-transparent transition-all duration-200 text-gray-900 "
                    disabled={isGenerating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06A9CA] focus:border-transparent transition-all duration-200 text-gray-900"
                    disabled={isGenerating}
                  />
                </div>
              </div>

              {/* <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) =>
                    setOutputFormat(e.target.value as "json" | "csv" | "both")
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06A9CA] focus:border-transparent transition-all duration-200"
                  disabled={isGenerating}
                >
                  <option value="csv">CSV Format</option>
                </select>
              </div> */}

              <div className="flex gap-4">
                <button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="flex-1 bg-gradient-to-r from-[#14c5e9] to-[#06A9CA] hover:bg-[#16c6e9] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <FileText className="w-5 h-5" />
                  {isGenerating ? "Generating Report..." : "Generate Report"}
                </button>

                {(reportProgress || error) && (
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    New Report
                  </button>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-6 mb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="text-red-800 font-semibold">Error occurred</p>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Section */}
            {reportProgress && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  {getStatusIcon()}
                  <h3 className="text-xl font-semibold text-gray-900">
                    Report Status
                  </h3>
                </div>

                <p className="text-gray-700 mb-4 text-lg">
                  {reportProgress.message}
                </p>

                {reportProgress.status === "processing" && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                      <span>Progress</span>
                      <span>{reportProgress.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-[#06A9CA] to-indigo-500 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${reportProgress.progress}%` }}
                      ></div>
                    </div>
                    {reportProgress?.processed !== undefined &&
                      reportProgress?.total !== undefined && (
                        <p className="text-sm text-gray-600 mt-3">
                          Processed{" "}
                          <span className="font-semibold">
                            {reportProgress?.processed}
                          </span>{" "}
                          of{" "}
                          <span className="font-semibold">
                            {reportProgress?.total}
                          </span>{" "}
                          invoices
                        </p>
                      )}
                  </div>
                )}

                {reportProgress.status === "error" && reportProgress.error && (
                  <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">Error Details:</p>
                    <p className="text-red-700">{reportProgress.error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Summary Section */}
            {reportProgress?.summary && (
              <div className="bg-green-50 rounded-xl p-6 mb-6 border border-green-200">
                <h3 className="text-xl font-semibold text-green-800 mb-6 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Report Summary
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* <div className="bg-white rounded-lg p-5 shadow-sm border border-green-100">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Total Transactions
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {reportProgress.summary.total_transactions.toLocaleString()}
                    </p>
                  </div> */}

                  <div className="bg-white rounded-lg p-5 shadow-sm border border-green-100">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Total Amount
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(reportProgress.summary.total_amount)}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-5 shadow-sm border border-green-100">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Customers
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {reportProgress.summary.unique_customers.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-5 shadow-sm border border-green-100">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Unique Products
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {reportProgress.summary.unique_products.toLocaleString()}
                    </p>
                  </div>
                </div>

                {reportProgress.summary.date_range.from &&
                  reportProgress.summary.date_range.to && (
                    <div className="bg-white rounded-lg p-5 shadow-sm border border-green-100">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Date Range
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatDate(reportProgress.summary.date_range.from)} to{" "}
                        {formatDate(reportProgress.summary.date_range.to)}
                      </p>
                    </div>
                  )}
              </div>
            )}

            {/* Download Section */}
            {reportProgress?.status === "completed" && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-semibold text-[#06A9CA] mb-4 flex items-center gap-2">
                  <Download className="w-6 h-6" />
                  Download Your Report
                </h3>

                <p className="text-[#06A9CA] mb-6">
                  Your report has been generated successfully.
                </p>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleDownloadReport}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    Download CSV
                  </button>
                </div>

                {/* {reportProgress.data && (
                  <p className="text-sm text-[#06A9CA] mt-4">
                    Report contains{" "}
                    {reportProgress.data.length.toLocaleString()} transaction
                    records
                  </p>
                )} */}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">Powered by Tech Sierra</p>
        </div>
      </div>
    </div>
  );
};

export default ZohoReportGenerator;
