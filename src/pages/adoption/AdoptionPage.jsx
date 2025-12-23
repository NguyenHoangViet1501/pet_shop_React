import React, { useState, useEffect } from "react";
import { petsApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import PetCard from "../../components/pet/PetCard";
import {
  PetDetailModal,
  AdoptionApplicationModal,
} from "../../components/adoption/AdoptionModal";

const AdoptionPage = () => {
  const [filters, setFilters] = useState({
    type: "",
    age: "",
    size: "",
  });

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animals, setAnimals] = useState([]);

  const { user } = useAuth();
  const { showToast } = useToast();

  const [selectedPet, setSelectedPet] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  // Load animals for filter
  useEffect(() => {
    const loadAnimals = async () => {
      try {
        const res = await petsApi.getAnimals();
        const data = res?.result || res?.data || [];
        setAnimals(data);
      } catch (error) {
        console.error("Failed to load animals:", error);
      }
    };
    loadAnimals();
  }, []);

  // Load pets from API
  useEffect(() => {
    const loadPets = async () => {
      setLoading(true);
      try {
        // Map filter values từ frontend sang backend
        const params = {
          isDeleted: "0", // Chỉ lấy pets chưa bị xóa
        };

        if (filters.type) {
          // Dùng giá trị animal trực tiếp từ API (ví dụ: "Dog", "Cat")
          params.animal = filters.type;
        }

        if (filters.age) {
          // Map age filter: "puppy" -> "Young", "young" -> "Child", etc.
          const ageGroupMap = {
            puppy: "Young",
            young: "Child",
            adult: "Adult",
            senior: "Senior",
          };
          params.ageGroup = ageGroupMap[filters.age] || filters.age;
        }

        if (filters.size) {
          // Map size filter: "small" -> "Small", "medium" -> "Medium", "large" -> "Big"
          const sizeMap = {
            small: "Small",
            medium: "Medium",
            large: "Big",
          };
          params.size = sizeMap[filters.size] || filters.size;
        }

        const res = await petsApi.getPets(params);
        const data = res?.result || res?.data || [];
        
        // Nếu data là object có content (pagination), lấy content
        if (data.content) {
          setPets(data.content);
        } else if (Array.isArray(data)) {
          setPets(data);
        } else {
          setPets([]);
        }
      } catch (error) {
        console.error("Failed to load pets:", error);
        showToast("Không thể tải danh sách thú cưng", "error");
        setPets([]);
      } finally {
        setLoading(false);
      }
    };

    loadPets();
  }, [filters, showToast]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAdoptionClick = (pet) => {
    if (!user) {
      showToast("Vui lòng đăng nhập để đăng ký nhận nuôi", "warning");
      return;
    }
    setSelectedPet(pet);
    setIsDetailOpen(true);
  };

  const openApplication = () => {
    setIsDetailOpen(false);
    setIsApplicationOpen(true);
  };

  const submitApplication = (form) => {
    setIsApplicationOpen(false);
    showToast(
      `Đã gửi đơn nhận nuôi ${selectedPet?.name}. Chúng tôi sẽ liên hệ sớm!`,
      "success"
    );
    setSelectedPet(null);
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
                  {animals.map((animal) => {
                    // Map animal name sang tiếng Việt để hiển thị
                    const animalNameMap = {
                      Dog: "Chó",
                      Cat: "Mèo",
                      Bird: "Chim",
                      Rabbit: "Thỏ",
                      Hamster: "Chuột Hamster",
                      Turtle: "Rùa",
                    };
                    const displayName = animalNameMap[animal] || animal;
                    return (
                      <option key={animal} value={animal}>
                        {displayName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Tuổi</label>
                <select
                  className="form-select"
                  value={filters.age}
                  onChange={(e) => handleFilterChange("age", e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="puppy">Con (&lt; 1 tuổi)</option>
                  <option value="young">Trẻ (1-3 tuổi)</option>
                  <option value="adult">Trưởng thành (3-7 tuổi)</option>
                  <option value="senior">Già (&gt; 7 tuổi)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Kích thước</label>
                <select
                  className="form-select"
                  value={filters.size}
                  onChange={(e) => handleFilterChange("size", e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="small">Nhỏ</option>
                  <option value="medium">Trung bình</option>
                  <option value="large">Lớn</option>
                </select>
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
        isOpen={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
        onSubmit={submitApplication}
      />
    </div>
  );
};

export default AdoptionPage;
