import { useEffect, useRef } from 'react';
import { useModal } from '../../contexts/ModalContext';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const { openModal } = useModal();
  const heroRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  
  useEffect(() => {
    if (heroRef.current) {
      heroRef.current.classList.add('animate-fadeIn');
    }
  }, []);

  return (
    <div ref={heroRef} className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20 opacity-0" style={{ animationDuration: '1s', animationFillMode: 'forwards' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
            <span className="block opacity-0 animate-fadeInDown" style={{ animationDelay: '0.3s', animationDuration: '0.8s', animationFillMode: 'forwards' }}>
              {t('home.hero_title1')}
            </span>
            <span className="block text-indigo-200 opacity-0 animate-fadeInUp" style={{ animationDelay: '0.6s', animationDuration: '0.8s', animationFillMode: 'forwards' }}>
              {t('home.hero_title2')}
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-indigo-200 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl opacity-0 animate-fadeIn" 
             style={{ animationDelay: '0.9s', animationDuration: '1s', animationFillMode: 'forwards' }}>
            {t('home.hero_desc')}
          </p>
          <div className="mt-10 flex justify-center gap-4 opacity-0 animate-fadeInUp" 
               style={{ animationDelay: '1.2s', animationDuration: '0.8s', animationFillMode: 'forwards' }}>
            <button
              onClick={() => openModal('createProject')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-8 transition-colors duration-300"
            >
              {t('home.start_coding', 'Start Coding')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 