import { db } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';

export interface Summary {
  id: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  companyInfo: {
    companyName: string;
    companyId: string;
    companyPhone: string;
    customerName: string;
  };
  logo: string | null;
  terms: string;
  remarks: string;
  tableData: any[];
}

export const createSummary = async (userId: string, data: Omit<Summary, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
  const summariesRef = collection(db, 'summaries');
  const newSummaryRef = doc(summariesRef);
  const now = Timestamp.now();

  const summary: Summary = {
    id: newSummaryRef.id,
    userId,
    createdAt: now,
    updatedAt: now,
    ...data,
  };

  await setDoc(newSummaryRef, summary);
  return summary;
};

export const updateSummary = async (summaryId: string, data: Partial<Omit<Summary, 'id' | 'userId' | 'createdAt'>>) => {
  const summaryRef = doc(db, 'summaries', summaryId);
  await updateDoc(summaryRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const getSummary = async (summaryId: string) => {
  try {
    console.log('Getting summary for id:', summaryId);
    const summaryRef = doc(db, 'summaries', summaryId);
    const summarySnap = await getDoc(summaryRef);
    
    if (!summarySnap.exists()) {
      console.log('Summary does not exist');
      return null;
    }

    const data = summarySnap.data();
    console.log('Raw summary data:', data);

    const summary = {
      ...data,
      id: summarySnap.id,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      companyInfo: {
        companyName: data.companyInfo.companyName || '',
        companyId: data.companyInfo.companyId || '',
        companyPhone: data.companyInfo.companyPhone || '',
        customerName: data.companyInfo.customerName || '',
      },
      logo: data.logo || null,
      terms: data.terms || '',
      remarks: data.remarks || '',
      tableData: data.tableData || [],
    } as Summary;

    console.log('Processed summary:', summary);
    return summary;
  } catch (err) {
    console.error('Error in getSummary:', err);
    throw err;
  }
};

export const getUserSummaries = async (userId: string) => {
  const summariesRef = collection(db, 'summaries');
  const q = query(
    summariesRef,
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  }) as Summary);
};
