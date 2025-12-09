import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link, useLocation } from 'react-router-dom';
import AddressFormModal from '../components/user/AddressFormModal';
import AddressEditModal from '../components/user/AddressEditModal';
import ChangePasswordTab from '../components/user/ChangePasswordTab';
import { userAPI } from '../api/user';
import { addressAPI } from '../api/address';

const ProfilePage = () => {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('profile-info');
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  // Basic info form state
  const [profileForm, setProfileForm] = useState(() => ({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  }));

  // Addresses state (from API)
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Sync tab from query ?tab=addresses
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  // Update profile form when user data changes
  useEffect(() => {
    setProfileForm(prev => ({
      ...prev,
      email: user?.email || '',
      fullName: user?.fullName || user?.name || '',
      phone: user?.phone || ''
    }));
  }, [user]);

  // Fetch addresses function
  const fetchAddresses = async (page = 0) => {
    if (!token) return;

    setLoadingAddresses(true);
    try {
      const response = await addressAPI.getUserAddresses(token, 3, page);
      // Check if response is successful
      if (response?.success && response?.result) {
        const addressData = response.result;
        // Map API response to component format
        const mappedAddresses = addressData.map((addr, index) => ({
          id: addr.id,
          label: `Địa chỉ ${(page * 3) + index + 1}`,
          fullName: addr.contactName,
          phone: addr.phone,
          addressLine: addr.detailAddress,
          city: addr.city,
          district: addr.state,
          ward: addr.ward,
          isDefault: addr.isDefault === "1"
        }));
        // Sort to put default address first
        mappedAddresses.sort((a, b) => b.isDefault - a.isDefault);
        setAddresses(mappedAddresses);
        setTotalPages(response.totalPages || 1);
        setCurrentPage(page);
      } else {
        console.warn('API response not successful:', response);
        // Don't show error toast for failed API calls, just log
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      // Don't show error toast, just log the error
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses(0);
  }, [token]);


  const isLoggedIn = useMemo(() => Boolean(user), [user]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!profileForm.fullName.trim()) {
      newErrors.fullName = 'Không được để trống';
    } else if (profileForm.fullName.trim().length < 3) {
      newErrors.fullName = 'Không được dưới 3 ký tự';
    }

    if (!profileForm.email.trim()) {
      newErrors.email = 'Không được để trống';
    } else if (!emailRegex.test(profileForm.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (profileForm.phone && profileForm.phone.length < 10) {
      newErrors.phone = 'Số điện thoại tối thiểu 10 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const userData = {
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim()
      };

      await userAPI.updateUser(user.id, userData, token);
      showToast('Cập nhật thông tin cá nhân thành công!', 'success');
      setIsEditing(false);
    } catch (error) {
      showToast('Có lỗi xảy ra khi cập nhật thông tin!', 'danger');
      console.error('Update user error:', error);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    setProfileForm({
      fullName: user?.fullName || user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
  };

  const openAddAddressModal = () => {
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (addr) => {
    setEditingAddress(addr);
    setIsEditModalOpen(true);
  };

  const handleAddressSaved = async (data) => {
    // Refresh addresses from API after adding new address
    await fetchAddresses(currentPage);
  };

  const handleAddressEdited = async (data) => {
    // Refresh addresses from API after editing address
    await fetchAddresses(currentPage);
  };

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      fetchAddresses(page);
    }
  };

  const handleDeleteAddress = async (id) => {
    const addr = addresses.find(a => a.id === id);
    if (!addr) return;

    try {
      const addressData = {
        id: addr.id,
        contactName: addr.fullName,
        phone: addr.phone,
        detailAddress: addr.addressLine,
        city: addr.city,
        state: addr.district,
        ward: addr.ward,
        isDefault: addr.isDefault ? "1" : "0",
        isDeleted: "1"
      };
      const response = await addressAPI.updateAddress(addressData, token);
      if (response && !response.success) {
        showToast(response.message || 'Không thể xóa địa chỉ này.', 'error');
        return;
      }
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      showToast('Đã xóa địa chỉ.', 'success');
    } catch (error) {
      showToast(error.message || 'Có lỗi xảy ra khi xóa địa chỉ.', 'error');
      console.error('Error deleting address:', error);
    }
  };

  const handleMakeDefault = async (id) => {
    const addr = addresses.find(a => a.id === id);
    if (!addr) return;

    try {
      const addressData = {
        id: addr.id,
        contactName: addr.fullName,
        phone: addr.phone,
        detailAddress: addr.addressLine,
        city: addr.city,
        state: addr.district,
        ward: addr.ward,
        isDefault: "1",
        isDeleted: "0"
      };
      const response = await addressAPI.updateAddress(addressData, token);
      if (response && !response.success) {
        showToast(response.message || 'Không thể đặt địa chỉ mặc định.', 'error');
        return;
      }
      await fetchAddresses(currentPage);
      showToast('Đã đặt địa chỉ mặc định.', 'success');
    } catch (error) {
      showToast(error.message || 'Có lỗi xảy ra khi đặt địa chỉ mặc định.', 'error');
      console.error('Error setting default address:', error);
    }
  };


  if (!isLoggedIn) {
    return (
      <div className="container page-content">
        <div className="alert alert-warning d-flex justify-content-between align-items-center">
          <div>Vui lòng đăng nhập để xem trang hồ sơ cá nhân.</div>
          <Link to="/login" className="btn btn-primary btn-sm">Đăng nhập</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-content">
      <h1 className="mb-4">Thông tin cá nhân</h1>
      <div className="row">
        <div className="col-lg-3">
          <div className="nav flex-column nav-pills">
            <button className={`nav-link ${activeTab === 'profile-info' ? 'active' : ''}`} onClick={() => handleTabClick('profile-info')}>Thông tin cơ bản</button>
            <button className={`nav-link ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => handleTabClick('addresses')}>Địa chỉ giao hàng</button>
            <button className={`nav-link ${activeTab === 'change-password' ? 'active' : ''}`} onClick={() => handleTabClick('change-password')}>Đổi mật khẩu</button>
          </div>
        </div>
        <div className="col-lg-9">
          <div className="tab-content">
            {activeTab === 'profile-info' && (
              <div className="tab-pane fade show active" id="profile-info">
                <div className="card">
                  <div className="card-body">
                    <h5>Thông tin cơ bản</h5>
                    <form onSubmit={handleProfileSubmit}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Họ và tên</label>
                          <input type="text" className="form-control" name="fullName" value={profileForm.fullName} onChange={handleProfileChange} disabled={!isEditing} />
                          {errors.fullName && <div className="text-danger small mt-1">{errors.fullName}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Email</label>
                          <input type="email" className="form-control" name="email" value={profileForm.email} onChange={handleProfileChange} disabled={!isEditing} />
                          {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Số điện thoại</label>
                          <input type="tel" className="form-control" name="phone" value={profileForm.phone} onChange={handleProfileChange} disabled={!isEditing} />
                          {errors.phone && <div className="text-danger small mt-1">{errors.phone}</div>}
                        </div>
                      </div>
                      {isEditing ? (
                        <>
                          <button type="submit" className="btn btn-primary me-2">Lưu</button>
                          <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Hủy</button>
                        </>
                      ) : (
                        <button type="button" className="btn btn-primary" onClick={handleEditClick}>Cập nhật</button>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="tab-pane fade show active" id="addresses">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5>Địa chỉ giao hàng</h5>
                      <button className="btn btn-primary" onClick={openAddAddressModal}>Thêm địa chỉ</button>
                    </div>

                    <div id="addressesList">
                      {addresses.length === 0 ? (
                        <div className="text-center py-4">Bạn chưa có địa chỉ nào</div>
                      ) : (
                        addresses.map((addr) => (
                          <div className="card mb-3 shadow-sm" key={addr.id}>
                            <div className="card-body">
                              <div className="d-flex justify-content-between">
                                <div>
                                  <div className="fw-semibold">
                                    {addr.label} {addr.isDefault && <span className="badge bg-success ms-2">Mặc định</span>}
                                  </div>
                                  <div className="text-muted small"><span className="fw-bold fs-6 text-dark">{addr.fullName}</span> | {addr.phone}</div>
                                  <div className="mt-2">{addr.addressLine}</div>
                                  <div className="text-muted">
                                    {addr.ward ? `${addr.ward}, ` : ''}{addr.district}, {addr.city}
                                  </div>
                                </div>
                                <div className="text-nowrap">
                                  <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => openEditAddressModal(addr)}>Sửa</button>
                                  {!addr.isDefault && (
                                    <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleMakeDefault(addr.id)}>Đặt mặc định</button>
                                  )}
                                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteAddress(addr.id)}>Xóa</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Pagination */}
                    <ul className="pagination justify-content-center align-items-center" style={{ minHeight: '40px' }}>
                      <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                          className="page-link d-flex align-items-center justify-content-center"
                          disabled={currentPage === 0}
                          onClick={() => handlePageChange(currentPage - 1)}
                          style={{ height: '40px', outline: 'none', boxShadow: 'none' }}
                        >
                          «
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, index) => (
                        <li key={index} className={`page-item ${currentPage === index ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
                          <button
                            className="page-link d-flex align-items-center justify-content-center"
                            onClick={() => handlePageChange(index)}
                            style={{ height: '40px', outline: 'none', boxShadow: 'none' }}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                          className="page-link d-flex align-items-center justify-content-center"
                          disabled={currentPage >= totalPages - 1}
                          onClick={() => handlePageChange(currentPage + 1)}
                          style={{ height: '40px', outline: 'none', boxShadow: 'none' }}
                        >
                          »
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'change-password' && (
              <ChangePasswordTab showToast={showToast} userId={user?.id} token={token} />
            )}
          </div>
        </div>
      </div>

      <AddressFormModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleAddressSaved}
      />

      <AddressEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleAddressEdited}
        address={editingAddress}
      />
    </div>
  );
};

export default ProfilePage;

