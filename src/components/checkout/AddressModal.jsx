import React from 'react';

const AddressModal = ({ show, addresses, loading, onClose, onSelect }) => {
  if (!show) return null;

  const renderLine = (addr) => {
    // Support both shapes: { line } or { detailAddress, ward, state, city }
    if (addr.line) return addr.line;
    const parts = [addr.detailAddress, addr.ward, addr.state, addr.city].filter(Boolean);
    return parts.join(', ');
  };

  const getName = (addr) => addr.contactName || addr.fullName || '';

  return (
    <div className="modal fade show d-block">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5>Chọn địa chỉ</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            {loading ? (
              <p>Đang tải...</p>
            ) : addresses && addresses.length > 0 ? (
              addresses.map((addr) => (
                <div className="card mb-3 p-3" key={addr.id}>
                  <p className="fw-bold">
                    {getName(addr)} {addr.isDefault && <span>(Mặc định)</span>}
                  </p>
                  <p>{addr.phone}</p>
                  <p className="text-muted">{renderLine(addr)}</p>
                  <div>
                    <button
                      className="btn btn-primary"
                      onClick={() => onSelect(addr)}
                    >
                      Chọn
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>Không có địa chỉ nào. Vui lòng thêm địa chỉ trong trang cá nhân.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
