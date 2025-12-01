import * as React from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

import "./select.scss";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ options, value, onChange, placeholder, className, disabled }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const selectRef = React.useRef<HTMLDivElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const [focusedIndex, setFocusedIndex] = React.useState(-1);

    const selectedOption = options.find((opt) => opt.value === value);
    const displayValue = selectedOption?.label || placeholder || "";

    const handleSelect = React.useCallback(
      (optionValue: string) => {
        onChange?.(optionValue);
        setIsOpen(false);
        setFocusedIndex(-1);
      },
      [onChange],
    );

    // Close dropdown when clicking outside
    React.useEffect(() => {
      if (!isOpen) {
        return;
      }

      const handleClickOutside = (event: MouseEvent) => {
        if (
          selectRef.current &&
          !selectRef.current.contains(event.target as Node) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setFocusedIndex(-1);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    // Handle keyboard navigation
    React.useEffect(() => {
      if (!isOpen) {
        return;
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsOpen(false);
          setFocusedIndex(-1);
          selectRef.current?.focus();
          return;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        } else if (event.key === "Enter") {
          if (focusedIndex >= 0) {
            event.preventDefault();
            handleSelect(options[focusedIndex].value);
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [isOpen, focusedIndex, options, handleSelect]);

    const handleToggle = () => {
      if (disabled) {
        return;
      }
      setIsOpen(!isOpen);
      if (!isOpen) {
        const currentIndex = options.findIndex((opt) => opt.value === value);
        setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
      }
    };

    return (
      <div
        ref={selectRef}
        className={clsx(
          "select-wrapper",
          { disabled, open: isOpen },
          className,
        )}
      >
        <button
          type="button"
          className="select-trigger"
          onClick={handleToggle}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="select-value">{displayValue}</span>
          <ChevronDown
            size={14}
            className={clsx("select-icon", { open: isOpen })}
            aria-hidden="true"
          />
        </button>
        {isOpen && (
          <div ref={dropdownRef} className="dropdown-menu manual-hover">
            <div className="dropdown-menu-container">
              {options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  className={clsx(
                    "dropdown-menu-item dropdown-menu-item-base",
                    {
                      "dropdown-menu-item--selected": option.value === value,
                      "dropdown-menu-item--hovered": index === focusedIndex,
                    },
                  )}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  role="option"
                  aria-selected={option.value === value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
