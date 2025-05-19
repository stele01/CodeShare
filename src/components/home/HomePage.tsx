import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from './Hero';
import Features from './Features';
import FAQ from './FAQ';

const HomePage = () => {
  const location = useLocation();
  const [aboutAnimate, setAboutAnimate] = useState(false);

  useEffect(() => {
    // Handle hash navigation when component mounts or location changes
    if (location.hash) {
      const id = location.hash.substring(1); // remove the # character
      const element = document.getElementById(id);
      if (element) {
        // Delay scrolling slightly to ensure the page is fully rendered
        setTimeout(() => {
          // Get the element's position
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          // Subtract offset (pixels) from the position to create space above
          const offsetPosition = elementPosition - 100;
          
          // Scroll to the adjusted position
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [location]);
  
  // Start animation when About section is visible
  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('about');
      if (element) {
        const rect = element.getBoundingClientRect();
        // Adjust this value to match the scroll offset
        const isVisible = rect.top < window.innerHeight - 100 && rect.bottom >= 0;
        if (isVisible) {
          setAboutAnimate(true);
          window.removeEventListener('scroll', handleScroll);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    // Check immediately in case about section is already visible
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-white w-full">
      {/* Hero section with initial fade-in */}
      <Hero />

      {/* Features section with scroll-triggered animation */}
      <Features />

      {/* About section with scroll-triggered animation */}
      <div id="about" className="bg-white py-16 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 
              className={`text-base font-semibold text-blue-600 tracking-wide uppercase opacity-0 ${
                aboutAnimate ? 'animate-fadeInDown' : ''
              }`} 
              style={{ 
                animationDuration: '0.8s', 
                animationFillMode: 'forwards' 
              }}
            >
              About Us
            </h2>
            
            <p 
              className={`mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight opacity-0 ${
                aboutAnimate ? 'animate-fadeInUp' : ''
              }`}
              style={{ 
                animationDuration: '0.8s',
                animationDelay: '0.4s',
                animationFillMode: 'forwards'
              }}
            >
              Our mission is to make code sharing simple
            </p>
            
            <p 
              className={`max-w-xl mt-5 mx-auto text-xl text-gray-500 opacity-0 ${
                aboutAnimate ? 'animate-fadeInUp' : ''
              }`}
              style={{ 
                animationDuration: '0.8s',
                animationDelay: '0.6s',
                animationFillMode: 'forwards'
              }}
            >
              We're a team of developers who believe that code collaboration should be easy and accessible to everyone.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ section with scroll-triggered animation */}
      <FAQ />
      
      {/* Include the same animations as in other components */}
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
        
        .animate-fadeInDown {
          animation-name: fadeInDown;
        }
        
        .animate-fadeInUp {
          animation-name: fadeInUp;
        }
      `}</style>
    </div>
  );
};

export default HomePage; 