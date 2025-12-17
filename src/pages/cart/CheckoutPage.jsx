import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

import ShippingForm from "../../components/checkout/ShippingForm";
import PaymentMethod from "../../components/checkout/PaymentMethod";
import OrderSummary from "../../components/checkout/OrderSummary";
import AddressModal from "../../components/checkout/AddressModal";
import SelectedItemCard from "../../components/checkout/SelectedItemCard";

import { addressAPI } from "../../api/address";
import { orderAPI } from "../../api/order";
import { paymentAPI } from "../../api";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [order, setOrder] = useState(null);

  const { user, token } = useAuth();
  const { showToast } = useToast();

  // 🔑 DATA TỪ CART PAGE
  const checkoutData = location.state;
  const selectedItems = checkoutData?.items || [];

  // ⛔ Truy cập thẳng /checkout → quay về cart
  useEffect(() => {
    if (order) return;

    if (!checkoutData || !checkoutData.items) {
      navigate("/cart");
    }
  }, [order, checkoutData, navigate]);

  // 🧾 FORM DATA
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: "",
    notes: "",
    paymentMethod: "",
  });

  // nếu user load sau
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // 📍 ADDRESS MODAL
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAddresses = useCallback(async () => {
    if (!token) return;

    setLoadingAddresses(true);
    try {
      const response = await addressAPI.getUserAddresses(token, 10, 0);

      if (response?.success && Array.isArray(response?.result)) {
        const mapped = response.result.map((addr) => ({
          id: addr.id,
          fullName: addr.contactName,
          phone: addr.phone,
          line: addr.detailAddress,
          city: addr.city,
          district: addr.state,
          ward: addr.ward,
          isDefault: addr.isDefault === "1",
        }));

        mapped.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
        setAddresses(mapped);

        const defaultAddr = mapped.find((a) => a.isDefault);
        if (defaultAddr) {
          const formatted =
            `${defaultAddr.fullName} - ${defaultAddr.phone} - ${defaultAddr.line}, ` +
            `${defaultAddr.ward}, ${defaultAddr.district}, ${defaultAddr.city}`;

          setFormData((prev) =>
            prev.address ? prev : { ...prev, address: formatted }
          );
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Không tải được địa chỉ", "error");
    } finally {
      setLoadingAddresses(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // ✏️ INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectAddress = (addr) => {
    const formatted =
      `${addr.fullName} - ${addr.phone} - ${addr.line}, ` +
      `${addr.ward}, ${addr.district}, ${addr.city}`;

    setFormData((prev) => ({ ...prev, address: formatted }));
    setShowAddressModal(false);
  };

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const shipping = 30000;
  const total = subtotal + shipping;

  // 🔐 GUARD USER
  if (!user) {
    return (
      <div className="container page-content">
        <div className="alert alert-warning">
          Vui lòng đăng nhập để tiếp tục thanh toán.
        </div>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return null; // đang redirect
  }

  // 🧾 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.address) {
      showToast("Vui lòng chọn địa chỉ giao hàng", "error");
      return;
    }

    const payload = {
      shippingAmount: shipping,
      shippingAddress: formData.address,
      paymentMethod: formData.paymentMethod,
      discountPercent: 0.1,
      note: formData.notes,
      items: selectedItems.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
      })),
    };

    console.log("ORDER PAYLOAD:", payload);
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const orderRes = await orderAPI.createOrder(payload);

      const { id: orderId, orderCode } = orderRes.result;
      if (!orderId) {
        showToast("Không tạo được đơn hàng", "error");
        return;
      }

      if (formData.paymentMethod === "cod") {
        showToast("Đặt hàng thành công! ", "success");
        navigate("/payment-success");
        return;
      }

      if (formData.paymentMethod === "vnpay") {
        const res = await paymentAPI.createVnpayPayment(orderId, token);

        const paymentUrl = res?.result?.url;

        if (!paymentUrl) {
          showToast("Không nhận được link thanh toán", "error");
          return;
        }

        // ✅ Redirect sang VNPAY
        window.location.href = paymentUrl;
      }
    } catch (err) {
      console.error(err);
      showToast("Đặt hàng thất bại, vui lòng thử lại", "error");
    }
  };

  return (
    <div className="container page-content">
      <h1 className="mb-4">Thanh toán</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="row">
          <div className="col-lg-7">
            {/* 🛒 SẢN PHẨM ĐÃ CHỌN */}
            <SelectedItemCard selectedItems={selectedItems} />

            <ShippingForm
              formData={formData}
              onChange={handleChange}
              onOpenAddressModal={() => setShowAddressModal(true)}
            />

            <PaymentMethod
              value={formData.paymentMethod}
              onChange={handleChange}
            />
          </div>

          <div className="col-lg-5">
            <OrderSummary
              items={selectedItems}
              shipping={shipping}
              total={total}
            />
            <button
              type="submit"
              className="btn btn-primary w-100 mt-3"
              disabled={!formData.address || !formData.paymentMethod}
            >
              Đặt hàng
            </button>
          </div>
        </div>
      </form>

      <AddressModal
        show={showAddressModal}
        addresses={addresses}
        loading={loadingAddresses}
        onClose={() => setShowAddressModal(false)}
        onSelect={selectAddress}
      />
    </div>
  );
};

export default CheckoutPage;
