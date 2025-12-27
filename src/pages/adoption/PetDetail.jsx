import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { petsApi } from "../../api/pets";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { adoptApi } from "../../api";
import { AdoptionApplicationModal } from "../../components/adoption/AdoptionModal";

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

  if (loading) return (<div className="container page-content py-5 text-center">Đang tải...</div>);
  if (!pet) return (
    <div className="container page-content">
      <div className="alert alert-warning d-flex justify-content-between align-items-center">
        <div>Không tìm thấy thú cưng.</div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/adoption')}>Quay lại</button>
      </div>
    </div>
  );

  const thumbnails = pet.images || pet.petImage || [];

  return (
    <>
      <div className="container page-content py-4">
      <div className="row g-5">
        <div className="col-lg-6">
          <div className="card mb-3 border-0">
            <img src={activeImage} alt={pet.name} className="card-img-top rounded-4" style={{ width: '100%', height: 480, objectFit: 'cover' }} />
          </div>

          {thumbnails && thumbnails.length > 0 && (
            <div className="d-flex gap-2 overflow-auto pb-2 mb-4">
              {thumbnails.map((img, i) => {
                const url = img.imageUrl || img;
                return (
                  <div key={i} className={`rounded-3 overflow-hidden border ${activeImage === url ? 'border-primary border-2' : 'border-transparent'}`} style={{ width: 80, height: 80, cursor: 'pointer', flexShrink: 0 }} onClick={() => setActiveImage(url)}>
                    <img src={url} alt={`thumb-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4">
            <h5 className="fw-bold text-uppercase mb-3">Mô tả</h5>
            <div className={`position-relative ${!expanded ? 'overflow-hidden' : ''}`} style={{ maxHeight: expanded ? 'none' : 220 }}>
              <p ref={descRef} className="text-muted" style={{ whiteSpace: 'pre-line' }}>{pet.description || 'Đang cập nhật'}</p>
            </div>
            {(pet.description || '').length > 300 && (
              <button className="btn btn-outline-primary btn-sm mt-2 rounded-pill" onClick={() => setExpanded(!expanded)}>{expanded ? 'Thu gọn' : 'Xem thêm'}</button>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="text-primary fw-bold mb-2"><Link to="/adoption" className="text-decoration-none text-primary">Nhận nuôi</Link> &gt; {pet.animal}</div>
          <h1 className="fw-bold mb-2 h2">{pet.name}</h1>
          <div className="mb-3 text-muted">{pet.animal} • {pet.breed} • {pet.age} tuổi • {pet.size}</div>

          <div className="mb-3">
            <div className={`fw-semibold mb-1 ${pet.healthStatus?.toLowerCase().includes('good') ? 'text-success' : 'text-warning'}`}>
              {pet.healthStatus || 'Sức khỏe tốt'}
            </div>
          </div>

          <div className="mb-4">
            <div className="fw-bold mb-2">Thông tin nhanh</div>
            <ul className="list-unstyled text-muted small">
              <li>Giới tính: <span className="fw-semibold text-dark">{pet.gender}</span></li>
              <li>Kích thước: <span className="fw-semibold text-dark">{pet.size}</span></li>
              <li>Nhóm tuổi: <span className="fw-semibold text-dark">{pet.ageGroup}</span></li>
              <li>Đã tiêm phòng: <span className="fw-semibold text-dark">{(pet.vaccinated === '1' || pet.vaccinated === 1 || pet.vaccinated === true) ? 'Có' : 'Không'}</span></li>
              <li>Đã triệt sản: <span className="fw-semibold text-dark">{(pet.neutered === '1' || pet.neutered === 1 || pet.neutered === true) ? 'Có' : 'Không'}</span></li>
            </ul>
          </div>

          <div className="d-flex gap-3 mb-4">
            <button className="btn btn-warning btn-lg px-4 fw-bold" onClick={() => {
              if (!user) {
                showToast('Vui lòng đăng nhập để đăng ký nhận nuôi', 'warning');
                navigate('/login');
                return;
              }
              setIsApplicationOpen(true);
            }}>Nhận nuôi</button>
            <Link className="btn btn-outline-secondary btn-lg px-4" to="/adoption">Xem thêm thú cưng</Link>
          </div>

          {similar && similar.length > 0 && (
            <div className="mt-4 pt-4 border-top">
              <h5 className="fw-bold text-uppercase mb-3 text-secondary">Thú cưng tương tự</h5>
              <div className="d-flex flex-wrap gap-3">
                {similar.map((p) => (
                  <div key={p.id} className="card p-2" style={{ width: 160, cursor: 'pointer' }} onClick={() => navigate(`/pets/${p.id}`)}>
                    <img src={(p.images && p.images[0]?.imageUrl) || p.imageUrl || 'https://via.placeholder.com/160'} alt={p.name} style={{ width: '100%', height: 90, objectFit: 'cover' }} />
                    <div className="mt-2 fw-semibold">{p.name}</div>
                    <div className="text-muted small">{p.animal}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      <AdoptionApplicationModal
      pet={pet}
      isOpen={isApplicationOpen}
      onClose={() => setIsApplicationOpen(false)}
      onSubmit={async (form) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
          const payload = {
            userId: user?.id ? Number(user.id) : null,
            petId: pet?.id ? Number(pet.id) : null,
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
            isOwnPet: (function(){
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
        } catch (err) {
          console.error('Adopt submit failed', err);
          showToast(err?.message || 'Gửi đơn thất bại', 'error');
        } finally {
          setIsSubmitting(false);
        }
      }}
      submitting={isSubmitting}
      onShowAddressModal={() => showToast('Chức năng chọn địa chỉ chưa được bật ở đây', 'info')}
      />
    </>
  );
}
