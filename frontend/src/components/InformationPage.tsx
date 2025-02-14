import { useLanguage } from '../contexts/LanguageContext';

const translations = {
  he: {
    title: 'מידע',
    comingSoon: 'בקרוב...',
  },
  en: {
    title: 'Information',
    comingSoon: 'Coming Soon...',
  },
};

export default function InformationPage() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>
      <p className="text-gray-600 text-lg">{t.comingSoon}</p>
    </div>
  );
}
