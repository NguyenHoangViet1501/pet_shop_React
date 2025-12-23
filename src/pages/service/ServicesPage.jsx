import React, { useEffect, useRef, useState } from "react";
import BookingModal from "../../components/services/BookingModal";
import { useNavigate, useLocation } from "react-router-dom";
import { servicesAPI } from "../../api";
import ServicesIntroSlider from "../../components/services/ServicesIntroSlider";
import ServicesList from "../../components/services/ServicesList";

const ServicesPage = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const servicesRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");

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
    if (routerLocation.state?.id) {
      setSelectedServiceId(routerLocation.state.id);
    }
  }, [routerLocation.state]);

  const handleBookFromCard = (serviceId) => {
    if (routerLocation.pathname === "/") {
      navigate("/services", { state: { id: serviceId } });
    } else {
      setSelectedServiceId(serviceId);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="page" id="services">
      <div className="container page-content">
        <ServicesIntroSlider />
        <div className="mb-5">
          {loadingServices && (
            <div className="text-muted text-center">Đang tải dịch vụ...</div>
          )}
          {!loadingServices && servicesError && (
            <div className="text-danger text-center mb-3">{servicesError}</div>
          )}
          {!loadingServices && services.length > 0 && (
            <ServicesList services={services} onBook={handleBookFromCard} />
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
          initialServiceId={selectedServiceId}
        />
      </div>
    </div>
  );
};

export default ServicesPage;
