import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EditableTable from './EditableTable';
import { TermsAndConditions } from './TermsAndConditions';
import { Remarks } from './Remarks';
import { PdfPreview } from './PdfPreview';
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
    subtotal: 'סכום ביניים',
    vat: 'מע"מ',
    total: 'סה"כ'
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
    subtotal: 'Subtotal',
    vat: 'VAT',
    total: 'Total'
  },
};

export default function SummaryPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const t = translations[language];
  const isHebrew = language === 'he';
  
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localChanges, setLocalChanges] = useState<Partial<Summary>>({});
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Calculate totals
  const calculateTotals = () => {
    if (!summary?.tableData) return { subtotal: 0, vat: 0, total: 0 };
    
    const subtotal = summary.tableData.reduce((acc, row) => {
      if (row.isSubheader) return acc;
      return acc + (row.quantity * row.price);
    }, 0);
    
    const vat = subtotal * 0.17; // 17% VAT
    const total = subtotal + vat;
    
    return { subtotal, vat, total };
  };

  const handleLocalChange = (changes: Partial<Summary>) => {
    setLocalChanges(prev => {
      const newChanges = { ...prev, ...changes };
  
      // Prevent unnecessary updates if nothing changed
      if (JSON.stringify(prev) === JSON.stringify(newChanges)) {
        return prev;
      }
  
      return newChanges;
    });
  };
  const handlePreviewClick = async () => {
    if (!summary?.id || saving) return;

    try {
      setSaving(true);
      if (Object.keys(localChanges).length > 0) {
        const updatedSummary = { ...summary, ...localChanges };
        await updateSummary(summary.id, localChanges);
        setSummary(updatedSummary);
        setLocalChanges({});
      }
      setShowPdfPreview(true);
    } catch (err) {
      console.error('Error saving changes:', err);
      setSummary(summary);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadSummary = async () => {
      if (!user?.uid) {
        setError('Please sign in to view quotes');
        setLoading(false);
        return;
      }

      if (!id) {
        navigate('/create-quote');
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

  if (showPdfPreview && summary) {
    return (
      <PdfPreview
        companyInfo={summary.companyInfo}
        logo={summary.logo}
        includeTerms={true}
        includeRemarks={true}
        onBack={() => setShowPdfPreview(false)}
        tableData={summary.tableData || []}
        terms={summary.terms}
        remarks={summary.remarks}
      />
    );
  }

  const { subtotal, vat, total } = calculateTotals();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <div className={`flex items-start justify-between mb-6 ${isHebrew ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="w-32">
            {summary.logo && (
              <img src={summary.logo} alt="Company Logo" className="w-full object-contain" />
            )}
          </div>
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold">{t.title}</h1>
          </div>
          <div className="w-32"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6" dir={isHebrew ? 'rtl' : 'ltr'}>
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

      <div className="bg-white shadow-lg rounded-lg p-6 mt-4" dir={isHebrew ? 'rtl' : 'ltr'}>
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-4">
            <span className="font-medium">{t.subtotal}:</span>
            <span>₪{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex gap-4">
            <span className="font-medium">{t.vat} (17%):</span>
            <span>₪{vat.toFixed(2)}</span>
          </div>
          <div className="flex gap-4 text-lg font-bold border-t pt-2">
            <span>{t.total}:</span>
            <span>₪{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

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
