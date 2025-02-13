import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useLanguage } from './contexts/LanguageContext';
import WelcomePage from './components/WelcomePage';
import QuotesPage from './components/QuotesPage';
import LogoUpload from './components/LogoUpload';
import SummaryPage from './components/SummaryPage';

const translations = {
  he: {
    switchToEnglish: 'Switch to English',
    switchToHebrew: 'עבור לעברית',
  },
  en: {
    switchToEnglish: 'Switch to English',
    switchToHebrew: 'עבור לעברית',
  },
};

function App() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  const handleLanguageToggle = () => {
    setLanguage(language === 'he' ? 'en' : 'he');
  };

  // Protected route component that checks for company info
  const ProtectedSummaryRoute = () => {
    const companyInfoStr = localStorage.getItem('companyInfo');
    if (!companyInfoStr) {
      return <Navigate to="/quotes" replace />;
    }
    const companyInfo = JSON.parse(companyInfoStr);
    return <SummaryPage companyInfo={companyInfo} />;
  };

  // Protected route component that checks for company info before allowing logo upload
  const ProtectedLogoUploadRoute = () => {
    const companyInfoStr = localStorage.getItem('companyInfo');
    if (!companyInfoStr) {
      return <Navigate to="/quotes" replace />;
    }
    return <LogoUpload />;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
        {/* Language Toggle Button */}
        <button
          onClick={handleLanguageToggle}
          className="fixed top-4 right-4 bg-white px-4 py-2 rounded-md shadow-md hover:bg-gray-50 transition-colors z-50"
        >
          {language === 'he' ? t.switchToEnglish : t.switchToHebrew}
        </button>

        {/* Main Content */}
        <div className="container mx-auto px-4 min-h-screen flex items-center justify-center">
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/logo-upload" element={<ProtectedLogoUploadRoute />} />
            <Route path="/summary" element={<ProtectedSummaryRoute />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
