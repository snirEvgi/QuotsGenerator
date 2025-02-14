import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/pdf.css';

interface TableRow {
  id: string;
  service: string;
  quantity: number;
  price: number;
  isSubheader?: boolean;
  [key: string]: any;
}

interface CompanyInfo {
  companyName: string;
  companyId: string;
  companyPhone: string;
  customerName: string;
}

interface PdfPreviewProps {
  companyInfo: CompanyInfo;
  logo: string | null;
  includeTerms: boolean;
  includeRemarks: boolean;
  onBack: () => void;
  tableData: TableRow[];
  terms?: string;
  remarks?: string;
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
    back: 'חזור',
    service: 'שירות',
    quantity: 'כמות',
    price: 'מחיר',
    total: 'סה"כ',
    terms: 'תנאים והגבלות',
    remarks: 'הערות'
  },
  en: {
    title: 'Price Quote Summary',
    companyDetails: 'Company Details',
    companyName: 'Company Name',
    companyId: 'Company ID',
    companyPhone: 'Phone',
    customerName: 'Customer Name',
    downloadPdf: 'Download PDF',
    back: 'Back',
    service: 'Service',
    quantity: 'Quantity',
    price: 'Price',
    total: 'Total',
    terms: 'Terms & Conditions',
    remarks: 'Remarks'
  },
};

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  companyInfo,
  logo,
  includeTerms,
  includeRemarks,
  onBack,
  tableData,
  terms,
  remarks,
}) => {
  const { language } = useLanguage();
  const t = translations[language];
  const isHebrew = language === 'he';
  const pdfRef = useRef<HTMLDivElement>(null);

  const calculateTotal = (row: TableRow) => {
    if (row.isSubheader) return '';
    return row.quantity * row.price;
  };

  const generatePdf = async () => {
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('price-quote.pdf');
  };

  return (
    <div className="pdf-preview">
      <div ref={pdfRef} className="pdf-container" dir={isHebrew ? 'rtl' : 'ltr'}>
        <div className="pdf-content">
          <div className="pdf-header">
            {logo && <img src={logo} alt="Company Logo" style={{ maxHeight: '60px', objectFit: 'contain' }} />}
            <h1 className="text-2xl font-bold">{t.title}</h1>
          </div>

          <div className="pdf-company-details">
            <h2 className="text-xl font-semibold mb-4">{t.companyDetails}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>{t.companyName}:</strong> {companyInfo.companyName}
              </div>
              <div>
                <strong>{t.companyId}:</strong> {companyInfo.companyId}
              </div>
              <div>
                <strong>{t.companyPhone}:</strong> {companyInfo.companyPhone}
              </div>
              <div>
                <strong>{t.customerName}:</strong> {companyInfo.customerName}
              </div>
            </div>
          </div>

          <div className="pdf-table-container">
            <table className="pdf-table">
              <thead>
                <tr>
                  <th>{t.service}</th>
                  <th>{t.quantity}</th>
                  <th>{t.price}</th>
                  <th>{t.total}</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={row.id} className={row.isSubheader ? 'subheader' : ''}>
                    <td className="font-medium">
                      {row.isSubheader ? <strong>{row.service}</strong> : row.service}
                    </td>
                    <td className="text-center">{!row.isSubheader ? row.quantity : ''}</td>
                    <td className="text-center">
                      {!row.isSubheader ? `₪${row.price.toLocaleString()}` : ''}
                    </td>
                    <td className="text-center">
                      {!row.isSubheader ? `₪${calculateTotal(row).toLocaleString()}` : ''}
                    </td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan={3} className="text-right font-bold">{t.total}</td>
                  <td className="text-center font-bold">
                    ₪{tableData
                      .filter(row => !row.isSubheader)
                      .reduce((sum, row) => sum + (row.quantity * row.price), 0)
                      .toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {includeTerms && terms && (
            <div className="pdf-terms mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">{t.terms}</h3>
              <div className="space-y-2">
                {terms.split('\n').map((term, index) => (
                  term.trim() && (
                    <div key={index} className="flex items-start">
                      <p className="text-gray-700 leading-relaxed">{term.trim()}</p>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {includeRemarks && remarks && (
            <div className="pdf-remarks mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">{t.remarks}</h3>
              <div className="space-y-2">
                {remarks.split('\n').map((remark, index) => (
                  remark.trim() && (
                    <div key={index} className="flex items-start">
                      <p className="text-gray-700 leading-relaxed">{remark.trim()}</p>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          <div className="pdf-footer mt-8 pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className={isHebrew ? 'preview-actionshebrew' : 'preview-actions'}>
        <button className="preview-button back-button"  onClick={onBack}>
          {t.back}
        </button>
        <button className="preview-button download-button" onClick={generatePdf}>
          {t.downloadPdf}
        </button>
      </div>
    </div>
  );
};
