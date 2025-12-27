import React, { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { adoptApi, petsApi } from "../../api";
import { useAuth } from "../../context/AuthContext";

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "PENDING", label: "Đang xét duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "CANCELED", label: "Đã hủy" }
];


const statusToBadge = (status) => {
  const s = (status || "").toUpperCase();
  switch (s) {
    case "CANCELED":
      return { className: "badge bg-secondary", text: "Đã hủy" };
    case "PENDING":
      return { className: "badge bg-warning", text: "Đang xét duyệt" };
    case "APPROVED":
      return { className: "badge bg-success", text: "Đã duyệt" };
    case "REJECTED":
      return { className: "badge bg-danger", text: "Từ chối" };
    case "COMPLETED":
      return { className: "badge bg-primary", text: "Hoàn tất" };
    default:
      return { className: "badge bg-secondary", text: status };
  }
};


const AdoptionRequestsPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 5;

  // cache fetched pets by id: { [id]: apiResponse }
  const [petMap, setPetMap] = useState({});

  // 🔹 RESET PAGE KHI FILTER / SEARCH
  useEffect(() => {
    setPage(0);
  }, [statusFilter, search]);

  // 🔹 GỌI API
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const params = {
          page,
          size,
          status: statusFilter === "all" ? null : statusFilter,
          code: search || null,
          isDeleted: "0",
        };

        const res = await adoptApi.getAdoptsByUser(user.id, params, token);

        setRequests(res.result?.content || []);
        setTotalPages(res.result?.totalPages || 0);
      } catch (err) {
        console.error('Failed to fetch adopts by user', err);
        // try to surface HTTP error details
        const message = err?.message || err?.statusText || 'Không tải được danh sách đơn nhận nuôi';
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, page, statusFilter, search, token]);

  // When requests change, fetch missing pet details by id and store in petMap
  useEffect(() => {
    const missingIds = new Set();

    requests.forEach((r) => {
      const petFromReq = r.pet || null;
      const petId = (petFromReq && (petFromReq.id || petFromReq.petId)) || r.petId || null;
      if (petId && !petMap[petId]) missingIds.add(petId);
    });

    if (missingIds.size === 0) return;

    const fetchMissing = async () => {
      try {
        const promises = Array.from(missingIds).map(async (id) => {
          try {
            const res = await petsApi.getPetById(id);
            return { id, data: res };
          } catch (e) {
            console.error("Failed to fetch pet", id, e);
            return { id, data: null };
          }
        });

        const results = await Promise.all(promises);
        setPetMap((prev) => {
          const next = { ...prev };
          results.forEach((r) => {
            if (r && r.id) next[r.id] = r.data;
          });
          return next;
        });
      } catch (e) {
        console.error("Error fetching missing pets", e);
      }
    };

    fetchMissing();
  }, [requests]);

  const handleView = (req) => {
    navigate(`/adoption-requests/${req.id}`);
  };

  const handleContact = (req) => {
    showToast(`Liên hệ về đơn ${req.code}`, "success");
  };

  return (
    <div className="container page-content">
      <h1 className="mb-4">Đơn xin nhận nuôi</h1>

      {/* FILTER */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Trạng thái</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-9">
              <label className="form-label">Tìm kiếm</label>
              <input
                className="form-control"
                placeholder="Tìm theo mã đơn..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Pet</th>
                  <th>Ngày nộp</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                )}

                {!loading && requests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      Không có đơn phù hợp.
                    </td>
                  </tr>
                )}

                {requests.map((req) => {
                  const badge = statusToBadge(req.status);
                  const date = new Date(req.createdDate).toLocaleDateString("vi-VN");

                  // normalize pet object and prefer a real name when available
                  const petFromReq = req.pet || null;
                  const petId = (petFromReq && (petFromReq.id || petFromReq.petId)) || req.petId || null;

                  // prefer pet data from request, then from fetched petMap, then fallback
                  const fetched = petId ? petMap[petId] : null;
                  // fetched might be an envelope (res.result) or the pet object itself
                  const fetchedPet = fetched?.result || fetched || null;

                  const petName = (petFromReq && (petFromReq.name || petFromReq.petName)) || req.petName || (fetchedPet && (fetchedPet.name || fetchedPet.petName)) || (petId ? `#${petId}` : null);

                  const petImage = (petFromReq && (petFromReq.image || (petFromReq.images && petFromReq.images[0] && petFromReq.images[0].imageUrl))) || (fetchedPet && (fetchedPet.image || (fetchedPet.images && fetchedPet.images[0] && fetchedPet.images[0].imageUrl))) || (req.pet && req.pet.images && req.pet.images[0] && req.pet.images[0].imageUrl) || (req.petImage && req.petImage[0] && req.petImage[0].imageUrl) || null;

                  const petObj = petId ? {  name: petName, image: petImage } : null;

                  return (
                    <tr key={req.id}>
                      <td>{req.code}</td>
                      <td>
                        {petObj ? (
                          <div className="d-flex align-items-center" style={{ gap: 12 }}>
                            <img
                              src={petObj.image || req.pet?.images?.[0]?.imageUrl || req.pet?.petImage?.[0]?.imageUrl || "https://via.placeholder.com/64"}
                              alt={petObj.name}
                              style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, cursor: 'pointer' }}
                              onClick={() => navigate(`/pets/${petObj.id}`)}
                            />
                            <div>
                              <div className="fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate(`/pets/${petObj.id}`)}>{petObj.name}</div>
                            </div>
                          </div>
                        ) : (
                          req.petId || "—"
                        )}
                      </td>
                      <td>{date}</td>
                      <td>
                        <span className={badge.className}>{badge.text}</span>
                      </td>
                      <td>{req.note}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleView(req)}
                          >
                            Xem chi tiết
                          </button>

                          {req.status?.toUpperCase() === "APPROVED" && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleContact(req)}
                            >
                              Liên hệ
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* PAGINATION */}
            <nav className="mt-3">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage(page - 1)}
                  >
                    Trước
                  </button>
                </li>

                {[...Array(totalPages)].map((_, i) => (
                  <li
                    key={i}
                    className={`page-item ${page === i ? "active" : ""}`}
                  >
                    <button className="page-link" onClick={() => setPage(i)}>
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${
                    page === totalPages - 1 ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setPage(page + 1)}
                  >
                    Sau
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdoptionRequestsPage;
