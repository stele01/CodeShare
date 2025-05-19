import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './components/home/HomePage';
import ProfilePage from './components/profile/ProfilePage';
import CodeEditor from './components/editor/CodeEditor';
import { ModalProvider } from './contexts/ModalContext';
import { AuthProvider } from './contexts/AuthContext';
import AuthModal from './components/auth/AuthModal';

function App() {
  return (
    <AuthProvider>
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
              </Routes>
            </main>
            <Footer />
            <AuthModal />
          </div>
        </Router>
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;
