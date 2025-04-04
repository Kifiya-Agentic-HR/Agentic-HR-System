"use client";

import { useState } from "react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";

interface FilterDropdownProps {
  options: { label: string; value: string }[];
  selected: string;
  onSelect: (value: string) => void;
  label: string;
  buttonClass?: string;
  optionClass?: (value: string, selected: string) => string;
}

export default function FilterDropdown({
  options,
  selected,
  onSelect,
  label,
  buttonClass = "",
  optionClass = () => "",
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 bg-gray-100 p-2 rounded-xl ${buttonClass}`}
      >
        <span className="text-sm text-gray-600 mr-2">
          {label}: {selected}
        </span>
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl overflow-hidden z-10">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm ${optionClass(
                option.value,
                selected
              )}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
