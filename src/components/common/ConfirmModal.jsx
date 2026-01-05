import React, { useEffect } from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({
  isOpen,
  title = 'Xác nhận',
  message,
  onClose,
  onConfirm,
  confirmLabel = 'Xóa',
  loading = false
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="confirm-modal-backdrop"
        onClick={!loading ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal wrapper */}
      <div
        className="confirm-modal-wrapper"
        onClick={!loading ? onClose : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Modal card */}
        <div
          className="confirm-modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated warning icon */}
          <div className="confirm-modal-icon">
            <span className="confirm-modal-icon-inner">⚠️</span>
          </div>

          {/* Title */}
          <h2 id="confirm-modal-title" className="confirm-modal-title">
            {title}
          </h2>

          {/* Message */}
          {message && (
            <p className="confirm-modal-message">{message}</p>
          )}

          {/* Action buttons */}
          <div className="confirm-modal-buttons">
            <button
              type="button"
              className="confirm-modal-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="button"
              className={`confirm-modal-btn-confirm ${loading ? 'loading' : ''}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading && <span className="confirm-modal-spinner" />}
              {loading ? 'Đang xử lý...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
