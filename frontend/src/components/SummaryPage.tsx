import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import EditableTable from './EditableTable';
import { TermsAndConditions } from './TermsAndConditions';
import { Remarks } from './Remarks';
import { FormControlLabel, Switch, styled } from '@mui/material';
import { PdfPreview } from './PdfPreview';
import '../styles/pdf.css';

interface CompanyInfo {
  companyName: string;
  companyId: string;
  companyPhone: string;
  customerName: string;
}

interface SummaryPageProps {
  companyInfo: CompanyInfo;
}

const translations = {
  he: {
    title: 'סיכום הצעת מחיר',
    companyDetails: 'פרטי החברה',
    companyName: 'שם החברה',
    companyId: 'ח.פ',
    companyPhone: 'טלפון',
    customerName: 'שם הלקוח',
    downloadPdf: 'הורד PDF',
    includeTerms: 'כלול תנאים והגבלות',
    includeRemarks: 'כלול הערות',
    previewPdf: 'תצוגה מקדימה של PDF'
  },
  en: {
    title: 'Price Quote Summary',
    companyDetails: 'Company Details',
    companyName: 'Company Name',
    companyId: 'Company ID',
    companyPhone: 'Phone',
    customerName: 'Customer Name',
    downloadPdf: 'Download PDF',
    includeTerms: 'Include Terms & Conditions',
    includeRemarks: 'Include Remarks',
    previewPdf: 'Preview PDF'
  },
};

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#4F46E5',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#4F46E5',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: '#E5E7EB',
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.7,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: '#E5E7EB',
    opacity: 1,
    transition: 'background-color 500ms',
  },
}));

export default function SummaryPage({ companyInfo }: SummaryPageProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const isHebrew = language === 'he';
  const [logo, setLogo] = useState<string | null>(() => {
    return localStorage.getItem('companyLogo');
  });
  const [includeTerms, setIncludeTerms] = useState(() => {
    const saved = localStorage.getItem('includeTerms');
    return saved ? JSON.parse(saved) : true;
  });
  const [includeRemarks, setIncludeRemarks] = useState(() => {
    const saved = localStorage.getItem('includeRemarks');
    return saved ? JSON.parse(saved) : true;
  });
  const [showPreview, setShowPreview] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [terms, setTerms] = useState<string>(() => {
    const savedTerms = localStorage.getItem('terms');
    return savedTerms || '';
  });
  const [remarks, setRemarks] = useState<string>(() => {
    const savedRemarks = localStorage.getItem('remarks');
    return savedRemarks || '';
  });

  useEffect(() => {
    localStorage.setItem('terms', terms);
  }, [terms]);

  useEffect(() => {
    localStorage.setItem('remarks', remarks);
  }, [remarks]);

  useEffect(() => {
    localStorage.setItem('includeTerms', JSON.stringify(includeTerms));
  }, [includeTerms]);

  useEffect(() => {
    localStorage.setItem('includeRemarks', JSON.stringify(includeRemarks));
  }, [includeRemarks]);

  const handleTableData = (data: any[]) => {
    setTableData(data);
  };

  const handleTermsChange = (content: string) => {
    setTerms(content);
  };

  const handleRemarksChange = (content: string) => {
    setRemarks(content);
  };

  if (showPreview) {
    return (
      <PdfPreview
        companyInfo={companyInfo}
        logo={logo}
        includeTerms={includeTerms}
        includeRemarks={includeRemarks}
        onBack={() => setShowPreview(false)}
        tableData={tableData}
        terms={terms}
        remarks={remarks}
      />
    );
  }

  return (
    <div className="container mx-auto p-6" dir={isHebrew ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-6" dir={!isHebrew ? 'rtl' : 'ltr'}>
          {logo && (
            <div className="w-48">
              <img src={logo} alt="Company Logo" className="h-24 object-contain" />
            </div>
          )}
          <h1 className="text-3xl font-bold mt-3 mr-3 text-gray-900">{t.title}</h1>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{t.companyDetails}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t.companyName}</label>
              <div className="mt-1">{companyInfo.companyName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t.companyId}</label>
              <div className="mt-1">{companyInfo.companyId}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t.companyPhone}</label>
              <div className="mt-1">{companyInfo.companyPhone}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t.customerName}</label>
              <div className="mt-1">{companyInfo.customerName}</div>
            </div>
          </div>
        </div>

        <EditableTable onDataChange={handleTableData} />

        <div className="flex flex-col gap-4 mt-6">
          <FormControlLabel
            control={
              <IOSSwitch
                checked={includeTerms}
                onChange={(e) => setIncludeTerms(e.target.checked)}
              />
            }
            label={t.includeTerms}
            className="gap-2"
          />
          <FormControlLabel
            control={
              <IOSSwitch
                checked={includeRemarks}
                onChange={(e) => setIncludeRemarks(e.target.checked)}
              />
            }
            label={t.includeRemarks}
            className="gap-2"
          />
        </div>

        {includeTerms && <TermsAndConditions onChange={handleTermsChange} />}
        {includeRemarks && <Remarks onChange={handleRemarksChange} />}

        <button
          onClick={() => setShowPreview(true)}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {t.previewPdf}
        </button>
      </div>
    </div>
  );
}
