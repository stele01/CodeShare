import { useModal } from '../../contexts/ModalContext';
import Login from './Login';
import Register from './Register';
import CreateProject from '../editor/CreateProject';

const AuthModal = () => {
  const { modalType } = useModal();

  if (!modalType) return null;

  return (
    <>
      {modalType === 'login' && <Login />}
      {modalType === 'register' && <Register />}
      {modalType === 'createProject' && <CreateProject />}
    </>
  );
};

export default AuthModal; 