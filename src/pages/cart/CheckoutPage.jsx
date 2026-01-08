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
import Button from "../../components/ui/button/Button";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const { user, token } = useAuth();
  const { showToast } = useToast();

  // 🔑 DATA TỪ CART PAGE HOẶC ORDERS PAGE
  const locationState = location.state;
  const isFromOrders = locationState?.from === "orders";
  const orderToRepay = locationState?.order;
  const checkoutData = isFromOrders ? null : locationState;

  // Nếu từ orders, fetch chi tiết order và redirect thẳng sang VNPAY
  useEffect(() => {
    if (isFromOrders && orderToRepay?.id && token) {
      setLoadingOrder(true);
      orderAPI
        .getOrderDetail(orderToRepay.id, token)
        .then((res) => {
          if (res?.success && res.result) {
            setOrderDetails(res.result);
            // 🔗 Redirect thẳng sang VNPAY thanh toán
            handleVNPayPayment(orderToRepay.id);
          }
        })
        .catch((err) => {
          console.error("Fetch order detail error:", err);
          showToast("Không tải được chi tiết đơn hàng", "error");
          navigate("/orders");
        })
        .finally(() => setLoadingOrder(false));
    }
  }, [isFromOrders, orderToRepay?.id, token, showToast]);

  // Xử lý redirect VNPAY
  const handleVNPayPayment = async (orderId) => {
    try {
      const res = await paymentAPI.createVnpayPayment(orderId, token);

      if (!res.success) {
        showToast(res.message || "Không nhận được link thanh toán", "error");
        navigate("/orders");
        return;
      }

      const paymentUrl = res?.result?.url;
      if (!paymentUrl) {
        showToast("Không nhận được link thanh toán", "error");
        navigate("/orders");
        return;
      }

      console.log("🔗 Redirecting to VNPAY:", paymentUrl);
      window.location.href = paymentUrl;
    } catch (paymentErr) {
      console.error("Payment error:", paymentErr);
      const message =
        paymentErr?.response?.data?.message ||
        paymentErr?.data?.message ||
        "Lỗi thanh toán";
      showToast(message, "error");
      navigate("/orders");
    }
  };

  // Xử lý items
  let selectedItems = [];
  if (isFromOrders && orderDetails) {
    let items = [];
    if (Array.isArray(orderDetails)) {
      items = orderDetails;
    } else if (orderDetails.items && Array.isArray(orderDetails.items)) {
      items = orderDetails.items;
    } else if (
      orderDetails.orderDetails &&
      Array.isArray(orderDetails.orderDetails)
    ) {
      items = orderDetails.orderDetails;
    }

    selectedItems = items.map((item) => ({
      cartItemId: item.id || item.cartItemId,
      productVariantId:
        item.productVariantId || item.variantId || item.id,
      name: item.productName,
      variantName: item.variantName,
      image: item.imageUrl,
      price: item.unitPrice || item.price,
      quantity: item.quantity,
    }));
  } else {
    selectedItems = checkoutData?.items || [];
  }

  // ⛔ Truy cập thẳng /checkout → quay về cart
  useEffect(() => {
    if (loadingOrder) return;

    if (isFromOrders) {
      if (!orderToRepay || (orderDetails && selectedItems.length === 0)) {
        navigate("/orders");
      }
    } else {
      if (!checkoutData || !checkoutData.items || selectedItems.length === 0) {
        navigate("/cart");
      }
    }
  }, [
    isFromOrders,
    orderToRepay,
    orderDetails,
    checkoutData,
    selectedItems.length,
    navigate,
    loadingOrder,
  ]);

  // 🧾 FORM DATA
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    selectedAddressId: null, // Store address ID instead of string
    addressDisplay: isFromOrders ? orderToRepay?.shippingAddress || "" : "", // For display only
    notes: isFromOrders ? orderToRepay?.note || "" : "",
    paymentMethod: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        phone: user.phone || "",
      }));
    }

    if (isFromOrders && orderToRepay) {
      setFormData((prev) => ({
        ...prev,
        address: prev.address || orderToRepay?.shippingAddress || "",
        notes: prev.notes || orderToRepay?.note || "",
      }));
    }
  }, [user, isFromOrders, orderToRepay]);

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
          const formatted = `${defaultAddr.line}, ${defaultAddr.ward}, ${defaultAddr.district}, ${defaultAddr.city}`;

          setFormData((prev) =>
            prev.selectedAddressId ? prev : {
              ...prev,
              selectedAddressId: defaultAddr.id, // Store ID
              addressDisplay: formatted, // For display
              fullName: defaultAddr.fullName,
              phone: defaultAddr.phone
            }
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
    const formatted = `${addr.line}, ${addr.ward}, ${addr.district}, ${addr.city}`;

    setFormData((prev) => ({
      ...prev,
      selectedAddressId: addr.id, // Store ID
      addressDisplay: formatted, // For display
      fullName: addr.fullName,
      phone: addr.phone
    }));
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

  // Đang load order detail từ orders
  if (loadingOrder || isFromOrders) {
    return (
      <div className="container page-content text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Đang chuyển sang thanh toán...</p>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return null;
  }

  // 🧾 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.selectedAddressId) {
      showToast("Vui lòng chọn địa chỉ giao hàng", "error");
      return;
    }

    if (!formData.paymentMethod) {
      showToast("Vui lòng chọn phương thức thanh toán", "error");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 🔄 NẾU TỪ ORDERS (THANH TOÁN LẠI)
      if (isFromOrders) {
        const orderId = orderToRepay?.id;
        if (!orderId) {
          showToast("Không tìm thấy ID đơn hàng", "error");
          setIsSubmitting(false);
          return;
        }

        // 💳 VNPAY - Redirect thẳng sang thanh toán (bỏ qua checkStock)
        if (formData.paymentMethod === "vnpay") {
          try {
            const res = await paymentAPI.createVnpayPayment(orderId, token);

            if (!res.success) {
              showToast(
                res.message || "Không nhận được link thanh toán",
                "error"
              );
              setIsSubmitting(false);
              return;
            }

            const paymentUrl = res?.result?.url;
            if (!paymentUrl) {
              showToast("Không nhận được link thanh toán", "error");
              setIsSubmitting(false);
              return;
            }

            console.log("🔗 Redirecting to VNPAY:", paymentUrl);
            window.location.href = paymentUrl;
          } catch (paymentErr) {
            console.error("Payment error:", paymentErr);
            const message =
              paymentErr?.response?.data?.message ||
              paymentErr?.data?.message ||
              "Lỗi thanh toán";
            showToast(message, "error");
            setIsSubmitting(false);
          }
          return;
        }

        // 🔄 COD - Update phương thức thanh toán
        try {
          const updateRes = await orderAPI.updatePaymentMethod(
            orderId,
            formData.paymentMethod,
            token
          );

          if (!updateRes.success) {
            showToast(
              updateRes.message || "Không cập nhật được phương thức thanh toán",
              "error"
            );
            setIsSubmitting(false);
            return;
          }
        } catch (updateErr) {
          console.error("Update payment method error:", updateErr);
          const message =
            updateErr?.response?.data?.message ||
            updateErr?.data?.message ||
            "Lỗi cập nhật phương thức thanh toán";
          showToast(message, "error");
          setIsSubmitting(false);
          return;
        }

        showToast("Cập nhật phương thức thanh toán thành công!", "success");
        setTimeout(() => {
          navigate("/orders");
        }, 1000);
        return;
      }

      // 📦 NẾU TỪ CART (ĐẶT HÀNG MỚI)
      const payload = {
        shippingAmount: checkoutData?.shippingAmount || 30000,
        addressId: formData.selectedAddressId, // Send address ID instead of string
        paymentMethod: formData.paymentMethod,
        discountPercent: 0.0,
        note: formData.notes || "",
        items: selectedItems.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        })),
      };

      console.log("📦 ORDER PAYLOAD:", payload);

      const orderRes = await orderAPI.createOrder(payload);

      if (!orderRes.success) {
        showToast(orderRes.message || "Không tạo được đơn hàng", "error");
        setIsSubmitting(false);
        return;
      }

      const { id: orderId, orderCode } = orderRes.result;
      if (!orderId) {
        showToast("Không tạo được đơn hàng", "error");
        setIsSubmitting(false);
        return;
      }

      setOrder(orderRes.result);

      if (formData.paymentMethod === "cod") {
        showToast("Đặt hàng thành công!", "success");
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        // Clear selected items from localStorage
        localStorage.removeItem('cart_selected_items');
        setTimeout(() => {
          navigate("/payment-success", {
            state: { orderId, orderCode, from: "cart" },
          });
        }, 1000);
        return;
      }

      if (formData.paymentMethod === "vnpay") {
        try {
          const res = await paymentAPI.createVnpayPayment(orderId, token);

          if (!res.success) {
            showToast(
              res.message || "Không nhận được link thanh toán",
              "error"
            );
            setIsSubmitting(false);
            return;
          }

          const paymentUrl = res?.result?.url;

          if (!paymentUrl) {
            showToast("Không nhận được link thanh toán", "error");
            setIsSubmitting(false);
            return;
          }

          window.location.href = paymentUrl;
        } catch (paymentErr) {
          console.error("Payment error:", paymentErr);
          const message =
            paymentErr?.response?.data?.message ||
            paymentErr?.data?.message ||
            "Lỗi thanh toán";
          showToast(message, "error");
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      console.error("Checkout error:", err);
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        "Đặt hàng thất bại, vui lòng thử lại";
      showToast(message, "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container page-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Thanh toán</h1>
        {!isFromOrders && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/cart')}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại giỏ hàng
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="row">
          <div className="col-lg-7">
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
            <Button
              type="submit"
              className="w-100 mt-3"
              disabled={!formData.selectedAddressId || !formData.paymentMethod}
              isLoading={isSubmitting}
            >
              Đặt hàng
            </Button>
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
