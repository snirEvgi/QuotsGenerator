import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ListItem {
  id: string;
  content: string;
}

interface Props {
  onChange: (terms: string) => void;
}

const translations = {
  en: {
    title: 'Terms and Conditions',
    addItem: 'Add Item',
    placeholder: 'Enter new item...',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete'
  },
  he: {
    title: 'תנאים והגבלות',
    addItem: 'הוסף פריט',
    placeholder: 'הכנס פריט חדש...',
    save: 'שמור',
    edit: 'ערוך',
    delete: 'מחק'
  }
} as const;

export const TermsAndConditions: React.FC<Props> = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const isHebrew = language === 'he';

  const [items, setItems] = useState<ListItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);


  const handleAddItem = () => {
    if (!newItem.trim()) return;
    const newItemObj = {
      id: Date.now().toString(),
      content: newItem.trim()
    };
    setItems([...items, newItemObj]);
    setNewItem('');
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, content: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, content } : item
    ));
    setEditingId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6"
      dir={isHebrew ? 'rtl' : 'ltr'}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-semibold text-gray-800">{t.title}</h2>
        </div>

        {/* Add new item */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.placeholder}
            className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            dir={isHebrew ? 'rtl' : 'ltr'}
          />
          <button
            onClick={handleAddItem}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {t.addItem}
          </button>
        </div>

        {/* Items list */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="group flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <span className="text-gray-500 mt-1">{index + 1}.</span>
              {editingId === item.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={item.content}
                    onChange={(e) => handleUpdateItem(item.id, e.target.value)}
                    className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md hover:bg-blue-50"
                  >
                    {t.save}
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex items-start justify-between">
                  <p className="text-gray-700">{item.content}</p>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => setEditingId(item.id)}
                      className="text-gray-500 hover:text-blue-600"
                      title={t.edit}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-gray-500 hover:text-red-600"
                      title={t.delete}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
