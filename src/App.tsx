import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './components/home/HomePage';
import MyProjects from './components/profile/MyProjects';
import CodeEditor from './components/editor/CodeEditor';
import ShareRedirect from './components/editor/ShareRedirect';
import { ModalProvider } from './contexts/ModalContext';
import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { SocketProvider } from './contexts/SocketContext';
import { LanguageProvider } from './contexts/LanguageContext';
import AuthModal from './components/auth/AuthModal';
import ConfirmationModal from './components/modals/ConfirmationModal';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import WithSuspense from './components/WithSuspense';
import LanguageSwitcher from './components/common/LanguageSwitcher';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import SettingsPage from './components/settings/SettingsPage';
import NotFoundPage from './components/NotFoundPage';

function App() {
  const { i18n } = useTranslation();

  return (
    <AuthProvider>
      <WorkspaceProvider>
        <SocketProvider>
          <LanguageProvider>
            <ModalProvider>
              <Router>
                <div className="min-h-screen flex flex-col w-full">
                  <Navbar />
                  <main className="flex-grow w-full pt-16">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/my-projects" element={<WithSuspense><MyProjects /></WithSuspense>} />
                      <Route path="/editor" element={<CodeEditor />} />
                      <Route path="/editor/:id" element={<CodeEditor />} />
                      <Route path="/s/:shortCode" element={<ShareRedirect />} />
                      <Route path="/settings" element={<WithSuspense><SettingsPage /></WithSuspense>} />
                    </Routes>
                  </main>
                  <Footer />
                  <AuthModal />
                  <ConfirmationModal />
                </div>
              </Router>
            </ModalProvider>
          </LanguageProvider>
        </SocketProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;
