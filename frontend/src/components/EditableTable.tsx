import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLanguage } from '../contexts/LanguageContext';
import { PriceSummary } from './PriceSummary';
import { TermsAndConditions } from './TermsAndConditions';

interface TableRow {
  id: string;
  service: string;
  quantity: number;
  price: number;
  isSubheader?: boolean;
  [key: string]: any;
}

interface TableHeader {
  id: string;
  label: string;
  isVisible: boolean;
}

type Language = 'he' | 'en';

const translations: Record<Language, {
  services: string;
  quantity: string;
  price: string;
  addService: string;
  addColumn: string;
  deleteColumn: string;
  deleteRow: string;
  togglePrice: string;
  addSubheader: string;
  currencySymbol: string;
  subheaderPlaceholder: string;
  placeholder: {
    service: string;
    quantity: string;
    price: string;
  };
}> = {
  he: {
    services: 'שירותים',
    quantity: 'כמות',
    price: 'מחיר ₪',
    addService: 'הוסף שירות',
    addColumn: 'הוסף עמודה',
    deleteColumn: 'מחק עמודה',
    deleteRow: 'מחק שורה',
    togglePrice: 'הצג/הסתר מחיר',
    addSubheader: 'הוסף עמודת כותרת',
    currencySymbol: '₪',
    subheaderPlaceholder: 'הכנס כותרת משנה',
    placeholder: {
      service: 'לדוגמה: תיקון מזגן',
      quantity: 'לדוגמה: 1',
      price: 'לדוגמה: 100',
    }
  },
  en: {
    services: 'Services',
    quantity: 'Quantity',
    price: 'Price $',
    addService: 'Add Service',
    addColumn: 'Add Column',
    deleteColumn: 'Delete Column',
    deleteRow: 'Delete Row',
    togglePrice: 'Toggle Price',
    addSubheader: 'Add Subheader',
    currencySymbol: '$',
    subheaderPlaceholder: 'Enter Subheader Text',
    placeholder: {
      service: 'e.g., AC Repair',
      quantity: 'e.g., 1',
      price: 'e.g., 100',
    }
  }
};

interface SortableRowProps {
  row: TableRow;
  headers: TableHeader[];
  onUpdate: (rowId: string, field: string, value: string) => void;
  showPrice: boolean;
  onDeleteColumn: (headerId: string) => void;
  onDeleteRow: (rowId: string) => void;
  language: Language;
}

