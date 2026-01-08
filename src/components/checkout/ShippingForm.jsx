const ShippingForm = ({ formData, onChange, onOpenAddressModal }) => {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5>Thông tin giao hàng</h5>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label>Họ và tên</label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={onChange}
              className="form-control"
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Số điện thoại</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={onChange}
              className="form-control"
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label>Địa chỉ giao hàng</label>
          <div className="d-flex">
            <input
              className="form-control me-2"
              value={formData.addressDisplay || ""}
              readOnly
              required
            />
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={onOpenAddressModal}
            >
              Chọn
            </button>
          </div>
        </div>

        <textarea
          className="form-control"
          rows="2"
          name="notes"
          value={formData.notes}
          onChange={onChange}
          placeholder="Ghi chú"
        />
      </div>
    </div>
  );
};

export default ShippingForm;
