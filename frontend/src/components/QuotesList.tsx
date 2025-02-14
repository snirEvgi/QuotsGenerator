import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { onSnapshot, query, collection, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Summary } from '../firebase/firestore';

const translations = {
  he: {
    title: 'הצעות המחיר שלך',
    noQuotes: 'אין הצעות מחיר שמורות',
    loading: 'טוען...',
    lastUpdated: 'עודכן לאחרונה:',
    createNew: 'צור הצעת מחיר חדשה',
    error: 'שגיאה בטעינת הצעות המחיר',
  },
  en: {
    title: 'Your Quotes',
    noQuotes: 'No saved quotes',
    loading: 'Loading...',
    lastUpdated: 'Last updated:',
    createNew: 'Create New Quote',
    error: 'Error loading quotes',
  },
};

export default function QuotesList() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const t = translations[language];

  const [quotes, setQuotes] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setError('Please sign in to view quotes');
      setLoading(false);
      return;
    }

    const quotesRef = collection(db, 'summaries');
    const q = query(
      quotesRef,
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const updatedQuotes = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }) as Summary);
        setQuotes(updatedQuotes);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading quotes:', error);
        setError(t.error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, t.error]);

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat(language === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <button
          onClick={() => navigate('/create-quote')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {t.createNew}
        </button>
      </div>

      {quotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t.noQuotes}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quotes.map((quote) => (
            <div
              key={quote.id}
              onClick={() => navigate(`/summary/${quote.id}`)}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {quote.companyInfo.companyName}
                  </h3>
                  <p className="text-gray-600">{quote.companyInfo.customerName}</p>
                </div>
                {quote.logo && (
                  <img
                    src={quote.logo}
                    alt="Company Logo"
                    className="h-10 w-10 object-contain"
                  />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {t.lastUpdated} {formatDate(quote.updatedAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
