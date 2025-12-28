import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './CancelAppointmentModal.css';

const CancelAppointmentModal = ({ isOpen, onClose, onConfirm, appointmentDetails }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return ReactDOM.createPortal(
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1050 }}
        onClick={onClose}
      ></div>
      <div
        className="modal fade show"
        style={{ display: 'block', zIndex: 1055 }}
      >
        <div
          className="modal-dialog modal-dialog-centered cancel-appointment-modal"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '500px' }}
        >
          <div
            className="modal-content"
            style={{
              minHeight: 'auto',
              overflow: 'visible',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div className="modal-header border-0 pb-2" style={{ paddingTop: '1rem', flexShrink: 0 }}>
              <div style={{ width: '100%', textAlign: 'right' }}>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                ></button>
              </div>
            </div>
            <div className="modal-body text-center py-3 px-4" style={{ flexShrink: 0 }}>
              <div className="mb-3">
                <i
                  className="fas fa-exclamation-triangle text-warning"
                  style={{ fontSize: '3rem' }}
                ></i>
              </div>
              <h5 className="mb-3 fw-bold">Xác nhận hủy lịch hẹn</h5>
              <p className="text-muted mb-0">
                Bạn có muốn hủy lịch hẹn <strong>{appointmentDetails}</strong> không?
              </p>
            </div>
            <div
              className="modal-footer border-0 justify-content-center gap-2 pt-3 pb-4 px-4"
              style={{
                display: 'flex !important',
                flexShrink: 0,
                visibility: 'visible !important',
                opacity: '1 !important'
              }}
            >
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                style={{ minWidth: '100px' }}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirm}
                style={{ minWidth: '100px' }}
              >
                Hủy lịch
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default CancelAppointmentModal;