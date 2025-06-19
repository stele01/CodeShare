import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './components/home/HomePage';
import ProfilePage from './components/profile/ProfilePage';
import CodeEditor from './components/editor/CodeEditor';
import ShareRedirect from './components/editor/ShareRedirect';
import { ModalProvider } from './contexts/ModalContext';
import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { SocketProvider } from './contexts/SocketContext';
import { LanguageProvider } from './contexts/LanguageContext';
import AuthModal from './components/auth/AuthModal';
import ConfirmationModal from './components/modals/ConfirmationModal';

function App() {
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
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/editor" element={<CodeEditor />} />
                      <Route path="/editor/:id" element={<CodeEditor />} />
                      <Route path="/s/:shortCode" element={<ShareRedirect />} />
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
