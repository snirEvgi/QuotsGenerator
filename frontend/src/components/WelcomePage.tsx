import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { signInWithGoogle } from '../services/auth';

const translations = {
  he: {
    welcome: 'ברוכים הבאים',
    loginWithGoogle: 'התחבר עם גוגל',
    continueAsGuest: 'המשך כאורח',
  },
  en: {
    welcome: 'Welcome',
    loginWithGoogle: 'Login with Google',
    continueAsGuest: 'Continue as Guest',
  },
};

export default function WelcomePage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/quotes');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleGuestAccess = () => {
    navigate('/quotes');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <h1 className="text-5xl font-bold text-blue-600 mb-12">
        {t.welcome}
      </h1>
      
      <div className="space-y-4 w-full max-w-md">
        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white text-gray-700 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center space-x-2 rtl:space-x-reverse"
        >
          <img src="/google-icon.svg" alt="Google" className="w-6 h-6" />
          <span>{t.loginWithGoogle}</span>
        </button>
        
        <button 
          onClick={handleGuestAccess}
          className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          {t.continueAsGuest}
        </button>
      </div>
    </div>
  );
}
