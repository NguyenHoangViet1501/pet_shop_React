const AddressModal = ({ show, addresses, loading, onClose, onSelect }) => {
  if (!show) return null;

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
            ) : (
              addresses.map((addr) => (
                <div className="card mb-3 p-3" key={addr.id}>
                  <p className="fw-bold">
                    {addr.fullName} {addr.isDefault && <span>(Mặc định)</span>}
                  </p>
                  <p>{addr.phone}</p>
                  <p>{addr.line}</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => onSelect(addr)}
                  >
                    Chọn
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
