import { useModal } from '../../contexts/ModalContext';
import Login from './Login';
import Register from './Register';

const AuthModal = () => {
  const { modalType } = useModal();

  if (!modalType) return null;

  return (
    <>
      {modalType === 'login' && <Login />}
      {modalType === 'register' && <Register />}
    </>
  );
};

export default AuthModal; 