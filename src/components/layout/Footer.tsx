import { useTranslation } from 'react-i18next';
import LogoAkademijaNis from '../../assets/logos/Logo akademija niš.svg';
import AppsTeamHorizontal from '../../assets/logos/apps-team-horizontal-01 white.png';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-800 text-white w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Logoi iznad linije, levo */}
        <div className="flex items-center space-x-6 mb-2">
          <a href="https://odseknis.akademijanis.edu.rs/" target="_blank" rel="noopener noreferrer">
            <img src={LogoAkademijaNis} alt="Logo Akademija Niš" className="h-10 w-auto" />
          </a>
          <a href="https://odseknis.akademijanis.edu.rs/vtsapps-team-rkts/" target="_blank" rel="noopener noreferrer">
            <img src={AppsTeamHorizontal} alt="Apps Team Logo" className="h-10 w-auto" />
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        </div>
        
        <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between">
          <p className="text-base text-gray-400">
            &copy; {new Date().getFullYear()} {t('footer.copyright')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="https://github.com/stele01" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
              <span className="sr-only">{t('footer.github')}</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 