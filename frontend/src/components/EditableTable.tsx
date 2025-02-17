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
    custom: string;
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
      custom: 'הכנס כותרת'
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
      custom: 'Enter title'
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
              placeholder={header.id.startsWith('custom') ? t.placeholder.custom : t.placeholder[header.id]}
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

interface EditableTableProps {
  onDataChange?: (rows: TableRow[]) => void;
  data?: TableRow[];
}

export default function EditableTable({ onDataChange, data }: EditableTableProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [showPrice, setShowPrice] = useState(true);

  const [headers, setHeaders] = useState<TableHeader[]>([
    { id: 'service', label: t.services, isVisible: true },
    { id: 'quantity', label: t.quantity, isVisible: true },
    { id: 'price', label: t.price, isVisible: true },
  ]);
  
  const [rows, setRows] = useState<TableRow[]>(data || [
    { id: '1', service: '', quantity: 0, price: 0 },
    { id: '2', service: '', quantity: 0, price: 0 },
    { id: '3', service: '', quantity: 0, price: 0 },
    { id: '4', service: '', quantity: 0, price: 0 },
    { id: '5', service: '', quantity: 0, price: 0 },
  ]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange(rows);
    }
  }, [rows, onDataChange]);

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

    const newId = `custom${headers.length - 2}`; // -2 because we start with 3 default columns
    const priceHeader = headers.find(h => h.id === 'price');
    const newHeaders = headers.filter(h => h.id !== 'price');
    
    setHeaders([
      ...newHeaders,
      {
        id: newId,
        label: '',
        isVisible: true
      },
      priceHeader!, // Add price header at the end
    ]);
    
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
    <div className="space-y-4">
      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left side - Price Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              {t.togglePrice}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={() => setShowPrice(!showPrice)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Center - Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={addRow}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              {t.addService}
            </button>
            <button
              onClick={addSubheaderRow}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16" />
              </svg>
              {t.addSubheader}
            </button>
            {headers.length < 5 && (
              <button
                onClick={addColumn}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                {t.addColumn}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="min-h-[400px] bg-white rounded-lg shadow-lg p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {headers.map((header) => (
                    header.isVisible && (!header.id.includes('price') || showPrice) && (
                      <th key={header.id} className="border p-3 bg-gray-50 text-center relative group">
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="text"
                            value={header.label}
                            onChange={(e) => updateHeaderLabel(header.id, e.target.value)}
                            className="bg-transparent w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-200 rounded"
                            placeholder={header.id.startsWith('custom') ? t.placeholder.custom : t[header.id]}
                            dir={language === 'he' ? 'rtl' : 'ltr'}
                          />
                          {header.id.startsWith('custom') && (
                            <button
                              onClick={() => deleteColumn(header.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 focus:opacity-100"
                              title={t.deleteColumn}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </th>
                    )
                  ))}
                </tr>
              </thead>
              <tbody>
                <SortableContext
                  items={rows.map(row => row.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {rows.map((row) => (
                    <SortableRow
                      key={row.id}
                      row={row}
                      headers={headers}
                      onUpdate={handleRowUpdate}
                      showPrice={showPrice}
                      onDeleteColumn={deleteColumn}
                      onDeleteRow={deleteRow}
                      language={language}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
