import React, { useEffect, useRef, useState } from "react";
import ServicesGrid from "../../components/services/ServicesGrid";
import BookingModal from "../../components/services/BookingModal";
import { useNavigate, useLocation } from "react-router-dom";
import { servicesAPI } from "../../api";

const ServicesPage = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const servicesRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceKey, setSelectedServiceKey] = useState("");

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingServices(true);
      setServicesError("");
      try {
        const list = await servicesAPI.getActiveServices();
        if (!cancelled && Array.isArray(list)) setServices(list);
      } catch (e) {
        if (!cancelled) setServicesError("Không tải được dịch vụ.");
      } finally {
        if (!cancelled) setLoadingServices(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // 🟢 Auto chọn dịch vụ khi được navigate từ HomePage
  useEffect(() => {
    if (routerLocation.state?.key) {
      setSelectedServiceKey(routerLocation.state.key);
    }
  }, [routerLocation.state]);

  const handleBookFromCard = (serviceKey) => {
    if (routerLocation.pathname === "/") {
      navigate("/services", { state: { key: serviceKey } });
    } else {
      setSelectedServiceKey(serviceKey);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="page" id="services">
      <div className="container page-content">
        <h3 ref={servicesRef} className="text-center mb-3">
          Dịch vụ của chúng tôi
        </h3>
        <p
          className="text-center text-muted mb-4 mx-auto"
          style={{ maxWidth: 760 }}
        >
          Lựa chọn từ danh sách dịch vụ chuyên nghiệp, được thiết kế toàn diện
          cho nhu cầu của thú cưng.
        </p>

        <div className="mb-5">
          {loadingServices && (
            <div className="text-muted text-center">Đang tải dịch vụ...</div>
          )}
          {!loadingServices && servicesError && (
            <div className="text-danger text-center mb-3">{servicesError}</div>
          )}
          {!loadingServices && services.length > 0 && (
            <ServicesGrid services={services} onBook={handleBookFromCard} />
          )}
          {!loadingServices && !servicesError && services.length === 0 && (
            <div className="text-center text-muted">
              Chưa có dịch vụ để hiển thị.
            </div>
          )}
        </div>

        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          services={services}
          initialServiceKey={selectedServiceKey}
        />
      </div>
    </div>
  );
};

export default ServicesPage;
