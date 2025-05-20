import React, { createContext, useState, useContext, ReactNode } from 'react';

type ModalType = 'login' | 'register' | 'createProject' | 'confirmPrivacyChange' | 'confirmDelete' | null;

interface ConfirmationOptions {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface ModalContextType {
  modalType: ModalType;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
  confirmOptions: ConfirmationOptions | null;
  showConfirmation: (options: ConfirmationOptions) => void;
  showDeleteConfirmation: (options: ConfirmationOptions) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmationOptions | null>(null);

  const openModal = (type: ModalType) => {
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    if (modalType === 'confirmPrivacyChange' || modalType === 'confirmDelete') {
      setConfirmOptions(null);
    }
  };
  
  const showConfirmation = (options: ConfirmationOptions) => {
    setConfirmOptions(options);
    setModalType('confirmPrivacyChange');
  };
  
  const showDeleteConfirmation = (options: ConfirmationOptions) => {
    setConfirmOptions(options);
    setModalType('confirmDelete');
  };

  return (
    <ModalContext.Provider value={{ 
      modalType, 
      openModal, 
      closeModal, 
      confirmOptions, 
      showConfirmation,
      showDeleteConfirmation 
    }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}; 