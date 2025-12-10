import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const MOCK = {
  ADR001: {
    id: 'ADR001',
    date: '2025-09-15',
    status: 'Đang xét duyệt',
    statusClass: 'bg-warning',
    pet: {
      name: 'Max',
      type: 'Golden Retriever',
      image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=60',
      age: '2 năm',
      gender: 'Đực',
      size: 'Trung bình'
    },
    applicant: {
      name: 'Nguyễn Văn A',
      phone: '0123 456 789',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      job: 'Nhân viên văn phòng',
      income: '10-20 triệu',
      experience: 'Có',
      reason: 'Yêu thích thú cưng và muốn chăm sóc một người bạn mới',
    },
    note: 'Chờ phỏng vấn'
  },
  ADR002: {
    id: 'ADR002',
    date: '2025-09-10',
    status: 'Đã duyệt',
    statusClass: 'bg-success',
    pet: {
      name: 'Luna',
      type: 'Persian Cat',
      image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=60',
      age: '1 năm',
      gender: 'Cái',
      size: 'Nhỏ'
    },
    applicant: {
      name: 'Nguyễn Văn A',
      phone: '0123 456 789',
      address: '456 Đường DEF, Quận 3, TP.HCM',
      job: 'Freelancer',
      income: 'Trên 30 triệu',
      experience: 'Không',
      reason: 'Muốn mang đến mái ấm cho một bé mèo dễ thương',
    },
    note: 'Sẵn sàng nhận nuôi'
  }
};

const AdoptionRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const req = MOCK[id];

  if (!req) {
    return (
      <div className="container page-content">
        <div className="alert alert-warning d-flex justify-content-between align-items-center">
          <div>Không tìm thấy đơn nhận nuôi.</div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/adoption-requests')}>Về danh sách</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-content">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">Chi tiết đơn #{req.id}</h1>
        <Link to="/adoption-requests" className="btn btn-outline-secondary">Quay lại</Link>
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <img src={req.pet.image} alt={req.pet.name} className="me-3" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
                <div>
                  <h5 className="mb-1">{req.pet.name}</h5>
                  <div className="text-muted">{req.pet.type}</div>
                  <div className="text-muted small">{req.pet.age} • {req.pet.gender} • {req.pet.size}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">Thông tin người đăng ký</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="text-muted small">Họ và tên</div>
                  <div className="fw-semibold">{req.applicant.name}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small">Số điện thoại</div>
                  <div className="fw-semibold">{req.applicant.phone}</div>
                </div>
                <div className="col-12">
                  <div className="text-muted small">Địa chỉ</div>
                  <div className="fw-semibold">{req.applicant.address}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small">Nghề nghiệp</div>
                  <div className="fw-semibold">{req.applicant.job}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small">Thu nhập</div>
                  <div className="fw-semibold">{req.applicant.income}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small">Kinh nghiệm nuôi thú cưng</div>
                  <div className="fw-semibold">{req.applicant.experience}</div>
                </div>
                <div className="col-12">
                  <div className="text-muted small">Lý do muốn nhận nuôi</div>
                  <div className="fw-semibold">{req.applicant.reason}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">Tình trạng đơn</h5>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div className="text-muted small">Ngày nộp</div>
                  <div className="fw-semibold">{new Date(req.date).toLocaleDateString('vi-VN')}</div>
                </div>
                <span className={`badge ${req.statusClass}`}>{req.status}</span>
              </div>
              <div className="text-muted small mb-2">Ghi chú</div>
              <div>{req.note}</div>
            </div>
          </div>

          <div className="d-grid mt-3">
            <button className="btn btn-primary" onClick={() => navigate('/adoption')}>Xem thêm thú cưng</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdoptionRequestDetailPage;

