const PaymentMethod = ({ value, onChange }) => {
  return (
    <div className="card">
      <div className="card-body">
        <h5>Phương thức thanh toán</h5>

        {["cod", "vnpay"].map((method) => (
          <div className="form-check mb-2" key={method}>
            <input
              className="form-check-input"
              type="radio"
              name="paymentMethod"
              value={method}
              checked={value === method}
              onChange={onChange}
            />
            <label className="form-check-label">{method.toUpperCase()}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethod;