const SortableRow = ({ row, headers, onUpdate, showPrice, onDeleteColumn, onDeleteRow, language }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isDraggable, setIsDraggable] = useState(false);
  const t = translations[language];

  const handleDoubleClick = () => {
    setIsDraggable(true);
  };

  const handleBlur = () => {
    setIsDraggable(false);
  };

  if (row.isSubheader) {
    return (
      <tr
        ref={setNodeRef}
        style={style}
        className="relative group"
        {...attributes}
      >
        <td
          colSpan={headers.filter(h => h.isVisible).length}
          className="border p-2 bg-gray-50 relative"
        >
          <div className="flex items-center">
            <div {...listeners} className={`cursor-grab px-2 ${language === 'he' ? 'order-last' : 'order-first'}`}>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
              </svg>
            </div>
            <input
              type="text"
              value={row.service || ''}
              onChange={(e) => onUpdate(row.id, 'service', e.target.value)}
              className="flex-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-200 rounded px-3 py-1 text-lg font-semibold text-center"
              placeholder={t.subheaderPlaceholder}
              dir={language === 'he' ? 'rtl' : 'ltr'}
            />
            <button
              onClick={() => onDeleteRow(row.id)}
              className={`opacity-0 rounded-lg group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-gray-600 focus:opacity-100 p-1 ${language === 'he' ? 'order-first' : 'order-last'}`}
              title={t.deleteRow}
              dir={language === 'he' ? 'rtl' : 'ltr'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    );
  }

  // Sort headers to ensure price is last
  const sortedHeaders = [...headers].sort((a, b) => {
    if (a.id === 'price') return 1;
    if (b.id === 'price') return -1;
    return 0;
  });

  return (
    <tr 
      ref={setNodeRef} 
      style={style} 
      {...(isDraggable ? { ...attributes, ...listeners } : {})}
      className="hover:bg-blue-50 transition-all duration-200 hover:scale-[1.01] group relative"
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      tabIndex={0}
    >
      {sortedHeaders.map((header: TableHeader, index) => {
        if (!header.isVisible) return null;
        if (header.id === 'price' && !showPrice) return null;
        
        const isFirstColumn = index === 0;
        const isLastColumn = header.id === 'price';
        const columnClass = `
          border p-3 min-w-[250px]  max-w-[400px] relative text-center
          ${isFirstColumn ? 'sticky left-0 z-10 bg-white' : ''}
          ${isLastColumn ? 'sticky right-0 z-10 bg-white' : ''}
          ${isFirstColumn && isDraggable ? 'cursor-grab' : ''}
        `;
        
        return (
          <td 
            key={header.id} 
            className={columnClass}
            style={{
              position: isFirstColumn || isLastColumn ? 'sticky' : 'static',
              left: isFirstColumn ? 0 : 'auto',
              right: isLastColumn ? 0 : 'auto'
            }}
          >
            {index === 0 && (
              <div className="rounded-lg group">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRow(row.id);
                }}
                className="opacity-0 rounded-lg group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-gray-600 focus:opacity-100 p-1 absolute right-4 top-5"
                title={t.deleteRow}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              </div>
            )}
            <input
              type={header.id === 'quantity' || header.id === 'price' ? 'number' : 'text'}
              value={row[header.id]}
              onChange={(e) => onUpdate(row.id, header.id, e.target.value)}
              className={`
                bg-transparent focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 rounded py-1.5 text-center
                ${header.id === 'price' ? 'w-[85%] pl-2 pr-6' : 'w-full px-2'}
              `}
              min={0}
              placeholder={t.placeholder[header.id]}
              style={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            />
            {header.id === 'price' && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 font-bold text-base">
                {t.currencySymbol}
              </span>
            )}
          </td>
        );
      })}
    </tr>
  );
};

