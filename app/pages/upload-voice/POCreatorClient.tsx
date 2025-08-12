"use client";
import { useEffect, useState, useRef } from "react";
import {
  FileText,
  Edit3,
  Send,
  CheckCircle,
  Mic,
  StopCircle,
  Upload,
  X,
  AlertTriangle,
  Volume2,
  Lightbulb
} from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown";
import { useSearchParams } from "next/navigation";

interface POItem {
  id: string;
  product: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
}

interface POData {
  id: string;
  customerName: string;
  customerDetails: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    contact_id?: string;
  };
  items: POItem[];
  totalAmount: number;
  date: string;
  status: "draft" | "ready" | "sent";
}

interface ZohoItem {
  item_id: string;
  name: string;
  rate?: number;
}

interface Customer {
  contact_id: string;
  contact_name: string;
  phone?: string;
  mobile?: string;
  email?: string;
  billing_address?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
}

interface DropdownOption {
  item_id: string;
  name: string;
  rate?: number;
  customer?: Customer;
}

interface ApiResponseItem {
  item_description?: string;
  zoho_item_name?: string;
  quantity?: number;
  unit_price?: number;
  total?: number;
}

interface ApiResponse {
  purchase_order: {
    po_number?: string;
    customer_name?: string;
    items: ApiResponseItem[];
    total_amount?: number;
    order_date?: string;
    zoho_customer_match?: {
      contact_name: string;
      phone?: string;
      email?: string;
      cf_email?: string;
      contact_id: string;
    };
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function toTitleCase(str: string): string {
  if (!str) return "";
  return str.replace(/\w\S*/g, (txt: string) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

export const dynamic = "force-dynamic";

export default function POCreatorClient() {
  const searchParams = useSearchParams();
  const userName = searchParams.get("user_name");
  const [inputText, setInputText] = useState<string>("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [poData, setPOData] = useState<POData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [zohoItems, setZohoItems] = useState<ZohoItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Generate unique ID for new items
  const generateUniqueId = (): string => {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoadingCustomers(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/customers`, {
          method: "GET",
          mode: "cors",
        });
        const data = await response.json();
        setCustomers(data || []);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    if (isEditing) {
      fetchCustomers();
    }
  }, [isEditing]);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoadingItems(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/items`, {
          method: "GET",
          mode: "cors",
        });
        const data = await response.json();
        setZohoItems(data || []);
      } catch (error) {
        console.error("Failed to fetch Zoho items:", error);
      } finally {
        setIsLoadingItems(false);
      }
    };

    if (isEditing) {
      fetchItems();
    }
  }, [isEditing]);

  // --- Voice Recording Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioFile = new File([audioBlob], "recording.wav", {
          type: "audio/wav",
        });
        setAudioFile(audioFile);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Recording error:", error);
      alert("Could not start recording. Please ensure microphone access is granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  // --- Process Voice Data ---
  const processVoiceData = async () => {
   if (!audioFile && !inputText.trim()) {
    setErrorMessage("Please either record/upload voice or enter text");
    setShowErrorModal(true);
    return;
  }
  setIsProcessing(true);
  try {
    const formData = new FormData();
    if (audioFile) {
      formData.append("audio", audioFile);
    } else {
      formData.append("text", inputText);
    }
    const response = await fetch(`${API_BASE_URL}/api/voice`, {
      method: "POST",
      mode: "cors",
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      setErrorMessage(`Failed to process voice data: ${response.status} - ${errorText}`);
      setShowErrorModal(true);
      return;
    }
      const data: ApiResponse = await response.json();

      // Map the API response to our POData structure
      const poResponse = data.purchase_order;
      const customerMatch = poResponse.zoho_customer_match;

      const itemsWithUniqueIds: POItem[] = poResponse.items.map(
        (item: ApiResponseItem): POItem => ({
          id: generateUniqueId(),
          product: item.item_description || item.zoho_item_name || "",
          quantity: item.quantity || 1,
          unitPrice: item.unit_price || 0,
          totalPrice: item.total || 0,
        })
      );

      setPOData({
        id: poResponse.po_number || generateUniqueId(),
        customerName:
          customerMatch?.contact_name || poResponse.customer_name || "",
        customerDetails: {
          name: customerMatch?.contact_name || poResponse.customer_name || "",
          phone: customerMatch?.phone || "",
          email: customerMatch?.email || customerMatch?.cf_email || "",
          contact_id: customerMatch?.contact_id || "",
        },
        items: itemsWithUniqueIds,
        totalAmount: poResponse.total_amount || 0,
        date: poResponse.order_date || new Date().toISOString().split("T")[0],
        status: "draft",
      });

      setIsEditing(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Unknown error occurred while processing audio.");
      }
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- PO Edit Logic (same as your text page) ---
  const updatePOItem = (
    itemId: string,
    field: keyof POItem,
    value: string | number
  ) => {
    if (!poData) return;

    const updatedItems = poData.items.map((item) => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updatedItem.totalPrice =
            (Number(updatedItem.quantity) || 0) *
            (Number(updatedItem.unitPrice) || 0);
        }
        return updatedItem;
      }
      return item;
    });

    const totalAmount = updatedItems.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );

    setPOData({
      ...poData,
      items: updatedItems,
      totalAmount,
    });
  };

