"use client";
import { useEffect, useState, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";

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

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (option: DropdownOption) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

// Custom Dropdown Component
const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option: DropdownOption) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: DropdownOption) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full p-2 border border-gray-300 rounded-lg text-left flex items-center justify-between ${
          disabled
            ? "bg-gray-100 cursor-not-allowed"
            : "bg-white hover:border-gray-400"
        } ${isOpen ? "border-blue-500 ring-1 ring-blue-500" : ""}`}
      >
        <span
          className={`${value ? "text-gray-900" : "text-gray-500"} truncate`}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto flex flex-col">
            {isLoading ? (
              <div className="p-3 text-center text-gray-500">
                Loading items...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-gray-500">
                {searchTerm ? "No items found" : "No items available"}
              </div>
            ) : (
              filteredOptions.map((option: DropdownOption) => {
                console.log(`filteredOptions: ${filteredOptions.length}`);
                return (
                  <button
                    key={`${option.item_id}-${option.name}`}
                    onClick={() => handleSelect(option)}
                    className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50"
                  >
                    <div className="font-medium text-gray-900">
                      {option.name}
                    </div>
                    {option.rate && (
                      <div className="text-sm text-gray-600">
                        ${option.rate.toFixed(2)}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default CustomDropdown;
