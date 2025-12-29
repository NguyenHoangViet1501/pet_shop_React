import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCartQuery } from "../../hooks/useCart";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import { useAuth } from "../../context/AuthContext";
import { addressAPI, orderAPI } from "../../api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

const CartPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const { showToast } = useToast();

  const fetchAddresses = useCallback(async () => {
    if (!token) return;

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

        const defaultAddr = mapped.find((a) => a.isDefault);
        if (defaultAddr) {
          const formattedAddress =
            `${defaultAddr.fullName} - ${defaultAddr.phone} - ${defaultAddr.line}, ` +
            `${defaultAddr.ward}, ${defaultAddr.district}, ${defaultAddr.city}`;

          setAddress(formattedAddress);


        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchAddresses();
    }
  }, [token, fetchAddresses]);

  const { data, isLoading, isError } = useCartQuery();
  if (!user) {
    return (
      <div className="container page-content">
        <h1 className="mb-4">Giỏ hàng</h1>

        <div className="card">
          <div className="card-body text-center py-5">
            <i className="fas fa-user-lock fa-3x text-muted mb-3"></i>
            <h5>Bạn chưa đăng nhập</h5>
            <p className="text-muted">
              Vui lòng đăng nhập để xem giỏ hàng của bạn
            </p>
            <Link to="/login" className="btn btn-primary">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container page-content text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (isError || !data?.result) {
    return (
      <div className="container page-content text-center py-5">
        <div className="alert alert-danger">
          Không thể tải giỏ hàng. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  console.log("user", user);
  const items = data.result.items || [];

  const handleToggleSelect = (itemId, isSelected) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  console.log("📍 Current address state:", address);
  const handleCheckout = async () => {
    const selectedCartItemIds = Array.from(selectedItems);

    if (selectedCartItemIds.length === 0) {
      console.warn("Chưa chọn sản phẩm nào");
      return;
    }

    const selectedItemsList = items.filter((item) =>
      selectedItems.has(item.id)
    );

    const checkoutData = {
      shippingAmount: 30000,
      discountPercent: 0.1,
      note: "",
      items: selectedItemsList.map((item) => ({
        cartItemId: item.id,
        productVariantId: item.productVariantId,
        name: item.productName,
        variantName: item.variantName,
        image: item.imageUrl,
        price: item.unitPrice,
        quantity: item.quantity,
      })),
    };

    try {
      const checkPayload = {
        items: selectedItemsList.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        })),
      };
      try {
        const checkRes = await orderAPI.checkStock(checkPayload, token);
        console.log("checkRes", checkRes);

        if (!checkRes.success) {
          showToast("Số lượng sản phẩm không đủ", "error");
          return;
        }

        // OK → tiếp tục tạo order
      } catch (error) {
        console.error("check stock error", error);

        // ⬇️ lấy message backend trả về
        const message =
          error?.response?.data?.message ||
          error?.data?.message ||
          "Số lượng sản phẩm không đủ";

        showToast(message, "error");
        return;
      }
      navigate("/checkout", { state: checkoutData });
    } catch (err) {
      console.error(err);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container page-content">
        <h1 className="mb-4">Giỏ hàng</h1>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="text-center py-5">
                  <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                  <h5>Giỏ hàng trống</h5>

                  <p className="text-muted">
                    Hãy thêm một số sản phẩm vào giỏ hàng của bạn
                  </p>
                  <Link to="/products" className="btn btn-primary">
                    Tiếp tục mua sắm
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-content">
      <h1 className="mb-4">Giỏ hàng</h1>
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              {items.map((item) => (
                <CartItem
                  key={item.productVariantId}
                  item={{
                    id: item.id,
                    productVariantId: item.productVariantId,
                    stockQuantity: item.stockQuantity, // Thêm productVariantId
                    name: item.productName,
                    variantName: item.variantName,
                    image: item.imageUrl,
                    price: item.unitPrice,
                    quantity: item.quantity,
                  }}
                  isSelected={selectedItems.has(item.id)}
                  onToggleSelect={handleToggleSelect}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <CartSummary
            items={items}
            selectedItems={selectedItems}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
};

export default CartPage;
