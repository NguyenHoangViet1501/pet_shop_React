import React from 'react';
import { useNavigate } from 'react-router-dom';

const AddressModal = ({ show, addresses, loading, onClose, onSelect }) => {
  const navigate = useNavigate();
  if (!show) return null;

  const renderLine = (addr) => {
    // Support both shapes: { line } or { detailAddress, ward, state, city }
    if (addr.line) return addr.line;
    const parts = [addr.detailAddress, addr.ward, addr.state, addr.city].filter(Boolean);
    return parts.join(', ');
  };

  const getName = (addr) => addr.contactName || addr.fullName || '';

  return (
    <>
      {/* Backdrop with higher z-index */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1060 }}
        onClick={onClose}
      />

      {/* Modal with higher z-index */}
      <div
        className="modal fade show d-block"
        style={{ zIndex: 1065 }}
        onClick={onClose}
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content" style={{ borderRadius: 20, overflow: 'hidden' }}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none' }}>
              <h5 style={{ margin: 0, fontWeight: 700 }}>📍 Chọn địa chỉ</h5>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: 20, padding: '6px 16px' }}
                    onClick={() => {
                    try { onClose && onClose(); } catch (e) { }
                    const loc = window.location.pathname + window.location.search;
                    const sep = loc.includes('?') ? '&' : '?';
                    const returnToRaw = loc.includes('openAdoption') ? loc : (loc + sep + 'openAdoption=1');
                    // persist return info to localStorage so we can recover even if query params lost
                    try {
                      localStorage.setItem('adoption_return_pet', JSON.stringify({ returnTo: returnToRaw, timestamp: Date.now() }));
                    } catch (e) { /* ignore */ }
                    const returnTo = encodeURIComponent(returnToRaw);
                    navigate(`/profile?tab=addresses&returnTo=${returnTo}`);
                  }}
                >
                  + Thêm địa chỉ
                </button>
                <button
                  className="btn-close btn-close-white"
                  onClick={onClose}
                  style={{ opacity: 0.8 }}
                />
              </div>
            </div>

            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: 24 }}>
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
                      className="card p-3"
                      key={addr.id}
                      style={{
                        borderRadius: 16,
                        border: addr.isDefault ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        background: addr.isDefault ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' : 'white',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <p className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: 16 }}>
                            {getName(addr)}
                            {addr.isDefault && (
                              <span
                                className="badge ms-2"
                                style={{ background: '#3b82f6', fontSize: 11, fontWeight: 600 }}
                              >
                                Mặc định
                              </span>
                            )}
                          </p>
                          <p className="mb-1" style={{ color: '#475569', fontSize: 14 }}>📞 {addr.phone}</p>
                          <p className="text-muted mb-0" style={{ fontSize: 14 }}>🏠 {renderLine(addr)}</p>
                        </div>
                        <button
                          className="btn"
                          style={{
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: 'white',
                            borderRadius: 12,
                            padding: '10px 24px',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                          }}
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
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                  <p className="text-muted mb-3">Bạn chưa có địa chỉ nào</p>
                  <button
                    className="btn"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: 'white',
                      borderRadius: 12,
                      padding: '12px 28px',
                      fontWeight: 600
                    }}
                    onClick={() => {
                      try { onClose && onClose(); } catch (e) { }
                      const loc = window.location.pathname + window.location.search;
                      const sep = loc.includes('?') ? '&' : '?';
                      const returnToRaw = loc.includes('openAdoption') ? loc : (loc + sep + 'openAdoption=1');
                      try {
                        localStorage.setItem('adoption_return_pet', JSON.stringify({ returnTo: returnToRaw, timestamp: Date.now() }));
                      } catch (e) {}
                      const returnTo = encodeURIComponent(returnToRaw);
                      navigate(`/profile?tab=addresses&returnTo=${returnTo}`);
                    }}
                  >
                    + Thêm địa chỉ mới
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

