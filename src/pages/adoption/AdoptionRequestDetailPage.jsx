import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { adoptApi } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../../components/common/ConfirmModal";

const statusMap = {
  PENDING: { text: "Đang xét duyệt", className: "bg-warning" },
  APPROVED: { text: "Đã duyệt", className: "bg-success" },
  REJECTED: { text: "Từ chối", className: "bg-danger" },
  COMPLETED: { text: "Hoàn tất", className: "bg-primary" }
};

const AdoptionRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { showToast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

useEffect(() => {
  adoptApi
    .getAdoptDetail(id)
    .then(res => {
      if (res?.success) {
        setReq(res.result); // ✅ ĐÚNG
      } else {
        setReq(null);
      }
    })
    .catch(() => setReq(null))
    .finally(() => setLoading(false));
}, [id]);


  if (loading) return <div className="container page-content">Đang tải...</div>;

  if (!req) {
    return (
      <div className="container page-content">
        <div className="alert alert-warning d-flex justify-content-between align-items-center">
          <div>Không tìm thấy đơn nhận nuôi.</div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/adoption-requests")}
          >
            Về danh sách
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = statusMap[req.status] || {
    text: req.status,
    className: "bg-secondary"
  };

  return (
    <div className="container page-content">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">Chi tiết đơn {req.code}</h1>
        <Link to="/adoption-requests" className="btn btn-outline-secondary">
          Quay lại
        </Link>
      </div>

          <div className="row g-3">
            {/* LEFT */}
            <div className="col-lg-8">
              {/* PET */}
              <div className="card mb-3">
      <div className="row g-0" style={{ minHeight: 180 }}>
        {/* IMAGE */}
        <div className="col-md-5">
          <img
            src={req.pet.image}
            alt={req.pet.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8
            }}
          />
        </div>

        {/* INFO */}
        <div className="col-md-7">
          <div className="card-body h-100 d-flex flex-column justify-content-center">
            <h4 className="mb-1">{req.pet.name}</h4>

            <div className="text-muted mb-2">
              {req.pet.animal} • {req.pet.breed}
            </div>

            <div className="text-muted">
              {req.pet.age} năm • {req.pet.gender} • {req.pet.size}
            </div>
          </div>
        </div>
      </div>
    </div>


          {/* APPLICANT */}
          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">Thông tin người đăng ký</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="text-muted small">Họ và tên</div>
                  <div className="fw-semibold">{req.applicant.fullName}</div>
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
                  <div className="fw-semibold">{req.job}</div>
                </div>

                <div className="col-md-6">
                  <div className="text-muted small">Thu nhập</div>
                  <div className="fw-semibold">{req.income || "—"}</div>
                </div>

                <div className="col-md-6">
                  <div className="text-muted small">Đã từng nuôi thú cưng</div>
                  <div className="fw-semibold">
                    {req.isOwnPet === "1" ? "Có" : "Không"}
                  </div>
                </div>

                <div className="col-12">
                  <div className="text-muted small">Điều kiện sống</div>
                  <div className="fw-semibold">{req.liveCondition}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">Tình trạng đơn</h5>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div className="text-muted small">Ngày nộp</div>
                  <div className="fw-semibold">
                    {new Date(req.createdDate).toLocaleDateString("vi-VN")}
                  </div>
                </div>

                <span className={`badge ${statusInfo.className}`}>
                  {statusInfo.text}
                </span>
              </div>

              <div className="text-muted small mb-2">Ghi chú</div>
              <div>{req.note || "—"}</div>
            </div>
          </div>

          <div className="d-grid mt-3">
            <button className="btn btn-primary" onClick={() => navigate("/adoption")}>
              Xem thêm thú cưng
            </button>
          </div>

          {req.status?.toUpperCase() !== "CANCELED" && req.status?.toUpperCase() !== "REJECTED" && req.status?.toUpperCase() !== "COMPLETED" && (
            <div className="d-grid mt-2">
              <button
                className="btn btn-outline-danger"
                onClick={() => setShowCancelConfirm(true)}
                disabled={isCancelling}
              >
                {isCancelling ? 'Đang hủy...' : 'Hủy đăng ký nhận nuôi'}
              </button>
            </div>
          )}
          <ConfirmModal
            isOpen={showCancelConfirm}
            title="Xác nhận hủy đơn"
            message="Bạn có chắc muốn hủy đơn nhận nuôi này?"
            onClose={() => setShowCancelConfirm(false)}
            onConfirm={async () => {
              try {
                setIsCancelling(true);
                await adoptApi.cancelAdopt(id, token);
                showToast('Hủy đơn thành công', 'success');
                setReq(prev => prev ? { ...prev, status: 'CANCELED' } : prev);
                setShowCancelConfirm(false);
              } catch (err) {
                console.error('Failed to cancel adopt', err);
                showToast('Không thể hủy đơn, vui lòng thử lại', 'error');
              } finally {
                setIsCancelling(false);
              }
            }}
            confirmLabel="Xóa"
            loading={isCancelling}
          />
        </div>
      </div>
    </div>
  );
};

export default AdoptionRequestDetailPage;
