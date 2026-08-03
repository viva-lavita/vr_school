"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Select({
  name,
  placeholder,
  required = false,
  className = "",
  options = [],
  value,
  defaultValue,
  onChange,
  error = false,
  errorMessage,
  disabled = false,
  ...props
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const [thumb, setThumb] = useState({ visible: false, topPct: 0, heightPct: 100 });

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const normalizedOptions = options.map((option) =>
    typeof option === "object" ? option : { value: option, label: option }
  );
  const selectedOption = normalizedOptions.find((option) => String(option.value) === String(currentValue));
  const hasValue = Boolean(currentValue);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open || activeIndex < 0 || !listRef.current) return;
    const activeItem = listRef.current.children[activeIndex];
    activeItem?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const syncThumb = () => {
    const el = listRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight) {
      setThumb({ visible: false, topPct: 0, heightPct: 100 });
      return;
    }
    const heightPct = Math.max((clientHeight / scrollHeight) * 100, 10);
    const maxTopPct = 100 - heightPct;
    const topPct = maxTopPct <= 0 ? 0 : (scrollTop / (scrollHeight - clientHeight)) * maxTopPct;
    setThumb({ visible: true, topPct, heightPct });
  };

  useEffect(() => {
    if (!open) return;
    syncThumb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, normalizedOptions.length]);

  const commitValue = (newValue) => {
    if (!isControlled) setInternalValue(newValue);
    onChange?.({ target: { name, value: newValue } });
  };

  const handleSelect = (option) => {
    commitValue(option.value);
    setOpen(false);
  };

  const openList = () => {
    if (disabled) return;
    const idx = normalizedOptions.findIndex((option) => String(option.value) === String(currentValue));
    setActiveIndex(idx >= 0 ? idx : 0);
    setOpen(true);
  };

  const toggleOpen = () => {
    if (disabled) return;
    if (open) {
      setOpen(false);
    } else {
      openList();
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, normalizedOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (activeIndex >= 0 && normalizedOptions[activeIndex]) handleSelect(normalizedOptions[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(normalizedOptions.length - 1);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  const fieldClassName = [
    "w-full",
    "flex",
    "items-center",
    "text-input",
    "text-left",
    "appearance-none",
    "border-0",
    "bg-white",
    "rounded-xl",
    "px-4",
    "py-3",
    "pr-11",
    hasValue ? "text-black" : "text-transparent",
    error ? "border-2 border-red" : "",
    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const buttonText = selectedOption ? selectedOption.label : currentValue || "-";

  return (
    <div className="flex h-full flex-col justify-end">
      {error && errorMessage && <p className="mb-1 text-input text-red">{errorMessage}</p>}

      <div className="relative" ref={rootRef}>
        <button
          type="button"
          name={name}
          disabled={disabled}
          onClick={toggleOpen}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-required={required}
          className={fieldClassName}
          {...props}
        >
          <span className="block truncate leading-normal">{buttonText}</span>
        </button>

        <span
          className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-input text-black ${hasValue ? "hidden" : "block"}`}
        >
          {placeholder}
          {required && <span className="text-red">*</span>}
        </span>

        <span
          className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <Image src="/icons/ui/arrow-down.svg" alt="" width={16} height={16} />
        </span>

        {open && (
          <div className="absolute z-20 w-full">
            <ul
              ref={listRef}
              role="listbox"
              onScroll={syncThumb}
              className="hide-scrollbar max-h-[170px] w-full overflow-y-auto rounded-xl bg-white p-3 pr-8 shadow-lg"
            >
              {normalizedOptions.length === 0 && <li className="px-4 py-2 text-input text-dark">Нет доступных значений</li>}
              {normalizedOptions.map((option, index) => {
                const isSelected = String(option.value) === String(currentValue);
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleSelect(option)}
                    className={`cursor-pointer rounded-lg px-2 py-1 text-2 text-black ${
                      isSelected ? "bg-light-green" : "hover:bg-light-green"
                    }`}
                  >
                    {option.label}
                  </li>
                );
              })}
            </ul>

            {thumb.visible && (
              <div className="pointer-events-none absolute top-3 bottom-3 right-3 w-[5px] rounded-full bg-gray">
                <div
                  className="absolute w-full rounded-full bg-dark"
                  style={{ top: `${thumb.topPct}%`, height: `${thumb.heightPct}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
