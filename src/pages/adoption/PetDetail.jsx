import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { petsApi } from "../../api/pets";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { adoptApi, addressAPI } from "../../api";
import { AdoptionApplicationModal } from "../../components/adoption/AdoptionModal";
import AddressModal from "../../components/checkout/AddressModal";
import Button from "../../components/ui/button/Button";

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
  const [similarPets, setSimilarPets] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const descriptionRef = useRef(null);

  // Adoption states
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        const response = await petsApi.getPetById(id);
        const petData = response?.result ?? response?.data ?? null;

        if (!petData) {
          setError("Không tìm thấy thú cưng.");
          setLoading(false);
          return;
        }

        setPet(petData);

        // Set default image
        const images = petData.petImage || petData.images || [];
        let defaultImage = "https://via.placeholder.com/500x500?text=No+Image";

        if (images && images.length > 0) {
          const primary = images.find((img) => img.isPrimary === 1 || img.isPrimary === '1');
          defaultImage = primary
            ? primary.imageUrl || primary.url
            : images[0].imageUrl || images[0].url || images[0];
        } else if (petData.imageUrl) {
          defaultImage = petData.imageUrl;
        } else if (petData.image) {
          defaultImage = petData.image;
        }
        setActiveImage(defaultImage);

        // Fetch similar pets
        if (petData.animal) {
          try {
            const similarRes = await petsApi.getPets({
              animal: petData.animal,
              isDeleted: "0",
              size: 6,
            });
            if (similarRes?.result?.content) {
              setSimilarPets(
                similarRes.result.content
                  .filter((p) => String(p.id) !== String(petData.id))
                  .slice(0, 5)
              );
            }
          } catch (err) {
            console.error("Error fetching similar pets:", err);
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

  // Auto-open adoption modal
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      if (params.get("openAdoption")) {
        setIsApplicationOpen(true);
      } else {
        const raw = localStorage.getItem("adoption_return_pet");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.returnTo?.includes(window.location.pathname)) {
            setIsApplicationOpen(true);
            localStorage.removeItem("adoption_return_pet");
          }
        }
      }
    } catch (e) { }
  }, [location.search]);

  // Fetch addresses when modal opens
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
      localStorage.setItem(
        "adoption_return_pet",
        JSON.stringify({ returnTo: location.pathname + "?openAdoption=1" })
      );
      navigate("/login");
      return;
    }
    setIsApplicationOpen(true);
  };

  const handleApplicationSubmit = async (formData) => {
    if (!pet || !user) return;
    setIsSubmitting(true);
    try {
      const incomeMap = {
        "under-10m": "Dưới 10 triệu",
        "10-20m": "10-20 triệu",
        "20-30m": "20-30 triệu",
        "above-30m": "Trên 30 triệu",
      };

      const payload = {
        userId: user?.id ? Number(user.id) : null,
        petId: pet?.id ? Number(pet.id) : null,
        addressId: formData.addressId ? Number(formData.addressId) : null,
        note: formData.reason || "",
        job: formData.job || "",
        income: formData.income ? incomeMap[formData.income] || formData.income : "",
        liveCondition: formData.conditions || "",
        isOwnPet: (() => {
          if (typeof formData.isOwnPet !== "undefined") return String(formData.isOwnPet);
          if (typeof formData.is_own_pet !== "undefined") return String(formData.is_own_pet);
          if (typeof formData.experience !== "undefined") return formData.experience === "1" ? "1" : "0";
          return "0";
        })(),
      };

      await adoptApi.createAdoptRequest(payload, token);
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
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/adoption")}
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // Helper functions
  const getAnimalLabel = (animal) => {
    const map = {
      dog: "Chó",
      cat: "Mèo",
      bird: "Chim",
      rabbit: "Thỏ",
      other: "Khác",
    };
    return map[String(animal).toLowerCase()] || animal;
  };

  const getGenderLabel = (gender) => {
    const g = String(gender).toLowerCase();
    if (g.includes("male") || g === "đực") return "Đực";
    if (g.includes("female") || g === "cái") return "Cái";
    return gender;
  };

  const isAvailable = pet.status === "AVAILABLE" || pet.status === "PENDING_APPROVAL";
  const petImages = pet.petImage || pet.images || [];
  const imageList = petImages.length > 0 ? petImages : pet.imageUrl ? [{ imageUrl: pet.imageUrl }] : [];

  return (
    <div className="container page-content py-4">
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
                    className={`rounded-3 overflow-hidden border ${activeImage === url
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
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Description Section */}
          <div className="mt-4">
            <h5 className="fw-bold text-uppercase mb-3">Mô tả</h5>
            <div
              className={`position-relative ${!isExpanded ? "overflow-hidden" : ""
                }`}
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
                  style={{
                    background: "linear-gradient(transparent, white)",
                  }}
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
          {/* Breadcrumb with Back Button */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="text-primary fw-bold">
              <Link to="/adoption" className="text-decoration-none text-primary">
                Nhận nuôi
              </Link>{" "}
              &gt; {getAnimalLabel(pet.animal)}
            </div>
            <Link
              to="/adoption"
              className="btn btn-outline-secondary btn-sm px-3"
            >
              <i className="fas fa-arrow-left me-2"></i>Quay lại
            </Link>
          </div>
          <h1 className="fw-bold mb-2 h2">{pet.name}</h1>

          <div
            className="h3 fw-bold mb-2"
            style={{ color: "#fd7e14" }}
          >
            Tìm chủ nhân yêu thương
          </div>

          <div className="mb-4">
            {isAvailable ? (
              <div className="fw-semibold mb-1 text-success">
                <i className="fas fa-check-circle me-1"></i>Đã tiêm phòng
              </div>
            ) : (
              <div className="fw-semibold mb-1 text-danger">
                <i className="fas fa-times-circle me-1"></i>Đã có chủ
              </div>
            )}
          </div>

          {/* Info Grid - Similar to Product Variants */}
          <div className="mb-4">
            <div className="fw-bold mb-2">Thông tin nhanh</div>
            <div className="row g-3">
              <div className="col-6">
                <div className="border rounded-3 p-3 h-100">
                  <div className="small text-muted mb-1">
                    <i className="fas fa-venus-mars me-2"></i>Giới tính
                  </div>
                  <div className="fw-bold">{getGenderLabel(pet.gender)}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="border rounded-3 p-3 h-100">
                  <div className="small text-muted mb-1">
                    <i className="fas fa-weight-hanging me-2"></i>Cân nặng
                  </div>
                  <div className="fw-bold">{pet.weight ? `${pet.weight} kg` : "12 kg"}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="border rounded-3 p-3 h-100">
                  <div className="small text-muted mb-1">
                    <i className="fas fa-birthday-cake me-2"></i>Tuổi
                  </div>
                  <div className="fw-bold">{ `${pet.age} tuổi`}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="border rounded-3 p-3 h-100">
                  <div className="small text-muted mb-1">
                    <i className="fas fa-paw me-2"></i>Giống loài
                  </div>
                  <div className="fw-bold">{pet.breed || "test"}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex gap-3 mb-5">
            <Button
              className={`btn-lg px-4 text-white fw-bold ${isAvailable ? "" : "btn-secondary"
                }`}
              style={{
                backgroundColor: isAvailable ? "#fd7e14" : undefined,
                borderColor: isAvailable ? "#fd7e14" : undefined,
              }}
              onClick={handleAdoptClick}
              disabled={!isAvailable}
              isLoading={isSubmitting}
            >
              <i className="fas fa-paw me-2"></i>
              {isAvailable ? "Gửi yêu cầu nhận nuôi" : "Đã được nhận nuôi"}
            </Button>
          </div>

          {/* Similar Pets Section */}
          {similarPets.length > 0 && (
            <div className="mt-4 pt-4 border-top">
              <h5 className="fw-bold text-uppercase mb-3 text-secondary">
                Có thể bạn cũng thích
              </h5>
              <div className="d-flex flex-column gap-3">
                {similarPets.map((p) => {
                  const pImg = (() => {
                    if (p.images && p.images.length > 0) {
                      const prime = p.images.find((i) => i.isPrimary === 1);
                      return prime ? prime.imageUrl : p.images[0].imageUrl;
                    }
                    if (p.petImage && p.petImage.length > 0) {
                      const prime = p.petImage.find((i) => i.isPrimary === 1);
                      return prime ? prime.imageUrl : p.petImage[0].imageUrl;
                    }
                    return p.imageUrl || p.image || "https://via.placeholder.com/80";
                  })();

                  return (
                    <div
                      key={p.id}
                      className="d-flex gap-3 align-items-center p-2 rounded hover-bg-light"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/pets/${p.id}`)}
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
                        <div className="small" style={{ color: "#fd7e14" }}>
                          <i className="fas fa-venus-mars me-1"></i>
                          {getGenderLabel(p.gender)} • {p.age} tuổi
                        </div>
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
          } catch (e) { }
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
