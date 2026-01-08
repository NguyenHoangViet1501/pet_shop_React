import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const Adoption = () => {
    const navigate = useNavigate();
    const animals = [
        { id: 1, name: 'Cat', image: 'cat.png' },
        { id: 2, name: 'Hamster', image: 'hamster.png' },
        { id: 3, name: 'Dog', image: 'dog.png' },
        { id: 4, name: 'Parrot', image: 'parrot.png' },
        { id: 5, name: 'Rabbit', image: 'rabbit.png' },
        { id: 6, name: 'Turtle', image: 'turtle.png' },
    ];

    return (
        <section className="container py-5">
            <div className="d-flex justify-content-center align-items-center mb-6">
                <h2 className="fw-bold ">Nhận nuôi</h2>
                <div className="d-flex gap-2">
                </div>
            </div>

            <div className="row g-4 justify-content-center mt-5"
                onClick={() => navigate(`/adoption`)}
            >
                {animals.map((animal) => (
                    <div key={animal.id} className="col-6 col-md-4 col-lg-2">
                        <AdoptItem animal={animal} />
                    </div>
                ))}
            </div>
        </section>
    );
};

const AdoptItem = ({ animal }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="text-center position-relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}

            style={{ cursor: 'pointer' }}
        >
            <div className="position-relative d-flex justify-content-center align-items-center mx-auto" style={{ width: '140px', height: '140px' }}>
                {/* Background Blob */}
                <img
                    src={isHovered ? "/images/home/adopt/hover.png" : "/images/home/adopt/unhover.png"}
                    alt="bg"
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{
                        objectFit: 'contain',
                        zIndex: 0,
                        transition: 'opacity 0.3s ease'
                    }}
                />

                {/* Animal Image */}
                <img

                    src={`/images/home/adopt/${animal.image}`}
                    alt={animal.name}
                    className="position-relative"
                    style={{
                        width: '80px',
                        height: '80px',
                        zIndex: 1,
                        objectFit: 'contain'
                    }}
                />
            </div>
            <h6 className="mt-3 fw-bold">{animal.name}</h6>
        </div>
    );
};

export default Adoption;
