import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
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

interface TableRow {
  id: string;
  service: string;
  quantity: number;
  price: number;
}

interface TableHeader {
  id: string;
  label: string;
  isVisible: boolean;
}

const translations = {
  he: {
    services: 'שירותים',
    quantity: 'כמות',
    price: 'מחיר',
    addRow: 'הוסף שורה',
    addColumn: 'הוסף עמודה',
    product: 'מוצר',
    newColumn: 'עמודה חדשה',
    togglePrice: 'הצג/הסתר מחירים',
  },
  en: {
    services: 'Services',
    quantity: 'Quantity',
    price: 'Price',
    addRow: 'Add Row',
    addColumn: 'Add Column',
    product: 'Product',
    newColumn: 'New Column',
    togglePrice: 'Toggle Price',
  },
};

const SortableRow = ({ row, headers, onUpdate, showPrice }: any) => {
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

  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {headers.map((header: TableHeader) => {
        if (!header.isVisible) return null;
        if (header.id === 'price' && !showPrice) return null;
        
        return (
          <td key={header.id} className="border p-2">
            <input
              type={header.id === 'quantity' || header.id === 'price' ? 'number' : 'text'}
              value={row[header.id]}
              onChange={(e) => onUpdate(row.id, header.id, e.target.value)}
              className="w-full bg-transparent focus:outline-none"
              min={0}
            />
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

  const [headers, setHeaders] = useState<TableHeader[]>([
    { id: 'service', label: t.services, isVisible: true },
    { id: 'quantity', label: t.quantity, isVisible: true },
    { id: 'price', label: t.price, isVisible: true },
  ]);

  const [rows, setRows] = useState<TableRow[]>([
    { id: '1', service: t.product + ' 1', quantity: 1, price: 0 },
    { id: '2', service: t.product + ' 2', quantity: 1, price: 0 },
    { id: '3', service: t.product + ' 3', quantity: 1, price: 0 },
    { id: '4', service: t.product + ' 4', quantity: 1, price: 0 },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setRows((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
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
      service: `${t.product} ${newId}`,
      quantity: 1,
      price: 0
    }]);
  };

  const addColumn = () => {
    const newId = `custom${headers.length}`;
    setHeaders([...headers, {
      id: newId,
      label: `${t.newColumn} ${headers.length}`,
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

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between mb-4">
        <div className="space-x-2 rtl:space-x-reverse">
          <button
            onClick={addRow}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {t.addRow}
          </button>
          <button
            onClick={addColumn}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            {t.addColumn}
          </button>
        </div>
        <button
          onClick={togglePriceVisibility}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
        >
          {t.togglePrice}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {headers.map(header => (
                header.isVisible && (header.id !== 'price' || showPrice) && (
                  <th key={header.id} className="border p-2 bg-gray-50 font-semibold">
                    {header.label}
                  </th>
                )
              ))}
            </tr>
          </thead>
          <tbody>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={rows}
                strategy={verticalListSortingStrategy}
              >
                {rows.map((row) => (
                  <SortableRow
                    key={row.id}
                    row={row}
                    headers={headers}
                    onUpdate={handleRowUpdate}
                    showPrice={showPrice}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </tbody>
        </table>
      </div>
    </div>
  );
}
