import React, { useState, useEffect } from "react";
import { petsApi, adoptApi, addressAPI } from "../../api";
import AddressModal from "../../components/checkout/AddressModal";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import PetCard from "../../components/pet/PetCard";
import {
  PetDetailModal,
  AdoptionApplicationModal,
} from "../../components/adoption/AdoptionModal";
import { use } from "react";  
import { useNavigate, useLocation } from "react-router-dom";

const AdoptionPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    breed: "",
    age: "",
    minWeight: "",
    maxWeight: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animals, setAnimals] = useState([]);
  const [breeds, setBreeds] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 6;

  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [selectedPet, setSelectedPet] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load địa chỉ user
  useEffect(() => {
    const fetchAddresses = async () => {
      if (token) {
        setLoadingAddresses(true);
        try {
          const res = await addressAPI.getUserAddresses(token, 10, 0);
          if (res?.success && Array.isArray(res.result)) {
            const mapped = res.result.map((addr) => ({
              id: addr.id,
              contactName: addr.contactName,
              phone: addr.phone,
              detailAddress: addr.detailAddress,
              city: addr.city,
              state: addr.state,
              ward: addr.ward,
              isDefault: addr.isDefault === "1",
            }));
            setAddresses(mapped);
          }
        } catch (e) {
          showToast("Không lấy được địa chỉ", "error");
        }
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [user]);

  // Load animals and breeds for filter
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const resAnimals = await petsApi.getAnimals();
        const dataAnimals = resAnimals?.result || resAnimals?.data || [];
        setAnimals(dataAnimals);

        const resBreeds = await petsApi.getBreeds();
        const dataBreeds = resBreeds?.result || resBreeds?.data || [];
        setBreeds(dataBreeds);
      } catch (error) {
        console.error("Failed to load filter data:", error);
      }
    };
    loadFilterData();
  }, []);

  // Load pets from API
  useEffect(() => {
    const loadPets = async () => {
      console.log('[Adoption] loadPets start', { filters, currentPage, time: new Date().toISOString() });
      setLoading(true);
      try {
        // Map filter values từ frontend sang backend
        const params = {
          isDeleted: "0", // Chỉ lấy pets chưa bị xóa
          pageNumber: currentPage,
          size: pageSize,
        };

        if (filters.type) {
          // Dùng giá trị animal trực tiếp từ API (ví dụ: "Dog", "Cat")
          params.animal = filters.type;
        }

        if (filters.breed) {
          params.breed = filters.breed;
        }

        if (filters.minWeight) {
          params.minWeight = filters.minWeight;
        }
        if (filters.maxWeight) {
          params.maxWeight = filters.maxWeight;
        }

        const res = await petsApi.getPets(params);
        const data = res?.result || res?.data || [];
        
        // Nếu data là object có content (pagination), lấy content
        if (data.content) {
          setPets(data.content);
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
        } else if (Array.isArray(data)) {
          setPets(data);
          setTotalPages(1);
          setTotalElements(data.length);
        } else {
          setPets([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } catch (error) {
        console.error("Failed to load pets:", error);
        showToast("Không thể tải danh sách thú cưng", "error");
        setPets([]);
      } finally {
        setLoading(false);
        console.log('[Adoption] loadPets end', { time: new Date().toISOString() });
      }
    };

    loadPets();
  }, [filters, currentPage]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
  };

  const goTo = (page) => {
    const minPage = Math.max(1, page);
    const maxPage = totalPages && totalPages > 0 ? totalPages : minPage;
    const p = Math.min(minPage, maxPage);
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prev = () => {
    if (currentPage > 1) goTo(currentPage - 1);
  };

  const next = () => {
    if (totalPages && currentPage < totalPages) goTo(currentPage + 1);
  };

  const handleAdoptionClick = (pet) => {
    if (!user) {
      showToast("Vui lòng đăng nhập để đăng ký nhận nuôi", "warning");
      return;
    }
    setSelectedPet(pet);
    setIsApplicationOpen(true); // Mở trực tiếp form đăng ký
    // setIsDetailOpen(true); // Bỏ qua modal chi tiết, nhảy thẳng vào form
  };


  const openApplication = () => {
    setIsDetailOpen(false);
    setIsApplicationOpen(true);
  };

  // When opening address modal from the application form, persist the selected pet
  const handleShowAddressModal = () => {
    try {
      if (selectedPet) localStorage.setItem('adoption_selected_pet', JSON.stringify(selectedPet));
    } catch (e) {}
    setShowAddressModal(true);
  };

  // If URL has openAdoption or localStorage contains adoption_selected_pet, open the form and restore selectedPet
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      if (params.get('openAdoption')) {
        // open the application form
        setIsApplicationOpen(true);
        // attempt to restore selectedPet from localStorage
        try {
          const raw = localStorage.getItem('adoption_selected_pet');
          if (raw) {
            const parsed = JSON.parse(raw);
            setSelectedPet(parsed);
            // remove the temp storage after restoring
            try { localStorage.removeItem('adoption_selected_pet'); } catch (e) {}
          }
        } catch (e) { /* ignore */ }
      }
    } catch (e) {}
  }, [location.search]);

  const submitApplication = async (form) => {
    if (isSubmitting) return; // prevent duplicate submissions
    setIsSubmitting(true);
    console.log('[Adoption] submitApplication start', { time: new Date().toISOString() });
    try {
      // Debug: ensure user and selectedPet are present and numeric
      console.log("[Adoption] user:", user);
      console.log("[Adoption] selectedPet:", selectedPet);

      // Build payload matching backend AdoptCreationRequest (coerce ids to numbers)
      const payload = {
        userId: user?.id ? Number(user.id) : null,
        petId: selectedPet?.id ? Number(selectedPet.id) : null,
        addressId: form.addressId ? Number(form.addressId) : null,
        note: form.reason || "",
        job: form.job || "",
        income: (function() {
          const map = {
            'under-10m': 'Dưới 10 triệu',
            '10-20m': '10-20 triệu',
            '20-30m': '20-30 triệu',
            'above-30m': 'Trên 30 triệu'
          };
          return form.income ? (map[form.income] || form.income) : "";
        })(),
        liveCondition: form.conditions || "",
        // include isOwnPet to match backend AdoptCreationRequest (string '1' or '0')
        isOwnPet: (function(){
          if (typeof form.isOwnPet !== 'undefined') return String(form.isOwnPet);
          if (typeof form.is_own_pet !== 'undefined') return String(form.is_own_pet);
          if (typeof form.experience !== 'undefined') return form.experience === '1' ? '1' : '0';
          return '0';
        })(),
      };

      // Basic client-side validation / logging to help debug backend 400s
      console.log("[Adoption] payload:", payload);
      if (!payload.userId) {
        showToast("Lỗi: userId trống. Vui lòng đăng nhập lại.", "error");
        return;
      }
      if (!payload.petId) {
        showToast("Lỗi: petId trống.", "error");
        return;
      }

      const res = await adoptApi.createAdoptRequest(payload, token);
      console.log("[Adoption] response:", res);
      showToast(
        `Đã gửi đơn nhận nuôi ${selectedPet?.name}. Chúng tôi sẽ liên hệ sớm!`,
        "success"
      );
      navigate("/adoption-requests");
    } catch (err) {
      showToast(
        err?.message || "Gửi đơn nhận nuôi thất bại",
        "error"
      );
    }
    finally {
      setIsSubmitting(false);
      console.log('[Adoption] submitApplication end', { time: new Date().toISOString() });
      // Ensure modal is closed regardless of result
      setIsApplicationOpen(false);
      setSelectedPet(null);
    }
  };

  return (
    <div className="page" id="adoption">
      <div className="container page-content">
        <h1 className="mb-4">Nhận nuôi thú cưng</h1>
        <p className="text-muted mb-4">
          Cho những người bạn nhỏ một mái ấm yêu thương
        </p>

        <div className="row">
          <div className="col-lg-3 mb-4">
            <div className="sidebar">
              <h5>Lọc thú cưng</h5>

              <div className="mb-3">
                <label className="form-label">Loại</label>
                <select
                  className="form-select"
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="Dog">Chó</option>
                  <option value="Cat">Mèo</option>
                  <option value="Bird">Chim</option>
                  <option value="Rabbit">Thỏ</option>
                  <option value="Other">Khác</option>

                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Giống loài</label>
                <select
                  className="form-select"
                  value={filters.breed}
                  onChange={(e) => handleFilterChange("breed", e.target.value)}
                >
                  <option value="">Tất cả</option>
                  {breeds.map((b, index) => (
                    <option key={index} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Cân nặng (kg)</label>
                <div className="d-flex gap-2">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Từ"
                    value={filters.minWeight}
                    onChange={(e) => handleFilterChange("minWeight", e.target.value)}
                    min="0"
                  />
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Đến"
                    value={filters.maxWeight}
                    onChange={(e) => handleFilterChange("maxWeight", e.target.value)}
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Đang tải danh sách thú cưng...</p>
              </div>
            ) : (
              <div className="row g-3" id="adoptionPetsList">
                {pets.length > 0 ? (
                  pets.map((pet) => (
                    <PetCard
                      key={pet.id}
                      pet={pet}
                      onAdoptClick={handleAdoptionClick}
                    />
                  ))
                ) : (
                  <div className="col-12">
                    <div className="text-center py-5">
                      <h4>Không tìm thấy thú cưng nào</h4>
                      <p className="text-muted">
                        Hãy thử thay đổi bộ lọc của bạn
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 0 && (
              <div className="d-flex justify-content-center mt-5">
                <div className="d-flex gap-2">
                  <button
                    className="bg-white border rounded-3 d-flex align-items-center justify-content-center"
                    style={{ width: 40, height: 40, color: '#6c757d' }}
                    onClick={prev}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        className={`rounded-3 d-flex align-items-center justify-content-center fw-bold`}
                        style={{
                          width: 40,
                          height: 40,
                          backgroundColor: currentPage === p ? "#ffc107" : "white",
                          color: currentPage === p ? "white" : "#6c757d",
                          borderColor: currentPage === p ? "#ffc107" : "#dee2e6",
                        }}
                        onClick={() => goTo(p)}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    className="bg-white border rounded-3 d-flex align-items-center justify-content-center"
                    style={{ width: 40, height: 40, color: '#6c757d' }}
                    onClick={next}
                    disabled={currentPage === totalPages}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PetDetailModal
        isOpen={isDetailOpen}
        pet={selectedPet}
        onClose={() => setIsDetailOpen(false)}
        onApply={openApplication}
      />

      <AdoptionApplicationModal
        pet={selectedPet}
        isOpen={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
        onSubmit={submitApplication}
        submitting={isSubmitting}
        onShowAddressModal={handleShowAddressModal}
      />
      <AddressModal
        show={showAddressModal}
        addresses={addresses}
        loading={loadingAddresses}
        onClose={() => setShowAddressModal(false)}
        onSelect={(addr) => {
          window.dispatchEvent(
            new CustomEvent("address-selected-adoption", { detail: addr })
          );
          setShowAddressModal(false);
        }}
      />
    </div>
  );
};

export default AdoptionPage;
