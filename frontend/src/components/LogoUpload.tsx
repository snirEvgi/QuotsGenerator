import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { createSummary } from '../firebase/firestore';

const translations = {
  he: {
    title: 'העלאת לוגו',
    uploadText: 'העלה לוגו',
    dragText: 'גרור ושחרר קובץ כאן או',
    clickText: 'לחץ לבחירת קובץ',
    continue: 'המשך',
    skip: 'דלג',
    error: 'שגיאה בהעלאת הקובץ',
    invalidType: 'סוג קובץ לא חוקי. אנא העלה תמונה בפורמט PNG, JPG, או JPEG',
    maxSize: 'גודל הקובץ חייב להיות קטן מ-2MB',
    authError: 'יש להתחבר כדי להמשיך',
    dataError: 'חסרים פרטי חברה',
  },
  en: {
    title: 'Logo Upload',
    uploadText: 'Upload Logo',
    dragText: 'Drag and drop file here or',
    clickText: 'click to select file',
    continue: 'Continue',
    skip: 'Skip',
    error: 'Error uploading file',
    invalidType: 'Invalid file type. Please upload a PNG, JPG, or JPEG image',
    maxSize: 'File size must be less than 2MB',
    authError: 'Please sign in to continue',
    dataError: 'Missing company information',
  },
};

export default function LogoUpload() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const t = translations[language];

  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      setError(t.invalidType);
      return false;
    }

    if (file.size > maxSize) {
      setError(t.maxSize);
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError(t.authError);
      return;
    }

    const storedInfo = localStorage.getItem('companyInfo');
    if (!storedInfo) {
      setError(t.dataError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const parsedInfo = JSON.parse(storedInfo);
      const newSummary = await createSummary(user.uid, {
        companyInfo: parsedInfo,
        logo: preview,
        terms: '',
        remarks: '',
        tableData: [],
      });

      localStorage.removeItem('companyInfo');
      navigate(`/summary/${newSummary.id}`);
    } catch (err) {
      console.error('Error creating summary:', err);
      setError(t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!user) {
      setError(t.authError);
      return;
    }

    const storedInfo = localStorage.getItem('companyInfo');
    if (!storedInfo) {
      setError(t.dataError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const parsedInfo = JSON.parse(storedInfo);
      const newSummary = await createSummary(user.uid, {
        companyInfo: parsedInfo,
        logo: null,
        terms: '',
        remarks: '',
        tableData: [],
      });

      localStorage.removeItem('companyInfo');
      navigate(`/summary/${newSummary.id}`);
    } catch (err) {
      console.error('Error creating summary:', err);
      setError(t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">
        {t.title}
      </h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${preview ? 'bg-gray-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <img
            src={preview}
            alt="Logo preview"
            className="max-h-48 mx-auto"
          />
        ) : (
          <>
            <p className="text-gray-600 mb-2">{t.dragText}</p>
            <label className="cursor-pointer text-blue-600 hover:text-blue-700">
              {t.clickText}
              <input
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleChange}
              />
            </label>
          </>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={handleSkip}
          className="px-6 py-2 text-gray-600 hover:text-gray-800"
          disabled={isSubmitting}
        >
          {t.skip}
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {t.continue}
        </button>
      </div>
    </div>
  );
}
