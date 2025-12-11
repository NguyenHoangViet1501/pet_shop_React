import React from 'react';
import './ProductAnimal.css';

const ProductAnimal = ({ selectedAnimal, onSelectAnimal }) => {
  const currentSelected = selectedAnimal || 'all';

  const animals = [
    { id: 'all', name: 'Tất cả', img: '/images/product/animal/allanimal.png', type: 'icon' },
    { id: 'dog', name: 'Chó', img: '/images/product/animal/dog.png', type: 'image' },
    { id: 'cat', name: 'Mèo', img: '/images/product/animal/cat.png', type: 'image' },
    { id: 'hamster', name: 'Hamster', icon: 'fas fa-paw', type: 'font' },
    { id: 'rabbit', name: 'Rabbit', icon: 'fas fa-paw', type: 'font' }, // Placeholder
    { id: 'turtle', name: 'Turtle', icon: 'fas fa-paw', type: 'font' }, // Placeholder
  ];

  return (
    <section className="py-5 bg-white">
      <div className="container">
        <h2 className="fw-bold mb-4">Thú cưng</h2>
        <div className="d-flex flex-wrap justify-content-between align-items-center">
            {animals.map((animal) => (
                <div 
                    key={animal.id} 
                    className="text-center animal-item" 
                    onClick={() => onSelectAnimal && onSelectAnimal(animal.id)}
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
