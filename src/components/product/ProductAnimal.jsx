import React, { useRef, useState } from 'react';
import './ProductAnimal.css';
import { useAnimalsQuery } from '../../hooks/useAnimalsQuery';

const ProductAnimal = ({ selectedAnimal, onSelectAnimal }) => {
  const currentSelected = selectedAnimal || 'all';
  const { data: animalList = [] } = useAnimalsQuery();
  
  // Drag to scroll logic
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const animals = [
    { id: 'all', name: 'Tất cả', img: '/images/product/animal/allanimal.png', type: 'icon' },
    ...(Array.isArray(animalList) ? animalList.map(animalName => {
        const lowerName = String(animalName).toLowerCase();
        
        if (lowerName === 'dog' || lowerName === 'chó' || lowerName === 'dogs') {
            return { id: animalName, name: 'Chó', img: '/images/product/animal/dog.png', type: 'image' };
        }
        if (lowerName === 'cat' || lowerName === 'mèo' || lowerName === 'cats') {
            return { id: animalName, name: 'Mèo', img: '/images/product/animal/cat.png', type: 'image' };
        }
        if (lowerName === 'squirrel' || lowerName === 'sóc' || lowerName === 'squirrels') {
            return { id: animalName, name: 'Sóc', img: '/images/product/animal/squirrel.png', type: 'image' };
        }
        if (lowerName === 'parrot' || lowerName === 'vẹt' || lowerName === 'parrots') {
            return { id: animalName, name: 'Vẹt', img: '/images/product/animal/parrot.png', type: 'image' };
        }
        if (lowerName === 'rabbit' || lowerName === 'thỏ' || lowerName === 'rabbits') {
            return { id: animalName, name: 'Thỏ', img: '/images/product/animal/rabbit.png', type: 'image' };
        }
        
        
        // Default for others
        return { id: animalName, name: animalName, icon: 'fas fa-paw', type: 'font' };
    }) : [])
  ];

  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  
  const onMouseLeave = () => {
    setIsDragging(false);
  };
  
  const onMouseUp = () => {
    setIsDragging(false);
  };
  
  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Click handler that prevents click when dragging
  // Simple check: if we moved significantly, it's a drag, not a click. 
  // For simplicity here, we assume if isDragging was true recently/moved, but standard click usually works fine
  // unless we want to block click on drag end. 
  // To avoid complex distinction, let's keep click simple.

  return (
    <section className="py-5 bg-white">
      <div className="container">
        <h2 className="fw-bold mb-4">Thú cưng</h2>
        <div 
            className="d-flex align-items-center w-100 animal-scroll-container"
            ref={scrollRef}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
        >
            {animals.map((animal) => (
                <div 
                    key={animal.id} 
                    className="text-center animal-item" 
                    onClick={() => {
                        // Optional: prevent click if it was a drag gesture
                        if (!isDragging) { 
                            onSelectAnimal && onSelectAnimal(animal.id); 
                        }
                    }}
                >
                    <div className="position-relative d-flex align-items-center justify-content-center mb-3 animal-bg-container">
                        {/* Background Shape */}
                        <img 
                            src={currentSelected === animal.id ? '/images/product/animal/pick.png' : '/images/product/animal/unpick.png'} 
                            alt="bg" 
                            className="position-absolute w-100 h-100 animal-bg-img"
                        />
                        
                        {/* Content */}
                        <div className="position-relative d-flex align-items-center justify-content-center animal-content">
                            {animal.type === 'image' && (
                                <img 
                                    src={animal.img} 
                                    alt={animal.name} 
                                    className="img-fluid animal-img"
                                />
                            )}
                            
                            {animal.type === 'icon' && (
                                <img 
                                    src={animal.img} 
                                    alt={animal.name} 
                                    className={`img-fluid animal-icon-img ${currentSelected !== animal.id ? 'animal-icon-filter' : ''}`}
                                />
                            )}

                            {animal.type === 'font' && (
                                <i className={`${animal.icon} fa-3x ${currentSelected === animal.id ? 'text-white' : 'text-warning'}`}></i>
                            )}
                        </div>
                    </div>
                    <span className={`fw-bold fs-5 ${currentSelected === animal.id ? 'text-dark' : 'text-dark'}`}>{animal.name}</span>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default ProductAnimal;
