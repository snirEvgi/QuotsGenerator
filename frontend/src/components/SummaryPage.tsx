import { useLanguage } from '../contexts/LanguageContext';
import { useEffect, useState } from 'react';
import EditableTable from './EditableTable';
import { TermsAndConditions } from './TermsAndConditions';

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
  },
  en: {
    title: 'Price Quote Summary',
    companyDetails: 'Company Details',
    companyName: 'Company Name',
    companyId: 'Company ID',
    companyPhone: 'Phone',
    customerName: 'Customer Name',
    downloadPdf: 'Download PDF',
  },
};

export default function SummaryPage({ companyInfo }: SummaryPageProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    const savedLogo = localStorage.getItem('companyLogo');
    if (savedLogo) {
      setLogo(savedLogo);
    }
  }, []);

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    console.log('Downloading PDF...');
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        {logo && (
          <img
            src={logo}
            alt="Company Logo"
            className="max-h-24 object-contain"
          />
        )}
        <h1 className="text-3xl font-bold text-blue-600">
          {t.title}
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {t.companyDetails}
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">{t.companyName}</p>
            <p className="font-medium">{companyInfo.companyName}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">{t.companyId}</p>
            <p className="font-medium">{companyInfo.companyId}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">{t.companyPhone}</p>
            <p className="font-medium">{companyInfo.companyPhone}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">{t.customerName}</p>
            <p className="font-medium">{companyInfo.customerName}</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <EditableTable />
      </div>

      {/* Terms Section */}
      <div className="mt-12 bg-gray-50">
        <TermsAndConditions />
      </div>

      {/* Download Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {t.downloadPdf}
        </button>
      </div>
    </div>
  );
}
