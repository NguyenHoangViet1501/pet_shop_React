import React, { useMemo, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Đang xét duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' }
];

const statusToBadge = (status) => {
  switch (status) {
    case 'pending':
      return { className: 'badge bg-warning', text: 'Đang xét duyệt' };
    case 'approved':
      return { className: 'badge bg-success', text: 'Đã duyệt' };
    case 'rejected':
      return { className: 'badge bg-danger', text: 'Từ chối' };
    default:
      return { className: 'badge bg-secondary', text: status };
  }
};

const MOCK_REQUESTS = [
  {
    id: 'ADR001',
    petName: 'Max',
    petType: 'Golden Retriever',
    date: '2025-09-15',
    status: 'pending',
    note: 'Chờ phỏng vấn'
  },
  {
    id: 'ADR002',
    petName: 'Luna',
    petType: 'Persian Cat',
    date: '2025-09-10',
    status: 'approved',
    note: 'Sẵn sàng nhận nuôi'
  },
  {
    id: 'ADR003',
    petName: 'Coco',
    petType: 'Poodle',
    date: '2025-09-01',
    status: 'rejected',
    note: 'Không phù hợp điều kiện'
  }
];

const AdoptionRequestsPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return MOCK_REQUESTS.filter((r) => {
      const matchesStatus = statusFilter === 'all' ? true : r.status === statusFilter;
      const keyword = search.trim().toLowerCase();
      const matchesKeyword = !keyword
        || r.id.toLowerCase().includes(keyword)
        || r.petName.toLowerCase().includes(keyword)
        || r.petType.toLowerCase().includes(keyword);
      return matchesStatus && matchesKeyword;
    });
  }, [statusFilter, search]);

  const handleView = (req) => {
    navigate(`/adoption-requests/${req.id}`);
  };

  const handleContact = (req) => {
    showToast(`Liên hệ về đơn ${req.id}`, 'success');
  };

  return (
    <div className="container page-content">
      <h1 className="mb-4">Đơn xin nhận nuôi</h1>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Trạng thái</label>
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-8">
              <label className="form-label">Tìm kiếm</label>
              <input
                className="form-control"
                placeholder="Tìm theo mã đơn, tên thú cưng, giống..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Thú cưng</th>
                  <th>Ngày nộp</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">Không có đơn phù hợp.</td>
                  </tr>
                )}
                {filtered.map((req) => {
                  const badge = statusToBadge(req.status);
                  const date = new Date(req.date).toLocaleDateString('vi-VN');
                  return (
                    <tr key={req.id}>
                      <td>#{req.id}</td>
                      <td>{req.petName} ({req.petType})</td>
                      <td>{date}</td>
                      <td><span className={badge.className}>{badge.text}</span></td>
                      <td>{req.note}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handleView(req)}>Xem chi tiết</button>
                          {req.status === 'approved' ? (
                            <button className="btn btn-sm btn-outline-success" onClick={() => handleContact(req)}>Liên hệ</button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdoptionRequestsPage;

