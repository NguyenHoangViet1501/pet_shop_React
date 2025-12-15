const SelectedItemCard = ({ selectedItems = [] }) => {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="mb-3">Sản phẩm đã chọn</h5>

        {selectedItems.map((item) => (
          <div
            key={item.cartItemId}
            className="d-flex align-items-center border-bottom py-2"
          >
            <img
              src={item.image}
              alt={item.name}
              style={{ width: 60, height: 60, objectFit: "cover" }}
              className="rounded me-3"
            />

            <div className="flex-grow-1">
              <div className="fw-semibold">{item.name}</div>
              <div className="text-muted small">
                {item.variantName} × {item.quantity}
              </div>
            </div>

            <div className="fw-bold text-end">
              {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default SelectedItemCard;
