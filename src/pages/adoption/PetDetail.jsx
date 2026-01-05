import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { petsApi } from "../../api/pets";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { adoptApi, addressAPI } from "../../api";
import { AdoptionApplicationModal } from "../../components/adoption/AdoptionModal";
import AddressModal from "../../components/checkout/AddressModal";
import "./PetDetail.css";

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [similar, setSimilar] = useState([]);
  const descRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const { user, token } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await petsApi.getPetById(id);
        const data = res?.result ?? res?.data ?? null;
        setPet(data);
        if (data) {
          const imgs = data.images || (data.petImage ? data.petImage : []);
          const first = imgs && imgs.length > 0 ? (imgs[0].imageUrl || imgs[0]) : data.imageUrl;
          setActiveImage(first || "https://via.placeholder.com/600x400?text=No+Image");

          // similar: fetch by animal
          try {
            const sim = await petsApi.getPets({ animal: data.animal, isDeleted: "0", size: 6 });
            const list = (sim?.result?.content ?? sim?.data ?? [])
              .filter((p) => String(p.id) !== String(data.id))
              .slice(0, 6);
            setSimilar(list);
          } catch (e) {
            setSimilar([]);
          }
        }
      } catch (err) {
        console.error("Failed to load pet detail", err);
        setPet(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetch();
    window.scrollTo(0, 0);
  }, [id]);

  // If the URL contains ?openAdoption=1, open the application modal when page loads
  const location = useLocation();
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      if (params.get('openAdoption')) {
        // open the modal; user must be logged in to submit — if not, the form will prompt
        setIsApplicationOpen(true);
      } else {
        // fallback: if localStorage has adoption_return_pet for this page, open modal
        try {
          const raw = localStorage.getItem('adoption_return_pet');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.returnTo && parsed.returnTo.includes(window.location.pathname)) {
              setIsApplicationOpen(true);
              // remove after used
              localStorage.removeItem('adoption_return_pet');
            }
          }
        } catch (e) { /* ignore */ }
      }
    } catch (e) {
      // ignore
    }
  }, [location.search]);

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
          console.error("Không lấy được địa chỉ", e);
        }
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [token]);

  // Loading state
  if (loading) {
    return (
      <div className="pet-detail-page">
        <div className="container page-content py-5">
          <div className="pet-detail-loading">
            <div className="pet-detail-loading-spinner"></div>
            <span className="pet-detail-loading-text">Đang tải thông tin...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!pet) {
    return (
      <div className="pet-detail-page">
        <div className="container page-content py-5">
          <div className="pet-detail-not-found">
            <div className="pet-detail-not-found-icon">🐾</div>
            <p className="pet-detail-not-found-text">Không tìm thấy thú cưng này</p>
            <button
              className="pet-detail-btn-secondary"
              onClick={() => navigate('/adoption')}
            >
              ← Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const thumbnails = pet.images || pet.petImage || [];
  const isHealthGood = pet.healthStatus?.toLowerCase().includes('good') ||
    pet.healthStatus?.toLowerCase().includes('tốt');

  const handleAdoptClick = () => {
    if (!user) {
      showToast('Vui lòng đăng nhập để đăng ký nhận nuôi', 'warning');
      return;
    }
    setIsApplicationOpen(true);
  };

  const handleSubmit = async (form) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = {
        userId: user?.id ? Number(user.id) : null,
        petId: pet?.id ? Number(pet.id) : null,
        addressId: form.addressId ? Number(form.addressId) : null,
        note: form.reason || "",
        job: form.job || "",
        income: (function () {
          const map = {
            'under-10m': 'Dưới 10 triệu',
            '10-20m': '10-20 triệu',
            '20-30m': '20-30 triệu',
            'above-30m': 'Trên 30 triệu'
          };
          return form.income ? (map[form.income] || form.income) : "";
        })(),
        liveCondition: form.conditions || "",
        isOwnPet: (function () {
          if (typeof form.isOwnPet !== 'undefined') return String(form.isOwnPet);
          if (typeof form.is_own_pet !== 'undefined') return String(form.is_own_pet);
          if (typeof form.experience !== 'undefined') return form.experience === '1' ? '1' : '0';
          return '0';
        })(),
      };

      if (!payload.userId) {
        showToast('Lỗi: Vui lòng đăng nhập lại', 'error');
        return;
      }
      if (!payload.petId) {
        showToast('Lỗi: Không tìm thấy thông tin thú cưng', 'error');
        return;
      }

      await adoptApi.createAdoptRequest(payload, token);
      showToast(`Đã gửi đơn nhận nuôi ${pet?.name}`, 'success');
      setIsApplicationOpen(false);
      navigate('/adoption-requests');
    } catch (err) {
      console.error('Adopt submit failed', err);
      showToast(err?.message || 'Gửi đơn thất bại', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="pet-detail-page">
        <div className="container page-content py-5">
          <div className="row g-5">
            {/* Left column - Images */}
            <div className="col-lg-6">
              {/* Main image */}
              <div className="pet-detail-main-image">
                <img src={activeImage} alt={pet.name} />
                {pet.status && (
                  <span className="pet-detail-status-badge">
                    {pet.status}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {thumbnails && thumbnails.length > 0 && (
                <div className="pet-detail-thumbnails">
                  {thumbnails.map((img, i) => {
                    const url = img.imageUrl || img;
                    return (
                      <div
                        key={i}
                        className={`pet-detail-thumb ${activeImage === url ? 'active' : ''}`}
                        onClick={() => setActiveImage(url)}
                      >
                        <img src={url} alt={`${pet.name} - ${i + 1}`} />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Description section */}
              <div className="pet-detail-description">
                <h3 className="pet-detail-description-title">
                  📝 Mô tả chi tiết
                </h3>
                <div
                  className={`pet-detail-description-gradient ${expanded ? 'expanded' : ''}`}
                  style={{ maxHeight: expanded ? 'none' : '200px' }}
                >
                  <p ref={descRef} className="pet-detail-description-text">
                    {pet.description || 'Đang cập nhật thông tin...'}
                  </p>
                </div>
                {(pet.description || '').length > 300 && (
                  <button
                    className="pet-detail-btn-expand"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? '↑ Thu gọn' : '↓ Xem thêm'}
                  </button>
                )}
              </div>
            </div>

            {/* Right column - Info */}
            <div className="col-lg-6">
              {/* Breadcrumb */}
              <div className="pet-detail-breadcrumb">
                <Link to="/adoption">Nhận nuôi</Link>
                <span>›</span>
                <span>{pet.animal}</span>
              </div>

              {/* Pet info card */}
              <div className="pet-detail-info">
                {/* Pet name */}
                <h1 className="pet-detail-name">{pet.name}</h1>

                {/* Meta tags */}
                <div className="pet-detail-meta">
                  <span className="pet-detail-meta-item">
                    🐾 {pet.animal}
                  </span>
                  <span className="pet-detail-meta-item">
                    🏷️ {pet.breed}
                  </span>
                  <span className="pet-detail-meta-item">
                    📅 {pet.age} tuổi
                  </span>
                  <span className="pet-detail-meta-item">
                    📏 {pet.size}
                  </span>
                </div>

                {/* Health status */}
                <div className={`pet-detail-health ${isHealthGood ? 'good' : 'warning'}`}>
                  {pet.healthStatus || 'Sức khỏe tốt'}
                </div>

                {/* Quick info */}
                <div className="pet-detail-quick-info">
                  <h4 className="pet-detail-quick-info-title">
                    Thông tin nhanh
                  </h4>
                  <div className="pet-detail-quick-info-list">
                    <div className="pet-detail-quick-info-item">
                      <span className="pet-detail-quick-info-label">Giới tính</span>
                      <span className="pet-detail-quick-info-value">{pet.gender}</span>
                    </div>
                    <div className="pet-detail-quick-info-item">
                      <span className="pet-detail-quick-info-label">Kích thước</span>
                      <span className="pet-detail-quick-info-value">{pet.size}</span>
                    </div>
                    <div className="pet-detail-quick-info-item">
                      <span className="pet-detail-quick-info-label">Nhóm tuổi</span>
                      <span className="pet-detail-quick-info-value">{pet.ageGroup}</span>
                    </div>
                    <div className="pet-detail-quick-info-item">
                      <span className="pet-detail-quick-info-label">Đã tiêm phòng</span>
                      <span className={`pet-detail-quick-info-value ${(pet.vaccinated === '1' || pet.vaccinated === 1 || pet.vaccinated === true) ? 'yes' : 'no'}`}>
                        {(pet.vaccinated === '1' || pet.vaccinated === 1 || pet.vaccinated === true) ? '✓ Có' : '✗ Không'}
                      </span>
                    </div>
                    <div className="pet-detail-quick-info-item">
                      <span className="pet-detail-quick-info-label">Đã triệt sản</span>
                      <span className={`pet-detail-quick-info-value ${(pet.neutered === '1' || pet.neutered === 1 || pet.neutered === true) ? 'yes' : 'no'}`}>
                        {(pet.neutered === '1' || pet.neutered === 1 || pet.neutered === true) ? '✓ Có' : '✗ Không'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pet-detail-actions">
                  <button
                    className="pet-detail-btn-adopt"
                    onClick={handleAdoptClick}
                  >
                    🏠 Nhận nuôi ngay
                  </button>
                  <Link to="/adoption" className="pet-detail-btn-secondary">
                    Xem thêm thú cưng
                  </Link>
                </div>

                {/* Similar pets */}
                {similar && similar.length > 0 && (
                  <div className="pet-detail-similar">
                    <h4 className="pet-detail-similar-title">
                      🐕 Thú cưng tương tự
                    </h4>
                    <div className="pet-detail-similar-grid">
                      {similar.map((p) => (
                        <div
                          key={p.id}
                          className="pet-detail-similar-card"
                          onClick={() => navigate(`/pets/${p.id}`)}
                        >
                          <img
                            src={(p.images && p.images[0]?.imageUrl) || p.imageUrl || 'https://via.placeholder.com/160'}
                            alt={p.name}
                          />
                          <div className="pet-detail-similar-card-info">
                            <div className="pet-detail-similar-card-name">{p.name}</div>
                            <div className="pet-detail-similar-card-type">{p.animal}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Adoption Modal */}
      <AdoptionApplicationModal
        pet={pet}
        isOpen={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
        onSubmit={handleSubmit}
        submitting={isSubmitting}
        onShowAddressModal={() => {
          try { localStorage.setItem('adoption_selected_pet', JSON.stringify(pet)); } catch (e) {}
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
    </>
  );
}

