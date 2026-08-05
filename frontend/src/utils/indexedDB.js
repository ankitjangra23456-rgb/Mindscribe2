const DB_NAME = 'MindscribePWA_DB';
const DB_VERSION = 1;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('exam_papers')) {
        db.createObjectStore('exam_papers', { keyPath: 'exam_id' });
      }
      if (!db.objectStoreNames.contains('offline_answers')) {
        db.createObjectStore('offline_answers', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveExamOffline = async (examId, examData) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('exam_papers', 'readwrite');
    const store = tx.objectStore('exam_papers');
    store.put({ exam_id: examId, data: examData, cached_at: new Date().toISOString() });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

export const getOfflineExam = async (examId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('exam_papers', 'readonly');
    const store = tx.objectStore('exam_papers');
    const request = store.get(examId);
    request.onsuccess = () => resolve(request.result?.data || null);
    request.onerror = () => reject(request.error);
  });
};

export const queueAnswerOffline = async (attemptId, payload) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_answers', 'readwrite');
    const store = tx.objectStore('offline_answers');
    store.add({ attempt_id: attemptId, payload, timestamp: new Date().toISOString() });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

export const getOfflineQueue = async (attemptId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_answers', 'readonly');
    const store = tx.objectStore('offline_answers');
    const request = store.getAll();
    request.onsuccess = () => {
      const items = request.result.filter(item => item.attempt_id === attemptId);
      resolve(items);
    };
    request.onerror = () => reject(request.error);
  });
};

export const clearOfflineQueue = async (attemptId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_answers', 'readwrite');
    const store = tx.objectStore('offline_answers');
    store.clear();
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};
