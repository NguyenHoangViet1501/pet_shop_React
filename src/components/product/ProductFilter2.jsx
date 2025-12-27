import React, { useState, useEffect } from 'react';
import './ProductFilter2.css';

const ProductFilter2 = ({ 
    categories = [], 
    brands = [], 
    minPrice = 0, 
    maxPrice = 1000000, 
    onFilterChange 
}) => {

    const defaultBrands = [
        { id: 1, name: 'Natural food', count: 28 },
        { id: 2, name: 'Pet care', count: 18 },
        { id: 3, name: 'Dogs friend', count: 16 },
        { id: 4, name: 'Pet food', count: 40 },
        { id: 5, name: 'Favorite pet', count: 28 },
        { id: 6, name: 'Green line', count: 18 },
    ];

    const displayCategories = categories;
    const displayBrands = brands.length > 0 ? brands : defaultBrands;
    const [selectedCats, setSelectedCats] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: minPrice, max: maxPrice });
    const STEP = 20000; // fixed step in VND

    // Handle Category Change
    const handleCategoryChange = (id) => {
        const newSelected = selectedCats.includes(id) ? [] : [id];
        setSelectedCats(newSelected);
        if (onFilterChange) {
            onFilterChange({
                categories: newSelected,
                brands: selectedBrands,
                price: priceRange
            });
        }
    };

    // Handle Brand Change
    const handleBrandChange = (id) => {
        // Chỉ cho phép chọn 1 hãng
        const newSelected = selectedBrands.includes(id) ? [] : [id];
        setSelectedBrands(newSelected);

        if (onFilterChange) {
            onFilterChange({
                categories: selectedCats,
                brands: newSelected,
                price: priceRange
            });
        }
    };

    // Handle Price Change
    const handlePriceChange = (e) => {
        const raw = parseInt(e.target.value, 10);
        const name = e.target.name;
        if (isNaN(raw)) return;

        // Snap to nearest STEP
        const snapped = Math.round(raw / STEP) * STEP;

        if (name === 'min') {
            if (snapped > priceRange.max) return; // Prevent crossing
            setPriceRange({ ...priceRange, min: Math.max(minPrice, Math.min(snapped, maxPrice)) });
        } else {
            if (snapped < priceRange.min) return; // Prevent crossing
            setPriceRange({ ...priceRange, max: Math.max(minPrice, Math.min(snapped, maxPrice)) });
        }
    };

    // Calculate percentage for slider track
    const getPercent = (value) => {
        return Math.round(((value - minPrice) / (maxPrice - minPrice)) * 100);
    };

    const minPercent = getPercent(priceRange.min);
    const maxPercent = getPercent(priceRange.max);

    const handleApply = () => {
        if (onFilterChange) {
            onFilterChange({
                categories: selectedCats,
                brands: selectedBrands,
                price: {
                    min: priceRange.min,
                    // Nếu max == maxPrice (kéo hết cỡ) thì coi như không giới hạn (null)
                    max: priceRange.max === maxPrice ? null : priceRange.max
                }
            });
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div className="filter-sidebar">
            {/* Categories Section */}
            <div className="filter-section">
                <h3 className="filter-title">Danh Mục</h3>
                <ul className="filter-list">
                    {displayCategories.map(cat => (
                        <li key={cat.id} className="filter-item" onClick={() => handleCategoryChange(cat.id)}>
                            <div className="d-flex align-items-center">
                                <input 
                                    type="checkbox" 
                                    className="filter-checkbox"
                                    checked={selectedCats.includes(cat.id)}
                                    onChange={() => {}} // Handled by li onClick
                                />
                                <span>{cat.name}</span>
                            </div>
                            <span className="filter-count">{cat.count}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Price Section */}
            <div className="filter-section">
                <h3 className="filter-title">Giá</h3>
                <div className="price-slider-container">
                    <div className="slider-track"></div>
                    <div 
                        className="slider-range"
                        style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
                    ></div>
                    <input 
                        type="range" 
                        name="min"
                        min={minPrice}
                        max={maxPrice}
                        step={STEP}
                        value={priceRange.min}
                        onChange={handlePriceChange}
                        className="range-input"
                    />
                    <input 
                        type="range" 
                        name="max"
                        min={minPrice}
                        max={maxPrice}
                        step={STEP}
                        value={priceRange.max}
                        onChange={handlePriceChange}
                        className="range-input"
                    />
                </div>
                <div className="price-values">
                    <span>
                        {formatCurrency(priceRange.min)} - {priceRange.max === maxPrice ? formatCurrency(maxPrice) : formatCurrency(priceRange.max)}
                    </span>
                    <button className="btn-apply" onClick={handleApply}>Apply</button>
                </div>
            </div>

            {/* Brands Section */}
            <div className="filter-section">
                <h3 className="filter-title">Hãng</h3>
                <ul className="filter-list">
                    {displayBrands.map((brand, index) => {
                        const isObject = typeof brand === 'object' && brand !== null;
                        const name = isObject ? brand.name : brand;
                        // Nếu là object mà không có id thì dùng name làm id
                        const id = isObject ? (brand.id || brand.name) : brand;
                        const count = isObject ? brand.count : null;

                        if (!name) return null;

                        return (
                            <li key={id || index} className="filter-item" onClick={() => handleBrandChange(id)}>
                                <div className="d-flex align-items-center">
                                    <input 
                                        type="checkbox" 
                                        className="filter-checkbox"
                                        checked={selectedBrands.includes(id)}
                                        onChange={() => {}}
                                    />
                                    <span>{name}</span>
                                </div>
                                {count !== null && <span className="filter-count">{count}</span>}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default ProductFilter2;
