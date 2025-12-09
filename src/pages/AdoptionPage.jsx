import React, { useState, useMemo } from 'react';
import { pets } from '../data/pets';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PetDetailModal, AdoptionApplicationModal } from '../components/adoption/AdoptionModal';

const AdoptionPage = () => {
  const [filters, setFilters] = useState({
    type: '',
    age: '',
    size: ''
  });
  
  const { user } = useAuth();
  const { showToast } = useToast();

  const [selectedPet, setSelectedPet] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  // Filter pets based on selected filters
  const filteredPets = useMemo(() => {
    return pets.filter(pet => {
      if (filters.type && pet.type !== filters.type) return false;
      if (filters.age && getAgeGroup(pet.age) !== filters.age) return false;
      if (filters.size && pet.size !== filters.size) return false;
      return true;
    });
  }, [filters]);

  // Helper function to determine age group
  const getAgeGroup = (age) => {
    if (age < 1) return 'puppy';
    if (age >= 1 && age <= 3) return 'young';
    if (age >= 3 && age <= 7) return 'adult';
    return 'senior';
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAdoptionClick = (pet) => {
    if (!user) {
      showToast('Vui lòng đăng nhập để đăng ký nhận nuôi', 'warning');
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
    showToast(`Đã gửi đơn nhận nuôi ${selectedPet?.name}. Chúng tôi sẽ liên hệ sớm!`, 'success');
    setSelectedPet(null);
  };

  const getAgeText = (age) => {
    const ageGroup = getAgeGroup(age);
    const ageGroupTexts = {
      puppy: 'Con (< 1 tuổi)',
      young: 'Trẻ (1-3 tuổi)', 
      adult: 'Trưởng thành (3-7 tuổi)',
      senior: 'Già (> 7 tuổi)'
    };
    return `${age} tuổi • ${ageGroupTexts[ageGroup]}`;
  };

  const getSizeText = (size) => {
    const sizeTexts = {
      small: 'Nhỏ',
      medium: 'Trung bình',
      large: 'Lớn'
    };
    return sizeTexts[size];
  };

  return (
    <div className="page" id="adoption">
      <div className="container page-content">
        <h1 className="mb-4">Nhận nuôi thú cưng</h1>
        <p className="text-muted mb-4">Cho những người bạn nhỏ một mái ấm yêu thương</p>
        
        <div className="row">
          <div className="col-lg-3 mb-4">
            <div className="sidebar">
              <h5>Lọc thú cưng</h5>
              
              <div className="mb-3">
                <label className="form-label">Loại</label>
                <select 
                  className="form-select"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="dog">Chó</option>
                  <option value="cat">Mèo</option>
                  <option value="bird">Chim</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Tuổi</label>
                <select 
                  className="form-select"
                  value={filters.age}
                  onChange={(e) => handleFilterChange('age', e.target.value)}
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
                  onChange={(e) => handleFilterChange('size', e.target.value)}
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
            <div className="row" id="adoptionPetsList">
              {filteredPets.length > 0 ? (
                filteredPets.map(pet => (
                  <div key={pet.id} className="col-lg-4 col-md-6 mb-4">
                    <div className="card">
                      <img 
                        src={pet.image} 
                        className="card-img-top" 
                        alt={pet.name}
                        style={{height: '200px', objectFit: 'cover'}}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{pet.name}</h5>
                        <p className="text-muted mb-1">
                          {pet.type === 'dog' ? 'Chó' : pet.type === 'cat' ? 'Mèo' : 'Chim'} {pet.breed} • {getAgeText(pet.age)}
                        </p>
                        <p className="card-text">{pet.description}</p>
                        
                        <div className="mb-3">
                          <small className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            Kích thước: {getSizeText(pet.size)} • 
                            Giới tính: {pet.gender === 'male' ? 'Đực' : 'Cái'}
                          </small>
                        </div>
                        
                        <div className="mb-3">
                          <span className={`badge ${pet.healthStatus === 'excellent' ? 'bg-success' : 'bg-warning'} me-1`}>
                            {pet.healthStatus === 'excellent' ? 'Sức khỏe tốt' : 'Sức khỏe khá'}
                          </span>
                          {pet.vaccinated && <span className="badge bg-info me-1">Đã tiêm phòng</span>}
                          {pet.spayed && <span className="badge bg-secondary">Đã triệt sản</span>}
                        </div>
                        
                        <button 
                          className="btn btn-primary w-100" 
                          onClick={() => handleAdoptionClick(pet)}
                        >
                          <i className="fas fa-heart me-1"></i>
                          Nhận nuôi {pet.name}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="text-center py-5">
                    <h4>Không tìm thấy thú cưng nào</h4>
                    <p className="text-muted">Hãy thử thay đổi bộ lọc của bạn</p>
                  </div>
                </div>
              )}
            </div>
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

