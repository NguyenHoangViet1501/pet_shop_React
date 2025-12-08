import React from 'react';

const ServicesGrid = ({ services, onBook, bookLabel = 'Đặt lịch' }) => {
  if (!Array.isArray(services) || services.length === 0) {
    return (
      <div className="text-center text-muted">Hiện chưa có dịch vụ nào.</div>
    );
  }

  return (
    <div className="row">
      {services.map((s) => (
        <div className="col-md-4 mb-4" key={s.key}>
          <div className="card h-100 text-center">
            <div className="card-body d-flex flex-column">
              <i className={`${s.icon} fa-2x text-warning mb-3`}></i>
              <h5 className="mb-2">{s.title}</h5>
              <p className="text-muted flex-grow-1">{s.description}</p>
              {s.duration && (
                <div className="text-muted small mb-2"><i className="fas fa-clock me-1"></i>Thời lượng: {s.duration}</div>
              )}
              <div className="fw-bold mb-3">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(s.price || 0))}
              </div>
              {onBook && (
                <button className="btn btn-primary" onClick={() => onBook(s.key)}>{bookLabel}</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServicesGrid;


