import React from 'react';
import { useNavigate } from 'react-router-dom';

const AddressModal = ({ show, addresses, loading, onClose, onSelect }) => {
  const navigate = useNavigate();
  if (!show) return null;

  const renderLine = (addr) => {
    const parts = [
      addr.line || addr.detailAddress,
      addr.ward,
      addr.district || addr.state,
      addr.city
    ].filter(Boolean);
    return parts.join(', ');
  };

  const getName = (addr) => addr.contactName || addr.fullName || '';

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1060 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="modal fade show d-block"
        style={{ zIndex: 1065 }}
        onClick={onClose}
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-map-marker-alt text-primary me-2"></i>
                Chọn địa chỉ
              </h5>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    try { onClose && onClose(); } catch (e) { }
                    const loc = window.location.pathname + window.location.search;
                    const sep = loc.includes('?') ? '&' : '?';
                    const returnToRaw = loc.includes('openAdoption') ? loc : (loc + sep + 'openAdoption=1');
                    try {
                      localStorage.setItem('adoption_return_pet', JSON.stringify({ returnTo: returnToRaw, timestamp: Date.now() }));
                    } catch (e) { }
                    const returnTo = encodeURIComponent(returnToRaw);
                    navigate(`/profile?tab=addresses&returnTo=${returnTo}`);
                  }}
                >
                  <i className="fas fa-plus me-1"></i>Thêm địa chỉ
                </button>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                />
              </div>
            </div>

            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Đang tải địa chỉ...</p>
                </div>
              ) : addresses && addresses.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {addresses.map((addr) => (
                    <div
                      className={`border rounded p-3 ${addr.isDefault ? 'border-primary bg-light' : ''}`}
                      key={addr.id}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <p className="fw-bold mb-1">
                            {getName(addr)}
                            {addr.isDefault && (
                              <span className="badge bg-primary ms-2">Mặc định</span>
                            )}
                          </p>
                          <p className="mb-1 text-muted small">
                            <i className="fas fa-phone me-1"></i>{addr.phone}
                          </p>
                          <p className="text-muted small mb-0">
                            <i className="fas fa-map-marker-alt me-1"></i>{renderLine(addr)}
                          </p>
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onSelect(addr)}
                        >
                          Chọn
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <p className="text-muted mb-3">Bạn chưa có địa chỉ nào</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      try { onClose && onClose(); } catch (e) { }
                      const loc = window.location.pathname + window.location.search;
                      const sep = loc.includes('?') ? '&' : '?';
                      const returnToRaw = loc.includes('openAdoption') ? loc : (loc + sep + 'openAdoption=1');
                      try {
                        localStorage.setItem('adoption_return_pet', JSON.stringify({ returnTo: returnToRaw, timestamp: Date.now() }));
                      } catch (e) { }
                      const returnTo = encodeURIComponent(returnToRaw);
                      navigate(`/profile?tab=addresses&returnTo=${returnTo}`);
                    }}
                  >
                    <i className="fas fa-plus me-2"></i>Thêm địa chỉ mới
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressModal;
