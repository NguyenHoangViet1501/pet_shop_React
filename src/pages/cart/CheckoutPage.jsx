import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { useCartQuery } from "../../hooks/useCart";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

import ShippingForm from "../../components/checkout/ShippingForm";
import PaymentMethod from "../../components/checkout/PaymentMethod";
import OrderSummary from "../../components/checkout/OrderSummary";
import AddressModal from "../../components/checkout/AddressModal";

import { addressAPI } from "../../api/address";
// import { orderAPI } from "../../api/order"; // <-- bạn cần có file này

const CheckoutPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { user, token } = useAuth();
  const { showToast } = useToast();

  // ✅ cart từ API
  const { data, isLoading, isError } = useCartQuery();
  const items = data?.result?.items || [];

  // ✅ form state
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: "",
    notes: "",
    paymentMethod: "",
  });

  // nếu user load sau → cập nhật lại fullname/phone
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // ✅ address modal state
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

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

          setFormData((prev) => {
            if (prev.address) return prev;
            return {
              ...prev,
              address: formatted,
            };
          });
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

  // ✅ change handler
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

  // ✅ totals
  const subtotal = items.reduce(
    (sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 0),
    0
  );
  const shipping = 5;
  const total = subtotal + shipping;

  // ✅ guards
  if (!user) {
    return (
      <div className="container page-content">
        <div className="alert alert-warning">
          Vui lòng đăng nhập để tiếp tục thanh toán.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container page-content text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container page-content">
        <div className="alert alert-danger">
          Không thể tải giỏ hàng. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container page-content">
        <div className="alert alert-info">Giỏ hàng của bạn đang trống.</div>
      </div>
    );
  }

  // ✅ submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.address) {
      showToast("Vui lòng chọn địa chỉ giao hàng", "error");
      return;
    }

    try {
      // TODO: bạn thay bằng API thật của bạn
      // await orderAPI.createOrder({
      //   items,
      //   address: formData.address,
      //   paymentMethod: formData.paymentMethod,
      //   notes: formData.notes,
      // });

      showToast("Đặt hàng thành công!", "success");

      // cart sẽ tự refetch lại (trống) nếu backend đã clear cart
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      navigate("/orders");
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
            <OrderSummary items={items} shipping={shipping} total={total} />
            <button type="submit" className="btn btn-primary w-100 mt-3">
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