  const handleProductSelect = (itemId: string, selectedZohoItem: ZohoItem) => {
    if (!poData || !selectedZohoItem) return;

    const updatedItems = poData.items.map((item) => {
      if (item.id === itemId) {
        const updatedItem = {
          ...item,
          product: selectedZohoItem.name,
          unitPrice: selectedZohoItem.rate || 0,
        };
        updatedItem.totalPrice =
          (Number(updatedItem.quantity) || 0) *
          (Number(updatedItem.unitPrice) || 0);
        return updatedItem;
      }
      return item;
    });

    const totalAmount = updatedItems.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );

    setPOData({
      ...poData,
      items: updatedItems,
      totalAmount,
    });
  };

  const addNewItem = () => {
    if (!poData) return;
    const newItem = {
      id: generateUniqueId(),
      product: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    };
    setPOData({
      ...poData,
      items: [...poData.items, newItem],
    });
  };

  const removeItem = (itemId: string) => {
    if (!poData) return;
    const updatedItems = poData.items.filter((item) => item.id !== itemId);
    const totalAmount = updatedItems.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );
    setPOData({
      ...poData,
      items: updatedItems,
      totalAmount,
    });
  };

  const updateCustomerDetail = (customerData: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    contact_id?: string;
  }) => {
    if (!poData) return;
    setPOData({
      ...poData,
      customerName: customerData.name,
      customerDetails: {
        ...poData.customerDetails,
        ...customerData,
      },
    });
  };

  const finalizePO = async () => {
    if (!poData) return;
    try {
      setIsProcessing(true);
      const poDataWithReference = {
        ...poData,
        notes: `PO Reference: ${poData.id}`,
        date: new Date().toISOString().split("T")[0],
      };
      const response = await fetch(`${API_BASE_URL}/api/finalize-po`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(poDataWithReference),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to finalize PO");
      }
      setPOData({ ...poData, status: "sent" });
      alert("PO sent successfully to Zoho Books!");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Error sending PO to Zoho Books"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setInputText("");
    setAudioFile(null);
    setPOData(null);
    setIsEditing(false);
  };

  const ErrorModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <AlertTriangle className="text-red-500 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-red-600">Processing Error</h3>
            </div>
            <button
              onClick={() => setShowErrorModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-red-600 mb-4">{errorMessage}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-3">
              <Lightbulb className="text-blue-500 mr-2" size={20} />
              <h4 className="font-semibold text-blue-700">Audio Recording Tips</h4>
            </div>
            <p className="text-blue-700 text-sm mb-3">
              For best results, please include the following information in your audio:
            </p>
            <ul className="text-blue-700 text-sm space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Customer name:</strong> "Create purchase order for [Customer Name]"</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Items needed:</strong> "I need 10 bottles of Chardonnay and 5 cases of Cabernet"</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Quantities:</strong> Specify exact numbers for each item</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Unit prices:</strong> Include prices if known "at $25 per bottle"</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>Order date:</strong> "Needed by [date]" or "For delivery on [date]"</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Volume2 className="text-green-500 mr-2 mt-0.5" size={18} />
              <div>
                <h4 className="font-semibold text-green-700 mb-2">Example Audio Script:</h4>
                <p className="text-green-700 text-sm italic">
                  "Hi, I need to create a purchase order for ABC Wine Store. 
                  I need 12 bottles of 2020 Cabernet Sauvignon at $30 each, 
                  6 bottles of Pinot Noir at $25 each, and 24 bottles of house Chardonnay at $18 each. 
                  This order is for delivery next Friday."
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowErrorModal(false)}
              className="flex-1 px-4 py-2 bg-[#00B3CC] text-white rounded-lg hover:bg-[#0090A3] font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                setShowErrorModal(false);
                resetForm();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Top Bar Customer Name Logic ---
  const customerName =
    poData?.customerName ||
    poData?.customerDetails?.name ||
    userName;

  return (
    <div className="min-h-[75vh] bg-[#F6F7FA] flex flex-col items-center justify-center my-4">
      {/*Error Modal */}
      {showErrorModal && <ErrorModal />}
      <div className="w-full max-w-4xl mx-auto">
        {/* Top Bar */}
        <div className="rounded-t-xl bg-[#00B3CC] py-3 px-4 flex justify-between items-center">
          <h2 className="text-white text-lg font-semibold text-center flex-1">
            {customerName
              ? `${toTitleCase(customerName)} Dashboard`
              : "Customer Dashboard"}
          </h2>
        </div>
        {/* Main Card */}
        <div className="bg-white rounded-b-xl shadow-lg flex flex-col">
          <div className="p-4 md:p-6 flex-1 flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-[#00B3CC] mb-2 text-center">
              Classic Wines Florida - Invoice Creator
            </h1>

            {/* Voice Upload UI */}
            {!poData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-[#00B3CC] rounded-lg p-8 text-center bg-[#F6F7FA]">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      {!audioFile ? (
                        <>
                          <div className="text-[#00B3CC] mb-4">
                            Drag and drop your audio file here
                          </div>
                          <div className="text-[#00B3CC] text-sm mb-4">
                            or
                          </div>
                          <div className="flex flex-col items-center space-y-4">
                            <label
                              htmlFor="file-upload"
                              className="cursor-pointer bg-[#00B3CC] hover:bg-[#0090A3] text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                            >
                              Select Audio File
                            </label>
                            <button
                              onClick={isRecording ? stopRecording : startRecording}
                              className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium relative ${
                                isRecording
                                  ? "bg-[#EF4444] hover:bg-[#dc2626] text-white"
                                  : "bg-[#00B3CC] hover:bg-[#0090A3] text-white"
                              }`}
                            >
                              {isRecording ? (
                                <>
                                  <div className="relative">
                                    <StopCircle className="mr-2" size={18} />
                                    {/* Recording animation - pulsing red circle */}
                                    <div className="absolute -top-0.5 -left-0.5 w-5 h-5 bg-red-400 rounded-full animate-ping opacity-75"></div>
                                    <div className="absolute -top-0.5 -left-0.5 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                                  </div>
                                  Stop Recording
                                </>
                              ) : (
                                <>
                                  <Mic className="mr-2" size={18} />
                                  Start Recording
                                </>
                              )}
                            </button>
                            {/* Recording status indicator */}
                            {isRecording && (
                              <div className="flex items-center text-red-500 text-sm font-medium animate-pulse">
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-ping"></div>
                                Recording in progress...
                              </div>
                            )}
                          </div>
                          <div className="text-[#00B3CC] text-xs mt-4 opacity-80">
                            Only audio files accepted
                          </div>
                        </>
                      ) : (
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload size={40} className="text-green-600 mb-2" />
                          <p className="text-green-600 font-medium">
                            Selected: {audioFile.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Click to change file
                          </p>
                        </label>
                      )}
                      {audioFile && (
                        <div className="flex items-center justify-center text-sm text-[#22C55E] mt-4">
                          <CheckCircle className="mr-1" size={16} />
                          Audio recorded
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#00B3CC] text-center">
                      Allowed file types: MP3, WAV, M4A, OGG
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    onClick={processVoiceData}
                    disabled={isProcessing || (!inputText.trim() && !audioFile)}
                    className="bg-[#00B3CC] hover:bg-[#0090A3] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold transition-colors disabled:bg-[#00B3CC]/60 disabled:cursor-not-allowed flex items-center mx-auto text-sm md:text-base"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2" size={20} />
                        Create PO
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* PO Display and Edit Section */}
            {poData && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#00B3CC] pl-2">
                    Invoice
                  </h2>
                  <div className="flex space-x-2 w-full sm:w-auto">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center justify-center px-3 sm:px-4 py-2 bg-[#00B3CC] text-white rounded-lg hover:bg-[#0090A3] text-sm sm:text-base flex-1 sm:flex-initial"
                    >
                      <Edit3 size={16} className="mr-1 sm:mr-2" />
                      {isEditing ? "View Mode" : "Edit Mode"}
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-3 sm:px-4 py-2 bg-[#00B3CC]/60 text-white rounded-lg hover:bg-[#0090A3]/60 text-sm sm:text-base"
                    >
                      New PO
                    </button>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-[#F6F7FA] p-3 md:p-4 rounded-lg">
                  <h3 className="text-base md:text-lg font-semibold text-[#00B3CC] mb-2">
                    Customer Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#00B3CC] mb-1">
                        Customer Name
                      </label>
                      {isEditing ? (
                        isLoadingCustomers ? (
                          <div className="w-full p-2 border border-[#00B3CC] rounded-lg text-sm text-[#00B3CC]">
                            Loading customers...
                          </div>
                        ) : (
                          <CustomDropdown
                            options={customers.map(
                              (c: Customer): DropdownOption => ({
                                item_id: c.contact_id,
                                name: c.contact_name,
                                customer: c,
                              })
                            )}
                            value={poData.customerDetails.name}
                            onChange={(option: DropdownOption) => {
                              if (option.customer) {
                                updateCustomerDetail({
                                  name: option.customer.contact_name,
                                  phone:
                                    option.customer.phone ||
                                    option.customer.mobile ||
                                    "",
                                  email: option.customer.email || "",
                                  address: option.customer.billing_address
                                    ? `${
                                        option.customer.billing_address.address ||
                                        ""
                                      }, ${
                                        option.customer.billing_address.city ||
                                        ""
                                      }, ${
                                        option.customer.billing_address.state ||
                                        ""
                                      } ${
                                        option.customer.billing_address.zip ||
                                        ""
                                      }`
                                    : "",
                                });
                              }
                            }}
                            placeholder="Select a customer"
                            isLoading={isLoadingCustomers}
                          />
                        )
                      ) : (
                        <p className="text-[#00B3CC] text-sm md:text-base">
                          {poData.customerDetails.name || "No customer selected"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Section - Mobile Card Layout / Desktop Table */}
                <div className="bg-white border border-[#00B3CC]/20">
                  <h3 className="text-base md:text-lg font-semibold text-[#00B3CC] p-3 md:p-4 bg-[#F6F7FA] border-b border-[#00B3CC]/10">
                    Order Items
                  </h3>
                  <div>
                    <table className="min-w-full divide-y divide-[#00B3CC]/20">
                      <thead className="bg-[#F6F7FA]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#00B3CC] uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#00B3CC] uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#00B3CC] uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-[#00B3CC] uppercase tracking-wider">
                            Total
                          </th>
                          {isEditing && poData.status !== "sent" && (
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#00B3CC] uppercase tracking-wider">
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-[#00B3CC]/10">
                        {poData.items.map((item) => (
                          <tr key={item.id}>
                            <td className="max-lg:px-[5px] px-4 py-4 whitespace-nowrap">
                              <div className="w-full max-w-xs">
                                {isEditing ? (
                                  <CustomDropdown
                                    options={zohoItems.map(
                                      (item: ZohoItem): DropdownOption => ({
                                        item_id: item.item_id,
                                        name: item.name,
                                        rate: item.rate,
                                      })
                                    )}
                                    value={item.product}
                                    onChange={(selectedItem: DropdownOption) =>
                                      handleProductSelect(
                                        item.id,
                                        selectedItem as ZohoItem
                                      )
                                    }
                                    placeholder="Select an item"
                                    disabled={poData.status === "sent"}
                                    isLoading={isLoadingItems}
                                  />
                                ) : (
                                  <span className="text-[#00B3CC]">
                                    {item.product}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="max-lg:px-[5px] px-4 py-4 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updatePOItem(
                                      item.id,
                                      "quantity",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="w-20 p-2 border border-[#00B3CC] rounded text-[#00B3CC]"
                                  disabled={poData.status === "sent"}
                                />
                              ) : (
                                <span className="text-[#00B3CC]">
                                  {item.quantity}
                                </span>
                              )}
                            </td>
                            <td className="max-lg:px-[5px] px-4 py-4 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.unitPrice || ""}
                                  onChange={(e) =>
                                    updatePOItem(
                                      item.id,
                                      "unitPrice",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-24 p-2 border border-[#00B3CC] rounded text-[#00B3CC]"
                                  disabled={poData.status === "sent"}
                                />
                              ) : (
                                <span className="text-[#00B3CC]">
                                  ${(item.unitPrice || 0).toFixed(2)}
                                </span>
                              )}
                            </td>
                            <td className="max-lg:px-[5px] px-4 py-4 whitespace-nowrap">
                              <span className="text-[#00B3CC] font-medium">
                                ${(item.totalPrice || 0).toFixed(2)}
                              </span>
                            </td>
                            {isEditing && poData.status !== "sent" && (
                              <td className="max-lg:px-[5px] px-4 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {isEditing && poData.status !== "sent" && (
                    <div className="p-3 md:p-4 bg-[#F6F7FA] border-t border-[#00B3CC]/10">
                      <button
                        onClick={addNewItem}
                        className="text-[#00B3CC] hover:text-[#0090A3] font-medium text-sm md:text-base"
                      >
                        + Add New Item
                      </button>
                    </div>
                  )}
                </div>

                {/* Total and Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#F6F7FA] p-3 md:p-4 rounded-lg gap-3">
                  <div className="text-lg md:text-xl font-semibold text-[#00B3CC]">
                    Total Amount: ${poData.totalAmount.toFixed(2)}
                  </div>
                  <div className="flex space-x-4 w-full md:w-auto">
                    {poData.status === "sent" ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="mr-2" size={20} />
                        PO Sent Successfully
                      </div>
                    ) : (
                      <button
                        onClick={finalizePO}
                        className="flex items-center justify-center px-4 md:px-6 py-2.5 md:py-3 bg-[#00B3CC] text-white rounded-lg hover:bg-[#0090A3] font-semibold text-sm md:text-base w-full md:w-auto"
                      >
                        <Send className="mr-2" size={18} />
                        Finalize & Send PO
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}