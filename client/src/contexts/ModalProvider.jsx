import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext({
  activeModalId: null,
  openModal: () => {},
  closeModal: () => {},
  isModalOpen: () => false
});

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [activeModalId, setActiveModalId] = useState(null);

  const openModal = (id) => setActiveModalId(id);
  const closeModal = (id) => {
    if (!id || id === activeModalId) {
      setActiveModalId(null);
    }
  };
  const isModalOpen = (id) => activeModalId === id;

  return (
    <ModalContext.Provider value={{ activeModalId, openModal, closeModal, isModalOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

export default ModalContext;
