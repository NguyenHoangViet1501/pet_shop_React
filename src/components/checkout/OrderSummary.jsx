const OrderSummary = ({ items, shipping, total, onSubmit }) => {
  return (
    <div className="card">
      <div className="card-body">
        <h5>Đơn hàng của bạn</h5>

        {items.map((item) => (
          <div key={item.id} className="d-flex justify-content-between">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>
              {console.log(item.price)}
              {(item.price * item.quantity).toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </span>
          </div>
        ))}

        <div className="d-flex justify-content-between">
          <span>Phí vận chuyển</span>
          <span>
            {shipping.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </div>

        <hr />

        <div className="d-flex justify-content-between fw-bold">
          <span>Tổng cộng</span>
          <span>
            {total.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}{" "}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
