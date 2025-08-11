"use client";
import { useEffect, useState } from "react";
import { Upload, FileText, Edit3, Send, CheckCircle } from "lucide-react";
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

function toTitleCase(str: string): string {
  if (!str) return "";
  return str.replace(
    /\w\S*/g,
    (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function POCreatorClient() {
  const searchParams = useSearchParams();
  const userName = searchParams.get("user_name");
  const [inputText, setInputText] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [poData, setPOData] = useState<POData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [zohoItems, setZohoItems] = useState<ZohoItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState<boolean>(false);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const processSMSData = async () => {
    setIsProcessing(true);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("screenshot", selectedFile);
      } else {
        formData.append("text", inputText);
      }

      const response = await fetch(`${API_BASE_URL}/api/process-sms`, {
        method: "POST",
        mode: "cors",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to process SMS data: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      // Ensure all items have unique IDs
      interface IncomingPOItem {
        id?: string;
        product: string;
        quantity: number;
        unitPrice?: number;
        totalPrice?: number;
      }

      const itemsWithUniqueIds: POItem[] = (data.items as IncomingPOItem[]).map(
        (item: IncomingPOItem): POItem => ({
          ...item,
          id: item.id || generateUniqueId(),
        })
      );

      setPOData({
        ...data,
        items: itemsWithUniqueIds,
      });
      setIsEditing(true);
    } catch (error) {
      console.error("Error processing SMS:", error);
      if (error instanceof Error) {
        alert(`Error processing SMS data: ${error.message}`);
      } else {
        alert("Error processing SMS data: An unknown error occurred.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const updatePOItem = (
    itemId: string,
    field: keyof POItem,
    value: string | number
  ) => {
    if (!poData) return;

    const updatedItems = poData.items.map((item) => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };

        // Calculate total price when quantity or unit price changes
        if (field === "quantity" || field === "unitPrice") {
          updatedItem.totalPrice =
            (Number(updatedItem.quantity) || 0) *
            (Number(updatedItem.unitPrice) || 0);
        }

        return updatedItem;
      }
      return item;
    });

    // Recalculate total amount
    const totalAmount = updatedItems.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );

    const updatedPO = {
      ...poData,
      items: updatedItems,
      totalAmount: totalAmount,
    };

    setPOData(updatedPO);
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

        // Recalculate total price for this item
        updatedItem.totalPrice =
          (Number(updatedItem.quantity) || 0) *
          (Number(updatedItem.unitPrice) || 0);

        return updatedItem;
      }
      return item;
    });

    // Recalculate total amount
    const totalAmount = updatedItems.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );

    const updatedPO = {
      ...poData,
      items: updatedItems,
      totalAmount: totalAmount,
    };

    setPOData(updatedPO);
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

    const updatedPO = {
      ...poData,
      items: [...poData.items, newItem],
    };

    setPOData(updatedPO);
  };

  const removeItem = (itemId: string) => {
    if (!poData) return;

    const updatedItems = poData.items.filter((item) => item.id !== itemId);
    const totalAmount = updatedItems.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );

    const updatedPO = {
      ...poData,
      items: updatedItems,
      totalAmount: totalAmount,
    };

    setPOData(updatedPO);
  };

  const updateCustomerDetail = (customerData: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  }) => {
    if (!poData) return;

    const updatedPO = {
      ...poData,
      customerName: customerData.name,
      customerDetails: {
        ...poData.customerDetails,
        name: customerData.name,
        phone: customerData.phone || poData.customerDetails.phone || "",
        email: customerData.email || poData.customerDetails.email || "",
        address: customerData.address || poData.customerDetails.address || "",
      },
    };

    setPOData(updatedPO);
  };

  const finalizePO = async () => {
    if (!poData) return;

    try {
      setIsProcessing(true);

      // Add PO reference to notes instead of custom field
      const poDataWithReference = {
        ...poData,
        notes: `PO Reference: ${poData.id}`, // Add PO reference as a note
        date: new Date().toISOString().split("T")[0], // Ensure date is in YYYY-MM-DD format
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
      console.error("Error finalizing PO:", error);
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
    setSelectedFile(null);
    setPOData(null);
    setIsEditing(false);
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
          <div className="p-4 md:p-6 flex-1 flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-[#00B3CC] mb-2 text-center">
              Classic Wines Florida - Invoice Creator
            </h1>

            {!poData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  <div className="space-y-4">
                    <h2 className="text-lg md:text-xl font-semibold text-[#00B3CC] flex items-center">
                      <Upload className="mr-2 text-[#00B3CC]" size={20} />
                      Upload Screenshot
                    </h2>
                    <div className="border-2 border-dashed border-[#00B3CC] rounded-lg p-4 md:p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload size={40} className="text-[#00B3CC] mb-2" />
                        <span className="text-sm text-[#00B3CC]">
                          Click to upload screenshot
                        </span>
                      </label>
                      {selectedFile && (
                        <p className="mt-2 text-sm text-green-600">
                          Selected: {selectedFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    onClick={processSMSData}
                    disabled={
                      isProcessing || (!inputText.trim() && !selectedFile)
                    }
                    className="bg-[#00B3CC] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold hover:bg-[#00B3CC]/90 disabled:bg-[#00B3CC]/60 disabled:cursor-not-allowed flex items-center mx-auto text-sm md:text-base"
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
                      className="flex items-center justify-center px-3 sm:px-4 py-2 bg-[#00B3CC] text-white rounded-lg hover:bg-[#00B3CC]/90 text-sm sm:text-base flex-1 sm:flex-initial"
                    >
                      <Edit3 size={16} className="mr-1 sm:mr-2" />
                      {isEditing ? "View Mode" : "Edit Mode"}
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-3 sm:px-4 py-2 bg-[#00B3CC]/60 text-white rounded-lg hover:bg-[#00B3CC]/80 text-sm sm:text-base"
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
                          <div className="w-full p-2 border border-[#00B3CC] rounded-lg text-sm">
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
                                        option.customer.billing_address
                                          .address || ""
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
                          {poData.customerDetails.name ||
                            "No customer selected"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Section - Table Layout */}
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
                                  className="w-20 p-2 border border-[#00B3CC] rounded text-[#00B3CC] focus:border-[#00B3CC] outline-none"
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
                                  className="w-24 p-2 border border-[#00B3CC] rounded text-[#00B3CC] focus:border-[#00B3CC] outline-none"
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
                        className="text-[#00B3CC] hover:text-[#009bb0] font-medium text-sm md:text-base"
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
                        className="flex items-center justify-center px-4 md:px-6 py-2.5 md:py-3 bg-[#00B3CC] text-white rounded-lg hover:bg-[#00B3CC]/90 font-semibold text-sm md:text-base w-full md:w-auto"
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
