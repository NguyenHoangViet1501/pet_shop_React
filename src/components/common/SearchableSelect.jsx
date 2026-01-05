import React, { useState, useEffect, useRef } from "react";

const SearchableSelect = ({
    options = [],
    value,
    onChange,
    placeholder = "Nhập để tìm kiếm...",
    disabled = false,
    className = "",
    error,
    displayValue = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const wrapperRef = useRef(null);

    // Sync input with value or displayValue
    useEffect(() => {
        if (value) {
            const selectedOption = options.find((opt) => opt.value === value);
            if (selectedOption) {
                setSearchTerm(selectedOption.label);
            } else if (displayValue) {
                setSearchTerm(displayValue);
            }
        } else if (displayValue && !isTyping) {
            setSearchTerm(displayValue);
        } else if (!value && !displayValue && !isTyping) {
            setSearchTerm("");
        }
    }, [value, displayValue, options, isTyping]);


    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsTyping(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        setIsOpen(true);
        setIsTyping(true);
        if (e.target.value === "") {
            onChange?.(null);
        }
    };

    const handleSelect = (option) => {
        setSearchTerm(option.label);
        onChange?.(option.value);
        setIsOpen(false);
        setIsTyping(false);
    };

    const handleFocus = () => {
        if (!disabled) setIsOpen(true);
    };

    return (
        <div className={`position-relative ${className}`} ref={wrapperRef}>
            <div className="input-group">
                <input
                    type="text"
                    className={`form-control ${error ? "is-invalid" : ""}`}
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    disabled={disabled}
                    autoComplete="off"
                />
                <span className="input-group-text bg-white border-start-0" onClick={() => !disabled && setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
                    <i className="bi bi-chevron-down small text-secondary"></i>
                </span>
            </div>

            {isOpen && !disabled && (
                <div
                    className="position-absolute w-100 bg-white border rounded shadow-sm mt-1"
                    style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}
                >
                    <ul className="list-unstyled mb-0">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <li
                                    key={option.value}
                                    className={`px-3 py-2 cursor-pointer ${option.value === value ? "bg-primary text-white" : "hover-bg-light"
                                        }`}
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(option);
                                    }}
                                    onMouseEnter={(e) => {
                                        if (option.value !== value) e.target.style.backgroundColor = "#f8f9fa";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (option.value !== value) e.target.style.backgroundColor = "transparent";
                                    }}
                                >
                                    {option.label}
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-2 text-muted small text-center">
                                Không tìm thấy kết quả
                            </li>
                        )}
                    </ul>
                </div>
            )}
            {error && <div className="invalid-feedback d-block">{error}</div>}
        </div>
    );
};

export default SearchableSelect;
