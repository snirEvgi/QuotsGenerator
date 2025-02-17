import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const translations = {
  he: {
    title: 'פרטי החברה',
    companyName: 'שם החברה',
    companyId: 'ח.פ',
    companyPhone: 'טלפון החברה',
    customerName: 'שם הלקוח',
    submit: 'המשך',
    required: 'שדה חובה',
    companyIdFormat: 'ח.פ חייב להכיל 9 ספרות',
    phoneFormat: 'מספר טלפון לא תקין',
  },
  en: {
    title: 'Company Details',
    companyName: 'Company Name',
    companyId: 'Company ID',
    companyPhone: 'Company Phone',
    customerName: 'Customer Name',
    submit: 'Continue',
    required: 'Required field',
    companyIdFormat: 'Company ID must be 9 digits',
    phoneFormat: 'Invalid phone number',
  },
};

interface FormErrors {
  companyName?: string;
  companyId?: string;
  companyPhone?: string;
  customerName?: string;
}

export default function QuotesPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];

  const [formData, setFormData] = useState({
    companyName: '',
    companyId: '',
    companyPhone: '',
    customerName: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.companyName) {
      newErrors.companyName = t.required;
    }
    
    if (!formData.companyId) {
      newErrors.companyId = t.required;
    } else if (!/^\d{9}$/.test(formData.companyId)) {
      newErrors.companyId = t.companyIdFormat;
    }
    
    if (!formData.companyPhone) {
      newErrors.companyPhone = t.required;
    } else if (!/^0\d{8,9}$/.test(formData.companyPhone)) {
      newErrors.companyPhone = t.phoneFormat;
    }
    
    if (!formData.customerName) {
      newErrors.customerName = t.required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      localStorage.setItem('companyInfo', JSON.stringify(formData));
      navigate('/logo-upload');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">
        {t.title}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.companyName}
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-md border ${
              errors.companyName ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.companyId}
          </label>
          <input
            type="text"
            name="companyId"
            value={formData.companyId}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-md border ${
              errors.companyId ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.companyId && (
            <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.companyPhone}
          </label>
          <input
            type="tel"
            name="companyPhone"
            value={formData.companyPhone}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-md border ${
              errors.companyPhone ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.companyPhone && (
            <p className="text-red-500 text-sm mt-1">{errors.companyPhone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.customerName}
          </label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-md border ${
              errors.customerName ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.customerName && (
            <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {t.submit}
        </button>
      </form>
    </div>
  );
}
