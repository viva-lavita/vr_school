"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export default function Input({
  name,
  placeholder,
  required = false,
  type = "text",
  className = "",
  clearable = false,
  editable = false,
  value,
  defaultValue,
  onChange,
  error = false,
  errorMessage,
  ...props
}) {
  const inputRef = useRef(null);
  const [inputType, setInputType] = useState(type);
  const [hasValue, setHasValue] = useState(Boolean(value ?? defaultValue));

  const isPassword = type === "password";
  const isDate = type === "date";
  const showClear = clearable && !isPassword && hasValue;
  const showEditIcon = editable && !isPassword && !showClear;
  const hasRightIcon = isPassword || showClear || showEditIcon;

  const handleChange = (e) => {
    setHasValue(e.target.value.length > 0);
    onChange?.(e);
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
    setHasValue(false);
    onChange?.({ target: { name, value: "" } });
  };

  const fieldClassName = `w-full text-input text-black  bg-white rounded-xl px-4 py-3 ${hasRightIcon ? "pr-11" : ""} ${error ? "border-2 border-red" : ""} ${className}`;

  return (
    <div className="flex h-full flex-col justify-end">
      {error && errorMessage && <p className="mb-1 text-input text-red">{errorMessage}</p>}

      <div className="relative">
        <input
          ref={inputRef}
          name={name}
          type={inputType}
          placeholder=" "
          required={required}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={`${fieldClassName} ${isDate && !hasValue ? "date-empty" : ""}`}
          {...props}
        />

        <span
          className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-input text-black  ${hasValue ? "hidden" : "block"}`}
        >
          {placeholder}
          {required && <span className="text-red">*</span>}
        </span>

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setInputType((t) => (t === "password" ? "text" : "password"))}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <Image
              src={inputType === "password" ? "/icons/ui/hide.svg" : "/icons/ui/show.svg"}
              alt=""
              width={16}
              height={16}
            />
          </button>
        )}

        {showClear && (
          <button
            type="button"
            tabIndex={-1}
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <Image src="/icons/ui/close.svg" alt="" width={16} height={16} />
          </button>
        )}

        {showEditIcon && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <Image src="/icons/ui/pen.svg" alt="" width={16} height={16} />
          </span>
        )}
      </div>
    </div>
  );
}
