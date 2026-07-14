"use client";

import { useState } from "react";
import Image from "next/image";

export default function Select({
  placeholder,
  required = false,
  className = "",
  options = [],
  value,
  defaultValue,
  onChange,
  ...props
}) {
  const [hasValue, setHasValue] = useState(Boolean(value ?? defaultValue));

  const handleChange = (e) => {
    setHasValue(e.target.value.length > 0);
    onChange?.(e);
  };

  return (
    <div className="relative">
      <select
        required={required}
        value={value}
        defaultValue={defaultValue ?? ""}
        onChange={handleChange}
        className={`w-full text-input text-black bg-white rounded-xl px-4 py-3 pr-11 appearance-none ${className}`}
        {...props}
      >
        <option value="" disabled hidden></option>
        {options.map((option) => {
          const optValue = typeof option === "object" ? option.value : option;
          const optLabel = typeof option === "object" ? option.label : option;
          return (
            <option key={optValue} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>

      <span
        className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-input text-black ${hasValue ? "hidden" : "block"}`}
      >
        {placeholder}
        {required && <span className="text-red">*</span>}
      </span>

      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
        <Image src="/icons/ui/arrow-down.svg" alt="" width={16} height={16} />
      </span>
    </div>
  );
}
