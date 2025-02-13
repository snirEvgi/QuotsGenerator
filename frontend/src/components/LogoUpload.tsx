import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

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
  },
};

export default function LogoUpload() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];

  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

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
        localStorage.setItem('companyLogo', base64String);
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

  const handleSubmit = () => {
    navigate('/summary');
  };

  const handleSkip = () => {
    localStorage.removeItem('companyLogo');
    navigate('/summary');
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">
        {t.title}
      </h1>

      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center mb-6
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${preview ? 'border-green-500' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept="image/png,image/jpeg,image/jpg"
        />

        {preview ? (
          <div className="flex flex-col items-center">
            <img
              src={preview}
              alt="Logo preview"
              className="max-w-xs max-h-48 object-contain mb-4"
            />
            <p className="text-green-600">{t.uploadText}</p>
          </div>
        ) : (
          <div className="py-12">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-4 text-gray-600">
              {t.dragText} <span className="text-blue-500">{t.clickText}</span>
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center mb-4">{error}</p>
      )}

      <div className="flex justify-center space-x-4 rtl:space-x-reverse">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {t.continue}
        </button>
        <button
          onClick={handleSkip}
          className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
        >
          {t.skip}
        </button>
      </div>
    </div>
  );
}
