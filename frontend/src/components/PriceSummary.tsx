import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface PriceSummaryProps {
  rows: Array<{
    price: number;
    quantity: number;
    isSubheader?: boolean;
  }>;
}

const VAT_RATE = 0.17; // 17% VAT in Israel

const translations = {
  he: {
    subtotal: 'סה״כ לפני מע״מ',
    vat: 'מע״מ (17%)',
    total: 'סה״כ כולל מע״מ',
    currency: '₪',
  },
  en: {
    subtotal: 'Subtotal',
    vat: 'VAT (17%)',
    total: 'Total (inc. VAT)',
    currency: '$',
  },
} as const;

const formatNumber = (num: number): string => {
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const PriceSummary: React.FC<PriceSummaryProps> = ({ rows }) => {
  const { language } = useLanguage();
  const t = translations[language];
  const isHebrew = language === 'he';

  const subtotal = rows.reduce((sum, row) => {
    if (!row.isSubheader) {
      return sum + (row.price * row.quantity);
    }
    return sum;
  }, 0);

  const vatAmount = subtotal * VAT_RATE;
  const total = subtotal + vatAmount;

  return (
    <div 
      className="mt-6 border-t border-gray-200 pt-4 flex justify-center" 
      dir={isHebrew ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-md">
        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t.subtotal}</span>
            <div className={`flex items-center ${isHebrew ? 'mr-2' : 'ml-2'}`}>
              <span className={`text-gray-600 ${isHebrew ? 'ml-1' : 'mr-1'}`}>{t.currency}</span>
              <span className="font-medium text-lg">{formatNumber(subtotal)}</span>
            </div>
          </div>

          {/* VAT */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t.vat}</span>
            <div className={`flex items-center ${isHebrew ? 'mr-2' : 'ml-2'}`}>
              <span className={`text-gray-600 ${isHebrew ? 'ml-1' : 'mr-1'}`}>{t.currency}</span>
              <span className="font-medium text-lg">{formatNumber(vatAmount)}</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="text-gray-800 font-semibold">{t.total}</span>
            <div className={`flex items-center ${isHebrew ? 'mr-2' : 'ml-2'}`}>
              <span className={`text-gray-800 ${isHebrew ? 'ml-1' : 'mr-1'}`}>{t.currency}</span>
              <span className="font-bold text-xl">{formatNumber(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
