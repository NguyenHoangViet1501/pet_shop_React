import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { petsApi } from "../../api/pets";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { adoptApi, addressAPI } from "../../api";
import { AdoptionApplicationModal } from "../../components/adoption/AdoptionModal";
import AddressModal from "../../components/checkout/AddressModal";
import Button from "../../components/ui/button/Button";
import "./PetDetail.css";

const PetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [similar, setSimilar] = useState([]);
  
  // UI States
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const descriptionRef = useRef(null);
  
  // Adoption Logic
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        const res = await petsApi.getPetById(id);
        const data = res?.result ?? res?.data ?? null;

        if (!data) {
          setError('Không tìm thấy thú cưng.');
          setLoading(false);
          return;
        }

        setPet(data);

        // Images logic
        const imgs = data.petImage || (data.images ? data.images : []);
        let firstImg = "https://via.placeholder.com/600x400?text=No+Image";
        
        if (imgs && imgs.length > 0) {
           const primary = imgs.find(img => img.isPrimary === 1 || img.isPrimary === '1');
           firstImg = primary ? (primary.imageUrl || primary.url) : (imgs[0].imageUrl || imgs[0].url || imgs[0]);
        } else if (data.imageUrl) {
            firstImg = data.imageUrl;
        } else if (data.image) {
            firstImg = data.image;
        }
        setActiveImage(firstImg);

        // Similar pets
        if (data.animal) {
          try {
            const sim = await petsApi.getPets({ animal: data.animal, isDeleted: "0", size: 6 });
            const list = (sim?.result?.content ?? sim?.data ?? [])
              .filter((p) => String(p.id) !== String(data.id))
              .slice(0, 5);
            setSimilar(list);
          } catch (e) {
            console.error("Error fetching similar pets:", e);
          }
        }
      } catch (err) {
        setError("Không thể tải thông tin thú cưng");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPet();
      window.scrollTo(0, 0);
    }
  }, [id]);

  useEffect(() => {
    if (descriptionRef.current) {
      if (descriptionRef.current.scrollHeight > 250) {
        setShowExpandButton(true);
      } else {
        setShowExpandButton(false);
      }
    }
  }, [pet]);

  // Handle auto-open adoption modal
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      if (params.get('openAdoption')) {
        setIsApplicationOpen(true);
      } else {
        const raw = localStorage.getItem('adoption_return_pet');
        if (raw) {
           const parsed = JSON.parse(raw);
           if (parsed && parsed.returnTo && parsed.returnTo.includes(window.location.pathname)) {
             setIsApplicationOpen(true);
             localStorage.removeItem('adoption_return_pet');
           }
        }
      }
    } catch (e) { }
  }, [location.search]);

  // Address logic
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
          console.error("Error fetching addresses", e);
        } finally {
          setLoadingAddresses(false);
        }
      }
    };
    if (isApplicationOpen && token) fetchAddresses();
  }, [isApplicationOpen, token]);

  const handleAdoptClick = () => {
    if (!user) {
      showToast("Vui lòng đăng nhập để gửi yêu cầu nhận nuôi!", "warning");
      localStorage.setItem("adoption_return_pet", JSON.stringify({
         returnTo: location.pathname + "?openAdoption=1"
      }));
      navigate("/login");
      return;
    }
    setIsApplicationOpen(true);
  };

  const handleApplicationSubmit = async (formData) => {
    if (!pet || !user) return;
    setIsSubmitting(true);
    try {
      const payload = {
        userId: user?.id ? Number(user.id) : null,
        petId: pet?.id ? Number(pet.id) : null,
        addressId: formData.addressId ? Number(formData.addressId) : null,
        note: formData.reason || "",
        job: formData.job || "",
        income: (function () {
          const map = {
            'under-10m': 'Dưới 10 triệu',
            '10-20m': '10-20 triệu',
            '20-30m': '20-30 triệu',
            'above-30m': 'Trên 30 triệu'
          };
          return formData.income ? (map[formData.income] || formData.income) : "";
        })(),
        liveCondition: formData.conditions || "",
        isOwnPet: (function () {
          if (typeof formData.isOwnPet !== 'undefined') return String(formData.isOwnPet);
          if (typeof formData.is_own_pet !== 'undefined') return String(formData.is_own_pet);
          if (typeof formData.experience !== 'undefined') return formData.experience === '1' ? '1' : '0';
          return '0';
        })(),
      };
      
      const res = await adoptApi.createAdoptRequest(payload, token);
      
      showToast("Gửi yêu cầu nhận nuôi thành công!", "success");
      setIsApplicationOpen(false);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Không thể gửi yêu cầu.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-content text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="container page-content">
        <div className="alert alert-warning d-flex justify-content-between align-items-center">
          <div>{error || "Không tìm thấy thú cưng."}</div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/adoption")}>
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // --- Helpers for Display ---
  const getGenderLabel = (g) => {
      const lower = String(g).toLowerCase();
      if (lower.includes('male') || lower === 'đực') return 'Đực';
      if (lower.includes('female') || lower === 'cái') return 'Cái';
      return g;
  };

  const getAgeLabel = (a) => {
      if (!a) return 'N/A';
      if (!isNaN(a)) return `${a} tuổi`;
      return a;
  }
  
  const isAvailable = pet.status === 'AVAILABLE';

  // Extract images
  const petImages = pet.petImage || (pet.images ? pet.images : []);
  const imageList = petImages.length > 0 ? petImages : (pet.imageUrl ? [{ imageUrl: pet.imageUrl }] : []);

  return (
    <div className="container page-content py-4">
      {/* Zoom Modal */}
      {isZoomed && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.8)",
            zIndex: 1050,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "zoom-out",
          }}
          onClick={() => setIsZoomed(false)}
        >
          <img
            src={activeImage}
            alt="Zoomed Pet"
            className="rounded-3 shadow-lg"
            style={{
              width: "600px",
              height: "600px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              backgroundColor: "white",
              cursor: "default",
              padding: "1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="row g-5">
        {/* Left Column: Images + Description */}
        <div className="col-lg-6">
          <div className="card border-0 mb-3">
            <img
              src={activeImage}
              alt={pet.name}
              className="card-img-top rounded-4"
              style={{
                width: "100%",
                height: "480px",
                objectFit: "cover",
                cursor: "zoom-in",
              }}
              onClick={() => setIsZoomed(true)}
            />
          </div>

          {imageList.length > 0 && (
            <div className="d-flex gap-2 overflow-auto pb-2 mb-4">
              {imageList.map((img, index) => {
                const url = img.imageUrl || img.url || img;
                return (
                    <div
                    key={index}
                    className={`rounded-3 overflow-hidden border ${
                        activeImage === url
                        ? "border-primary border-2"
                        : "border-transparent"
                    }`}
                    style={{
                        width: "80px",
                        height: "80px",
                        cursor: "pointer",
                        flexShrink: 0,
                    }}
                    onClick={() => setActiveImage(url)}
                    >
                    <img
                        src={url}
                        alt={`Thumbnail ${index}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    </div>
                );
              })}
            </div>
          )}

          {/* Description Section */}
          <div className="mt-4">
            <h5 className="fw-bold text-uppercase mb-3">Mô tả/Câu chuyện</h5>
            <div
              className={`position-relative ${!isExpanded ? "overflow-hidden" : ""}`}
              style={{ maxHeight: isExpanded ? "none" : "250px" }}
            >
              <p
                ref={descriptionRef}
                className="text-muted"
                style={{ whiteSpace: "pre-line" }}
              >
                {pet.description || "Chưa có mô tả cho thú cưng này."}
              </p>
              {!isExpanded && showExpandButton && (
                <div
                  className="position-absolute bottom-0 start-0 w-100 h-50"
                  style={{ background: "linear-gradient(transparent, white)" }}
                ></div>
              )}
            </div>
            {showExpandButton && (
              <button
                className="btn btn-outline-primary btn-sm mt-2 rounded-pill px-4"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Thu gọn" : "Xem thêm"}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Info + Similar Pets */}
        <div className="col-lg-6">
          <div className="text-primary fw-bold mb-2">
            <Link to="/adoption" className="text-decoration-none text-primary">
              Nhận nuôi
            </Link>{" "}
            &gt; {pet.animal || "Thú cưng"}
          </div>
          <h1 className="fw-bold mb-2 h2">{pet.name}</h1>

          {/* Status badge */}
          <div className="h3 fw-bold mb-3" style={{ color: "#fd7e14" }}>
              {isAvailable ? "Tìm chủ nhân yêu thương" : "Đã có chủ"}
          </div>

           {/* Metrics / Status Badges */}
           <div className="mb-4 d-flex align-items-center gap-2 flex-wrap">
             {pet.vaccinated && (
                <span className="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-3 py-2">
                    <i className="fas fa-syringe me-2"></i>Đã tiêm phòng
                </span>
             )}
             {pet.sterilized && (
                <span className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill px-3 py-2">
                    <i className="fas fa-cut me-2"></i>Đã triệt sản
                </span>
             )}
             
             <div className="text-warning small ms-2">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <span className="text-muted ms-1">(Yêu thích)</span>
             </div>
           </div>

          <div className="mb-4">
             {isAvailable ? (
                <div className="fw-semibold mb-1 text-success">
                    <i className="fas fa-check-circle me-1"></i>Trạng thái: Sẵn sàng
                </div>
             ) : (
                <div className="fw-semibold mb-1 text-danger">
                    <i className="fas fa-times-circle me-1"></i>Trạng thái: Không khả dụng
                </div>
             )}
          </div>

          {/* Quick Info Grid */}
          <div className="bg-light bg-opacity-50 p-4 rounded-4 mb-4 border">
            <h6 className="fw-bold mb-3 text-uppercase text-secondary small ls-1">Thông tin nhanh</h6>
            <div className="row g-3">
                <div className="col-6">
                    <div className="d-flex align-items-center bg-white p-3 rounded-3 shadow-sm h-100 border">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                             <i className="fas fa-venus-mars text-primary"></i>
                        </div>
                        <div>
                            <div className="small text-muted mb-1">Giới tính</div>
                            <div className="fw-bold text-dark">{getGenderLabel(pet.gender)}</div>
                        </div>
                    </div>
                </div>
                <div className="col-6">
                    <div className="d-flex align-items-center bg-white p-3 rounded-3 shadow-sm h-100 border">
                        <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                            <i className="fas fa-weight-hanging text-success"></i>
                        </div>
                        <div>
                            <div className="small text-muted mb-1">Cân nặng</div>
                            <div className="fw-bold text-dark">{pet.weight ? `${pet.weight} kg` : "N/A"}</div>
                        </div>
                    </div>
                </div>
                <div className="col-6">
                    <div className="d-flex align-items-center bg-white p-3 rounded-3 shadow-sm h-100 border">
                        <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                            <i className="fas fa-birthday-cake text-warning"></i>
                        </div>
                        <div>
                            <div className="small text-muted mb-1">Tuổi/Nhóm tuổi</div>
                            <div className="fw-bold text-dark">{getAgeLabel(pet.age || pet.ageGroup)}</div>
                        </div>
                    </div>
                </div>
                <div className="col-6">
                    <div className="d-flex align-items-center bg-white p-3 rounded-3 shadow-sm h-100 border">
                        <div className="bg-info bg-opacity-10 p-2 rounded-circle me-3">
                            <i className="fas fa-palette text-info"></i>
                        </div>
                        <div>
                            <div className="small text-muted mb-1">Màu sắc</div>
                            <div className="fw-bold text-dark">{pet.color || "N/A"}</div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-3 mb-5">
            <Button
              className={`btn-lg px-4 text-white fw-bold w-100 shadow-sm ${!isAvailable ? "btn-secondary" : ""}`}
              style={{
                backgroundColor: isAvailable ? "#fd7e14" : undefined,
                borderColor: isAvailable ? "#fd7e14" : undefined,
                height: "56px"
              }}
              onClick={handleAdoptClick}
              disabled={!isAvailable}
            >
              <i className="fas fa-paw me-2"></i>
              {isAvailable ? "Gửi Yêu Cầu Nhận Nuôi" : "Đã Được Nhận Nuôi"}
            </Button>
            
            <Link
              to="/adoption"
              className="btn btn-outline-secondary btn-lg px-4 d-flex align-items-center justify-content-center"
              style={{height: "56px"}}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Quay lại
            </Link>
          </div>

          {/* Similar Pets Section */}
          {similar.length > 0 && (
            <div className="mt-5 pt-4 border-top">
              <h5 className="fw-bold text-uppercase mb-3 text-secondary">
                Có thể bạn cũng thích
              </h5>
              <div className="d-flex flex-column gap-3">
                {similar.map((p) => {
                     const pImg = (p.petImage && p.petImage.length > 0) ? p.petImage[0].imageUrl : (p.imageUrl || p.image || "https://via.placeholder.com/80");
                     return (
                        <div
                            key={p.id}
                            className="d-flex gap-3 align-items-center p-2 rounded border hover-shadow transition-all bg-white"
                            style={{ cursor: "pointer", transition: "0.2s" }}
                            onClick={() => navigate(`/adoption/${p.id}`)}
                        >
                            <img
                            src={pImg}
                            alt={p.name}
                            className="rounded-3 border"
                            style={{
                                width: "80px",
                                height: "80px",
                                objectFit: "cover",
                            }}
                            />
                            <div>
                            <div className="fw-bold text-dark mb-1">{p.name}</div>
                            <div className="small text-muted">
                                <span className="me-2"><i className="fas fa-venus-mars small me-1"></i>{getGenderLabel(p.gender)}</span>
                                <span><i className="fas fa-clock small me-1"></i>{p.age} tuổi</span>
                            </div>
                            <div className="fw-bold mt-1 small" style={{color: "#fd7e14"}}>Miễn phí</div>
                            </div>
                        </div>
                     );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

       {/* Adoption Application Modal */}
      <AdoptionApplicationModal
        pet={pet}
        isOpen={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
        onSubmit={handleApplicationSubmit}
        submitting={isSubmitting}
        onShowAddressModal={() => {
          try {
            localStorage.setItem("adoption_selected_pet", JSON.stringify(pet));
          } catch (e) {}
          setShowAddressModal(true);
        }}
      />

      {/* Address Modal */}
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

export default PetDetail;
