import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ListItem {
  id: string;
  content: string;
}

const translations = {
  en: {
    title: 'Remarks',
    addItem: 'Add Remark',
    placeholder: 'Enter new remark...',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete'
  },
  he: {
    title: 'הערות',
    addItem: 'הוסף הערה',
    placeholder: 'הכנס הערה חדשה...',
    save: 'שמור',
    edit: 'ערוך',
    delete: 'מחק'
  }
} as const;

export const Remarks: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const isHebrew = language === 'he';

  const [items, setItems] = useState<ListItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load items from localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem('remarksItems');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  // Save items to localStorage
  useEffect(() => {
    localStorage.setItem('remarksItems', JSON.stringify(items));
  }, [items]);

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    setItems([...items, { id: Date.now().toString(), content: newItem.trim() }]);
    setNewItem('');
  };

  const handleUpdateItem = (id: string, content: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, content } : item
    ));
    setEditingId(null);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div 
      className="bg-white py-8 px-4"
      dir={isHebrew ? 'rtl' : 'ltr'}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t.title}</h2>
        </div>

        {/* Add new item */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            placeholder={t.placeholder}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            dir={isHebrew ? 'rtl' : 'ltr'}
          />
          <button
            onClick={handleAddItem}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            {t.addItem}
          </button>
        </div>

        {/* List items */}
        <div className="space-y-2">
          <ol className="list-decimal list-inside space-y-2">
            {items.map(item => (
              <li key={item.id} className="group flex items-center gap-2">
                {editingId === item.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={item.content}
                      onChange={(e) => handleUpdateItem(item.id, e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      autoFocus
                      onBlur={() => setEditingId(null)}
                      onKeyPress={(e) => e.key === 'Enter' && setEditingId(null)}
                      dir={isHebrew ? 'rtl' : 'ltr'}
                    />
                  </div>
                ) : (
                  <>
                    <span className="flex-1">{item.content}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingId(item.id)}
                        className="text-gray-500 hover:text-gray-700 px-2"
                      >
                        {t.edit}
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        {t.delete}
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};
