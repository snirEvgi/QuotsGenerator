import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import WelcomePage from './components/WelcomePage';
import QuotesPage from './components/QuotesPage';
import QuotesList from './components/QuotesList';
import LogoUpload from './components/LogoUpload';
import SummaryPage from './components/SummaryPage';
import ProfileMenu from './components/ProfileMenu';
import SettingsPage from './components/SettingsPage';
import InformationPage from './components/InformationPage';

const translations = {
  he: {
    switchToEnglish: 'Switch to English',
    switchToHebrew: 'עבור לעברית',
    home: 'בית',
  },
  en: {
    switchToEnglish: 'Switch to English',
    switchToHebrew: 'עבור לעברית',
    home: 'Home',
  },
};

function AppContent() {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];

  const handleLanguageToggle = () => {
    setLanguage(language === 'he' ? 'en' : 'he');
  };

  return (
    <div className={`min-h-screen ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">{t.home}</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button
              onClick={handleLanguageToggle}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {language === 'he' ? t.switchToEnglish : t.switchToHebrew}
            </button>
            
            <ProfileMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/quotes-list" element={<QuotesList />} />
          <Route path="/create-quote" element={<QuotesPage />} />
          <Route path="/logo-upload" element={<LogoUpload />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/summary/:id" element={<SummaryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/information" element={<InformationPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
