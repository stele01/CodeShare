import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useModal } from '../../contexts/ModalContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { handleCtrlClickNavigation } from '../../utils/navigation';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import LogoAkademijaNis from '../../assets/logos/Logo akademija niš.svg';
import AppsTeamHorizontal from '../../assets/logos/apps-team-horizontal-01 white.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { openModal } = useModal();
  const { isAuthenticated, user, logout } = useAuth();
  const { clearWorkspace } = useWorkspace();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const pendingScrollRef = useRef<string | null>(null);
  const homeNavRef = useRef<boolean>(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    clearWorkspace();
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

  const currentLanguage = i18n.language;
  const setLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'en-US':
        return t('language.en');
      case 'sr-Latn':
        return t('language.srLatn');
      case 'sr-Cyrl':
        return t('language.srCyrl');
      default:
        return lang;
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg w-full z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Levo: SVG logo */}
            <a href="https://odseknis.akademijanis.edu.rs/" target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center mr-6">
              <img src={LogoAkademijaNis} alt="Logo Akademija Niš" className="h-10 w-auto" />
            </a>
            {/* Brand tekst (uvek pored SVG-a na desktopu, samostalno na mobilu) */}
            <Link 
              to="/" 
              className="text-white font-bold text-xl mr-8 flex items-center"
              onClick={handleLogoClick}
            >
              <span className="hidden md:inline">{t('brand')}</span>
              <span className="md:hidden">{t('brand')}</span>
            </Link>
            <div className="hidden md:flex items-center">
              <button 
                onClick={e => handleCtrlClickNavigation(e, '/#features', navigate)}
                className="text-gray-300 hover:text-white hover:border-gray-800 bg-gray-800 px-3 py-2 rounded-md text-sm font-medium mr-6"
              >
                {t('home.features')}
              </button>
              <button 
                onClick={e => handleCtrlClickNavigation(e, '/#about', navigate)}
                className="text-gray-300 hover:text-white hover:border-gray-800 bg-gray-800 px-3 py-2 rounded-md text-sm font-medium mr-6"
              >
                {t('home.about_us')}
              </button>
              <button 
                onClick={e => handleCtrlClickNavigation(e, '/#faq', navigate)}
                className="text-gray-300 hover:text-white hover:border-gray-800 bg-gray-800 px-3 py-2 rounded-md text-sm font-medium mr-6"
              >
                {t('home.faq')}
              </button>
            </div>
          </div>
          
          {/* Desno: PNG logo */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="text-gray-300 hover:text-white bg-gray-800 p-2 rounded-md text-sm font-medium flex items-center"
                aria-label="Change language"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="ml-2">{getLanguageLabel(currentLanguage)}</span>
              </button>

              {/* Language Dropdown Menu */}
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      onClick={() => {
                        setLanguage('en-US');
                        setIsLangMenuOpen(false);
                      }}
                      className={`group flex items-center w-full px-4 py-2 text-sm text-gray-900 !bg-white ${currentLanguage === 'en-US' ? '!bg-gray-100' : ''} hover:!bg-gray-100`}
                      role="menuitem"
                    >
                      {t('language.en')}
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('sr-Latn');
                        setIsLangMenuOpen(false);
                      }}
                      className={`group flex items-center w-full px-4 py-2 text-sm text-gray-900 !bg-white ${currentLanguage === 'sr-Latn' ? '!bg-gray-100' : ''} hover:!bg-gray-100`}
                      role="menuitem"
                    >
                      {t('language.srLatn')}
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('sr-Cyrl');
                        setIsLangMenuOpen(false);
                      }}
                      className={`group flex items-center w-full px-4 py-2 text-sm text-gray-900 !bg-white ${currentLanguage === 'sr-Cyrl' ? '!bg-gray-100' : ''} hover:!bg-gray-100`}
                      role="menuitem"
                    >
                      {t('language.srCyrl')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* NEW - Unified User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                aria-haspopup="true"
                aria-expanded={isUserMenuOpen}
              >
                <span className="sr-only">Open user menu</span>
                {isAuthenticated && user ? (
                  <img
                    className="h-8 w-8 rounded-full bg-gray-700"
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=0D8ABC&color=fff`}
                    alt="User avatar"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </button>

              {isUserMenuOpen && (
                <div 
                  className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-4 py-3">
                        <p className="text-sm text-gray-900 font-semibold">{user.fullName}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="border-t border-gray-100" />
                      <Link
                        to="/my-projects"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Projects
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {t('navbar.settings')}
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        {t('navbar.logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          openModal('login');
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        {t('editor.login')}
                      </button>
                      <button
                        onClick={() => {
                          openModal('register');
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        {t('navbar.register')}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            {/* Skroz desno logo */}
            <a href="https://odseknis.akademijanis.edu.rs/vtsapps-team-rkts/" target="_blank" rel="noopener noreferrer" className="ml-6">
              <img src={AppsTeamHorizontal} alt="Apps Team Logo" className="h-10 w-auto" />
            </a>
          </div>
          
          <div className="md:hidden flex items-center">
            {/* Mobile Language Switcher */}
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="text-gray-300 hover:text-white bg-gray-800 p-2 rounded-md text-sm font-medium mr-2"
              aria-label="Change language"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>

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
              onClick={e => handleCtrlClickNavigation(e, '/#features', navigate)}
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              {t('home.features')}
            </button>
            <button 
              onClick={e => handleCtrlClickNavigation(e, '/#about', navigate)}
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              {t('home.about_us')}
            </button>
            <button 
              onClick={e => handleCtrlClickNavigation(e, '/#faq', navigate)}
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
            >
              {t('home.faq')}
            </button>
          </div>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-700">
            {/* NEW - Mobile User Info/Actions */}
            {isAuthenticated && user ? (
              <div className="pt-4 pb-3 border-t border-gray-700">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=0D8ABC&color=fff`}
                      alt="User avatar"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-white">{user.fullName}</div>
                    <div className="text-sm font-medium leading-none text-gray-400">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    to="/my-projects"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Projects
                  </Link>
                  <Link
                    to="/settings"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('navbar.settings')}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    {t('navbar.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-2 pb-3 space-y-1">
                <button
                  onClick={() => {
                    openModal('login');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  {t('editor.login')}
                </button>
                <button
                  onClick={() => {
                    openModal('register');
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  {t('navbar.register')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Language Menu */}
      {isLangMenuOpen && (
        <div className="md:hidden bg-white shadow-lg w-full">
          <div className="py-1">
            <button
              onClick={() => {
                setLanguage('en-US');
                setIsLangMenuOpen(false);
              }}
              className={`group flex items-center w-full px-4 py-2 text-base text-gray-900 !bg-white ${currentLanguage === 'en-US' ? '!bg-gray-100' : ''} hover:!bg-gray-100`}
            >
              {t('language.en')}
            </button>
            <button
              onClick={() => {
                setLanguage('sr-Latn');
                setIsLangMenuOpen(false);
              }}
              className={`group flex items-center w-full px-4 py-2 text-base text-gray-900 !bg-white ${currentLanguage === 'sr-Latn' ? '!bg-gray-100' : ''} hover:!bg-gray-100`}
            >
              {t('language.srLatn')}
            </button>
            <button
              onClick={() => {
                setLanguage('sr-Cyrl');
                setIsLangMenuOpen(false);
              }}
              className={`group flex items-center w-full px-4 py-2 text-base text-gray-900 !bg-white ${currentLanguage === 'sr-Cyrl' ? '!bg-gray-100' : ''} hover:!bg-gray-100`}
            >
              {t('language.srCyrl')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 