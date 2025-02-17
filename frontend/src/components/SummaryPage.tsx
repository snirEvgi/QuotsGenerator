import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EditableTable from './EditableTable';
import { TermsAndConditions } from './TermsAndConditions';
import { Remarks } from './Remarks';
import { createSummary, updateSummary, getSummary, type Summary } from '../firebase/firestore';

const translations = {
  he: {
    title: 'סיכום הצעת מחיר',
    companyDetails: 'פרטי החברה',
    companyName: 'שם החברה',
    companyId: 'ח.פ',
    companyPhone: 'טלפון החברה',
    customerName: 'שם הלקוח',
    error: 'שגיאה בטעינת פרטי החברה',
    backToForm: 'חזור לטופס',
    loading: 'טוען...',
    noAccess: 'אין לך גישה להצעת מחיר זו',
    saving: 'שומר...',
    preview: 'תצוגה מקדימה',
  },
  en: {
    title: 'Quote Summary',
    companyDetails: 'Company Details',
    companyName: 'Company Name',
    companyId: 'Company ID',
    companyPhone: 'Company Phone',
    customerName: 'Customer Name',
    error: 'Error loading company details',
    backToForm: 'Back to Form',
    loading: 'Loading...',
    noAccess: 'You do not have access to this quote',
    saving: 'Saving...',
    preview: 'Preview',
  },
};

export default function SummaryPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const t = translations[language];
  
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localChanges, setLocalChanges] = useState<Partial<Summary>>({});

  useEffect(() => {
    let mounted = true;

    const loadSummary = async () => {
      if (!user?.uid) {
        setError('Please sign in to view quotes');
        setLoading(false);
        return;
      }

      if (!id) {
        const storedInfo = localStorage.getItem('companyInfo');
        const storedLogo = localStorage.getItem('companyLogo');
        
        if (!storedInfo) {
          navigate('/quotes-list');
          return;
        }

        try {
          const parsedInfo = JSON.parse(storedInfo);
          if (!parsedInfo.companyName || !parsedInfo.companyId || 
              !parsedInfo.companyPhone || !parsedInfo.customerName) {
            setError('Invalid company information');
            setLoading(false);
            return;
          }

          const newSummary = await createSummary(user.uid, {
            companyInfo: parsedInfo,
            logo: storedLogo,
            terms: '',
            remarks: '',
            tableData: [],
          });

          if (!mounted) return;
          
          localStorage.removeItem('companyInfo');
          localStorage.removeItem('companyLogo');
          navigate(`/summary/${newSummary.id}`, { replace: true });
        } catch (err) {
          if (!mounted) return;
          setError('Failed to create quote');
          setLoading(false);
        }
        return;
      }

      try {
        const existingSummary = await getSummary(id);
        if (!mounted) return;

        if (!existingSummary) {
          setError('Quote not found');
          setLoading(false);
          return;
        }

        if (existingSummary.userId !== user.uid) {
          setError(t.noAccess);
          setLoading(false);
          return;
        }

        setSummary(existingSummary);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setError('Failed to load quote');
        setLoading(false);
      }
    };

    loadSummary();
    return () => {
      mounted = false;
    };
  }, [id, user?.uid, navigate, t.noAccess]);

  const handleLocalChange = (changes: Partial<Summary>) => {
    setLocalChanges(prev => ({ ...prev, ...changes }));
  };

  const handlePreviewClick = async () => {
    if (!summary?.id || saving || Object.keys(localChanges).length === 0) return;

    try {
      setSaving(true);
      const updatedSummary = { ...summary, ...localChanges };
      await updateSummary(summary.id, localChanges);
      setSummary(updatedSummary);
      setLocalChanges({});
    } catch (err) {
      console.error('Error saving changes:', err);
      // Revert on error
      setSummary(summary);
    } finally {
      setSaving(false);
    }
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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/quotes-list')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t.backToForm}
        </button>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">{t.title}</h1>
      
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{t.companyDetails}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">{t.companyName}</p>
            <p>{summary.companyInfo.companyName}</p>
          </div>
          <div>
            <p className="font-medium">{t.companyId}</p>
            <p>{summary.companyInfo.companyId}</p>
          </div>
          <div>
            <p className="font-medium">{t.companyPhone}</p>
            <p>{summary.companyInfo.companyPhone}</p>
          </div>
          <div>
            <p className="font-medium">{t.customerName}</p>
            <p>{summary.companyInfo.customerName}</p>
          </div>
        </div>
      </div>

      <EditableTable
        data={summary.tableData || []}
        onDataChange={(tableData) => handleLocalChange({ tableData })}
      />

      <div className="mt-8">
        <TermsAndConditions
          terms={summary.terms || ''}
          onChange={(terms) => handleLocalChange({ terms })}
        />
      </div>

      <div className="mt-8">
        <Remarks
          remarks={summary.remarks || ''}
          onChange={(remarks) => handleLocalChange({ remarks })}
        />
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={handlePreviewClick}
          disabled={saving || Object.keys(localChanges).length === 0}
          className={`px-6 py-2 rounded-lg text-white font-semibold ${
            saving || Object.keys(localChanges).length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {saving ? t.saving : t.preview}
        </button>
      </div>
    </div>
  );
}