export default function EditableTable() {
  const { language } = useLanguage();
  const t = translations[language];
  const [showPrice, setShowPrice] = useState(true);

  const [headers, setHeaders] = useState<TableHeader[]>(() => {
    const savedHeaders = localStorage.getItem('tableHeaders');
    return savedHeaders ? JSON.parse(savedHeaders) : [
      { id: 'service', label: t.services, isVisible: true },
      { id: 'quantity', label: t.quantity, isVisible: true },
      { id: 'price', label: t.price, isVisible: true },
    ];
  });

  const [rows, setRows] = useState<TableRow[]>(() => {
    const savedRows = localStorage.getItem('tableRows');
    return savedRows ? JSON.parse(savedRows) : [
      { id: '1', service: '', quantity: 1, price: 0 },
      { id: '2', service: '', quantity: 1, price: 0 },
      { id: '3', service: '', quantity: 1, price: 0 },
      { id: '4', service: '', quantity: 1, price: 0 },
    ];
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('tableHeaders', JSON.stringify(headers));
    localStorage.setItem('tableRows', JSON.stringify(rows));
  }, [headers, rows]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setRows((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRowUpdate = (rowId: string, field: string, value: string) => {
    setRows(rows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          [field]: field === 'quantity' || field === 'price' ? Number(value) : value
        };
      }
      return row;
    }));
  };

  const addRow = () => {
    const newId = (rows.length + 1).toString();
    setRows([...rows, {
      id: newId,
      service: '',
      quantity: 0,
      price: 0
    }]);
  };

  const addSubheaderRow = () => {
    const newId = String(rows.length + 1);
    setRows([...rows, {
      id: newId,
      service: '',
      quantity: 0,
      price: 0,
      isSubheader: true
    }]);
  };

  const addColumn = () => {
    // Check if we already have 5 columns (including the default ones)
    if (headers.length >= 5) {
      return; // Don't add more columns if we already have 5
    }

    const newId = `custom${headers.length}`;
    setHeaders([...headers, {
      id: newId,
      label: '',
      isVisible: true
    }]);
    
    setRows(rows.map(row => ({
      ...row,
      [newId]: ''
    })));
  };

  const togglePriceVisibility = () => {
    setShowPrice(!showPrice);
  };

  const deleteRow = (rowId: string) => {
    setRows(rows.filter(row => row.id !== rowId));
  };

  const updateHeaderLabel = (headerId: string, newLabel: string) => {
    setHeaders(headers.map(header => 
      header.id === headerId ? { ...header, label: newLabel } : header
    ));
  };

  const deleteColumn = (headerId: string) => {
    if (headerId === 'service' || headerId === 'quantity' || headerId === 'price') {
      return; // Prevent deletion of essential columns
    }
    setHeaders(headers.filter(header => header.id !== headerId));
    setRows(rows.map(row => {
      const newRow = { ...row };
      delete (newRow as any)[headerId];
      return newRow as TableRow;
    }));
  };

  // Sort headers to ensure price is last
  const sortedHeaders = [...headers].sort((a, b) => {
    if (a.id === 'price') return 1;
    if (b.id === 'price') return -1;
    return 0;
  });

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="flex justify-between mb-6">
        <div className="space-x-3 rtl:space-x-reverse">
          <button
            onClick={addRow}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm min-w-[140px] text-base font-medium"
          >
            {t.addService}
          </button>
          <button
            onClick={addSubheaderRow}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm min-w-[140px] text-base font-medium"
          >
            {t.addSubheader}
          </button>
          <button
            onClick={addColumn}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm min-w-[140px] text-base font-medium"
          >
            {t.addColumn}
          </button>
        </div>
        <button
          onClick={togglePriceVisibility}
          className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-all duration-200 shadow-sm min-w-[140px] text-base font-medium"
        >
          {t.togglePrice}
        </button>
      </div>

      <div className="relative overflow-x-auto max-w-full">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className="relative">
              {sortedHeaders?.map((header, index) => {
                if (!header.isVisible || (header.id === "price" && !showPrice)) {
                  return null;
                }

                const isFirstColumn = index === 0;
                const isLastColumn = header.id === 'price';
                const columnWidth = header.id === 'service' ? 'w-[200px]' : 'w-[120px]';

                return (
                  <th
                    key={header.id}
                    className={`
                      border p-3 bg-gray-50 text-center relative
                      ${columnWidth}
                      ${isFirstColumn ? 'sticky left-0 z-10' : ''}
                      ${isLastColumn ? 'sticky right-0 z-10' : ''}
                    `}
                    style={{
                      position: isFirstColumn || isLastColumn ? 'sticky' : 'static',
                      left: isFirstColumn ? 0 : 'auto',
                      right: isLastColumn ? 0 : 'auto',
                      backgroundColor: isFirstColumn || isLastColumn ? '#f9fafb' : ''
                    }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <input
                        type="text"
                        value={header.label}
                        onChange={(e) => updateHeaderLabel(header.id, e.target.value)}
                        className="bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1 text-center w-full"
                        placeholder={t[header.id as keyof typeof t]}
                      />
                      {header.id !== 'service' && header.id !== 'quantity' && header.id !== 'price' && (
                        <button
                          onClick={() => deleteColumn(header.id)}
                          className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          title={t.deleteColumn}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={rows.map(row => row.id)}
                strategy={verticalListSortingStrategy}
              >
                {rows.map((row) => (
                  <SortableRow
                    key={row.id}
                    row={row}
                    headers={sortedHeaders}
                    onUpdate={handleRowUpdate}
                    showPrice={showPrice}
                    onDeleteColumn={deleteColumn}
                    onDeleteRow={deleteRow}
                    language={language}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </tbody>
        </table>
      </div>

      {/* Price Summary */}
      {showPrice && (
        <PriceSummary
          rows={rows.map(row => ({
            price: parseFloat(row.price) || 0,
            quantity: parseFloat(row.quantity) || 0,
            isSubheader: row.isSubheader
          }))}
        />
      )}

      <TermsAndConditions />
    </div>
  );
}
