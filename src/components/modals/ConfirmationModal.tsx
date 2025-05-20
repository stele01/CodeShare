import React from 'react';
import { useModal } from '../../contexts/ModalContext';

const ConfirmationModal: React.FC = () => {
  const { closeModal, confirmOptions, modalType } = useModal();

  // Only render if we have both the correct modal type and confirmation options
  const isConfirmationModal = modalType === 'confirmPrivacyChange' || modalType === 'confirmDelete';
  if (!isConfirmationModal || !confirmOptions) return null;

  const { title, message, onConfirm, onCancel } = confirmOptions;

  const handleConfirm = () => {
    onConfirm();
    closeModal();
  };

  const handleCancel = () => {
    onCancel();
    closeModal();
  };

  // Choose button text and colors based on modal type
  const isDelete = modalType === 'confirmDelete';
  const confirmButtonText = isDelete ? 'Delete' : 'OK';
  const confirmButtonClass = isDelete 
    ? 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors' 
    : 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700 shadow-xl">
        <h3 className="text-xl font-semibold mb-4 text-white">{title}</h3>
        <p className="mb-6 text-gray-300">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={confirmButtonClass}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 