import { useModal } from '../../contexts/ModalContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Hero = () => {
  const { openModal } = useModal();
  const { isAuthenticated } = useAuth();
  const [animate, setAnimate] = useState(false);
  
  // Start animation after component mounts
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white w-full min-h-screen flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
        <div className="text-center">
          <h1 
            className={`text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl mb-4 opacity-0 ${
              animate ? 'animate-fadeInDown' : ''
            }`} 
            style={{ animationDuration: '0.7s', animationFillMode: 'forwards' }}
          >
            <span className="block">Share Code in Real-Time</span>
          </h1>
          
          <h1 
            className={`text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl mb-6 opacity-0 ${
              animate ? 'animate-fadeInUp' : ''
            }`} 
            style={{ 
              animationDuration: '0.9s',
              animationDelay: '0.3s',
              animationFillMode: 'forwards'
            }}
          >
            <span className="block text-blue-400">Collaborate Seamlessly</span>
          </h1>
          
          <p 
            className={`mt-6 max-w-3xl mx-auto text-lg text-gray-300 sm:text-xl md:mt-8 opacity-0 ${
              animate ? 'animate-fadeInUp' : ''
            }`}
            style={{ 
              animationDuration: '0.9s',
              animationDelay: '0.6s',
              animationFillMode: 'forwards'
            }}
          >
            CodeShare is a platform that lets you share code snippets, collaborate in real-time, and get instant feedback from your peers. 
            Perfect for interviews, code reviews, and teaching.
          </p>
          
          <div 
            className={`mt-10 sm:flex sm:justify-center opacity-0 ${
              animate ? 'animate-zoomIn' : ''
            }`}
            style={{ 
              animationDuration: '1.2s',
              animationDelay: '0.9s',
              animationFillMode: 'forwards'
            }}
          >
            {!isAuthenticated ? (
              <div className="rounded-md shadow">
                <button
                  onClick={() => openModal('login')}
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md
                   text-blue-100 bg-blue-600 hover:bg-blue-700 hover:text-blue-100 md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="rounded-md shadow">
                <Link
                  to="/editor"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md
                   text-blue-100 bg-blue-600 hover:bg-blue-700 hover:text-blue-100 md:py-4 md:text-lg md:px-10"
                >
                  Share Your Code
                </Link>
              </div>
            )}
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <a
                href="#about"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md
                 text-blue-600 bg-white hover:bg-gray-300 md:py-4 md:text-lg md:px-10"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add keyframe animations */}
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeInDown {
          animation-name: fadeInDown;
        }
        
        .animate-fadeInUp {
          animation-name: fadeInUp;
        }
        
        .animate-zoomIn {
          animation-name: zoomIn;
        }
      `}</style>
    </div>
  );
};

export default Hero; 