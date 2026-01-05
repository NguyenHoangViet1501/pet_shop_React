import React from "react";
import { useNavigate } from "react-router-dom";

const PetCard = ({ pet, onAdoptClick }) => {
  // Lấy ảnh chính
  const getMainImage = () => {
    if (pet.images && pet.images.length > 0) {
      const primaryImage = pet.images.find(
        (img) => img.isPrimary === true || img.isPrimary === 1
      );
      return primaryImage?.imageUrl || pet.images[0]?.imageUrl || pet.imageUrl;
    }
    return pet.imageUrl || "https://via.placeholder.com/400x300?text=No+Image";
  };

  // Chuyển đổi animal type sang tiếng Việt
  const getAnimalType = (animal) => {
    const animalMap = {
      Dog: "Chó",
      Cat: "Mèo",
      Bird: "Chim",
      Rabbit: "Thỏ",
      Hamster: "Chuột Hamster",
      Turtle: "Rùa",
    };
    return animalMap[animal] || animal;
  };

  // Chuyển đổi size sang tiếng Việt
  const getSizeText = (size) => {
    const sizeMap = {
      Small: "Nhỏ",
      Medium: "Trung bình",
      Big: "Lớn",
    };
    return sizeMap[size] || size;
  };

  // Chuyển đổi gender sang tiếng Việt
  const getGenderText = (gender) => {
    return gender === "Male" ? "Đực" : gender === "Female" ? "Cái" : gender;
  };

  // Chuyển đổi ageGroup sang tiếng Việt
  const getAgeGroupText = (ageGroup) => {
    const ageGroupMap = {
      Young: "Con (< 1 tuổi)",
      Child: "Trẻ (1-3 tuổi)",
      Adult: "Trưởng thành (3-7 tuổi)",
      Senior: "Già (> 7 tuổi)",
    };
    return ageGroupMap[ageGroup] || ageGroup;
  };

  // Kiểm tra boolean values
  const isVaccinated =
    pet.vaccinated === true ||
    pet.vaccinated === 1 ||
    pet.vaccinated === "1";
  const isNeutered =
    pet.neutered === true || pet.neutered === 1 || pet.neutered === "1";

  // Xác định health status
  const getHealthStatus = () => {
    const raw = pet.healthStatus || "";
    const status = String(raw).trim().toUpperCase();
    if (status === "GOOD" || status === "TỐT" || status.includes("GOOD")) {
      return { text: "Sức khỏe tốt", color: "bg-success" };
    }
    if (status === "BAD" || status === "KÉM" || status === "YẾU" || status.includes("BAD")) {
      return { text: "Sức khỏe kém", color: "bg-danger" };
    }
    if (status.includes("FAIR") || status.includes("KHÁ")) {
      return { text: "Sức khỏe khá", color: "bg-warning" };
    }
    // default
    return { text: "Sức khỏe tốt", color: "bg-success" };
  };

  const healthStatus = getHealthStatus();

  const navigate = useNavigate();

  return (
    <div className="col-lg-4 col-md-6 mb-3">
      <div
        className="card h-100 shadow-sm"
        style={{ borderRadius: "12px", overflow: "hidden", cursor: 'pointer' }}
        onClick={() => navigate(`/pets/${pet.id}`)}
      >
        {/* Pet Image */}
        <div style={{ position: "relative", height: "240px", overflow: "hidden" }}>
          <img
            src={getMainImage()}
            className="card-img-top"
            alt={pet.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s ease",
            }}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          />
        </div>

        {/* Card Body */}
        <div className="card-body d-flex flex-column" style={{ padding: "1rem" }}>
          {/* Pet Name */}
          <h5 className="card-title fw-bold mb-1" style={{ fontSize: "1.1rem" }}>{pet.name}</h5>

          {/* Pet Details */}
          <p className="text-muted mb-1 small" style={{ fontSize: "0.85rem" }}>
            {getAnimalType(pet.animal)} {pet.breed} • {pet.age} tuổi •{" "}
            {getAgeGroupText(pet.ageGroup)}
          </p>

          {/* Description */}
          <p
            className="card-text flex-grow-1"
            style={{ fontSize: "0.85rem", lineHeight: "1.4", marginBottom: "0" }}
          >
            {pet.description ||
              "Thú cưng đáng yêu đang tìm một mái ấm yêu thương."}
          </p>

          {/* Attributes */}
          <div className="mb-2" style={{ marginTop: "0.25rem" }}>
            <small className="text-muted d-block mb-1" style={{ fontSize: "0.8rem" }}>
              <i className="fas fa-info-circle me-1"></i>
              Cân nặng: {pet.weight ? `${pet.weight} kg` : "N/A"} • Giới tính:{" "}
              {getGenderText(pet.gender)}
            </small>
          </div>

          {/* Health Status Badges */}
          <div className="mb-2 d-flex flex-wrap gap-1">
            <span className={`badge ${healthStatus.color} text-white`}>
              {healthStatus.text}
            </span>
            {isVaccinated && (
              <span className="badge bg-info text-white">Đã tiêm phòng</span>
            )}
            {isNeutered && (
              <span className="badge bg-secondary text-white">Đã triệt sản</span>
            )}
          </div>

          {/* Adopt Button */}
          <button
            className="btn btn-warning w-100 fw-bold mt-auto"
            onClick={(e) => {
              e.stopPropagation();
              onAdoptClick(pet);
            }}
            style={{
              borderRadius: "8px",
              padding: "10px",
              fontSize: "1rem",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <i className="fas fa-heart me-2"></i>
            Nhận nuôi {pet.name}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetCard;

