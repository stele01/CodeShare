import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useModal } from '../../contexts/ModalContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openModal } = useModal();
  const { isAuthenticated, logout } = useAuth();
  const { hasActiveWorkspace, clearWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  const pendingScrollRef = useRef<string | null>(null);
  const homeNavRef = useRef<boolean>(false);
  
  // Handle scrolling after navigation
  useEffect(() => {
    if (pendingScrollRef.current && location.pathname === '/') {
      const targetId = pendingScrollRef.current;
      pendingScrollRef.current = null;
      
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          // Get the element's position
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          // Subtract offset (pixels) from the position to create space above
          const offsetPosition = elementPosition - 100;
          
          // Scroll to the adjusted position
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
    
    // Handle home navigation with scroll to top
    if (homeNavRef.current && location.pathname === '/') {
      homeNavRef.current = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    clearWorkspace();
  };
  
  const navigateToHash = (hash: string) => {
    // If already on homepage, just scroll to the section
    if (location.pathname === '/') {
      const element = document.getElementById(hash);
      if (element) {
        // Get the element's position
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        // Subtract offset (pixels) from the position to create space above
        const offsetPosition = elementPosition - 100;
        
        // Scroll to the adjusted position
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      // Set the section to scroll to after navigation
      pendingScrollRef.current = hash;
      // Navigate to homepage without the hash in URL
      navigate('/');
    }
    
    // Close mobile menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };
  
  const handleLogoClick = (e: React.MouseEvent) => {
    // If already on home page, prevent default navigation and just scroll to top
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Mark that we should scroll to top after navigating to homepage
      homeNavRef.current = true;
    }
    
    // Close mobile menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg w-full z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-white font-bold text-xl mr-8"
              onClick={handleLogoClick}
            >
              CodeShare
            </Link>
            <div className="hidden md:flex items-center">
              <button 
                onClick={() => navigateToHash('features')} 
                className="text-gray-300 hover:text-white hover:border-gray-800 bg-gray-800 px-3 py-2 rounded-md text-sm font-medium mr-6"
              >
                Features
              </button>
              <button 
                onClick={() => navigateToHash('about')} 
                className="text-gray-300 hover:text-white hover:border-gray-800 bg-gray-800 px-3 py-2 rounded-md text-sm font-medium mr-6"
              >
                About
              </button>
              <button 
                onClick={() => navigateToHash('faq')} 
                className="text-gray-300 hover:text-white hover:border-gray-800 bg-gray-800 px-3 py-2 rounded-md text-sm font-medium mr-6"
              >
                FAQ
              </button>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile"
                  className="text-gray-300 hover:text-white bg-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Profile
                </Link>
                <span className="text-gray-300 text-sm font-medium">|</span>
                <button 
                  onClick={handleLogout}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {hasActiveWorkspace ? (
                  <Link 
                    to="/editor"
                    className="bg-purple-600 hover:bg-purple-700 hover:text-white text-white px-4 py-2 rounded-md text-sm font-medium mr-4"
                  >
                    My Editor
                  </Link>
                ) : (
                  <Link 
                    to="/editor"
                    className="bg-purple-600 hover:bg-purple-700 hover:text-white text-white px-4 py-2 rounded-md text-sm font-medium mr-4"
                  >
                    Share as Guest
                  </Link>
                )}
                <button 
                  onClick={() => openModal('login')}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </button>
                <button 
                  onClick={() => openModal('register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </button>
              </>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 shadow-lg w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button 
              onClick={() => navigateToHash('features')} 
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              Features
            </button>
            <button 
              onClick={() => navigateToHash('about')} 
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              About
            </button>
            <button 
              onClick={() => navigateToHash('faq')} 
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              FAQ
            </button>
          </div>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-700">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/profile"
                  className="text-gray-300 hover:text-white bg-gray-800 px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-blue-600 hover:bg-blue-700 text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {hasActiveWorkspace ? (
                  <Link 
                    to="/editor"
                    className="bg-purple-600 hover:bg-purple-700 hover:text-white text-white px-4 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    My Editor
                  </Link>
                ) : (
                  <Link 
                    to="/editor"
                    className="bg-purple-600 hover:bg-purple-700 hover:text-white text-white px-4 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Share as Guest
                  </Link>
                )}
                <button 
                  onClick={() => {
                    openModal('login');
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  Login
                </button>
                <button 
                  onClick={() => {
                    openModal('register');
                    setIsMenuOpen(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 