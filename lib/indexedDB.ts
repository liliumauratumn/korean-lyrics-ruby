// ファイルパス: lib/indexedDB.ts
// 説明: IndexedDB操作（Safari対応版）

const DB_NAME = 'KoreanLyricsDB';
const DB_VERSION = 1;
const STORE_NAME = 'lyrics';
const LOCALSTORAGE_KEY = 'koreanLyrics';

export interface SavedLyric {
  id: number;
  title: string;
  input: string;
  converted: any[];
  date: string;
}

// IndexedDBが使えるかチェック
function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && !!indexedDB;
  } catch {
    return false;
  }
}

// データベース初期化
export function initDB(): Promise<IDBDatabase | null> {
  if (!isIndexedDBAvailable()) {
    console.warn('⚠️ IndexedDB利用不可、LocalStorageを使用');
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDBエラー、LocalStorageにフォールバック');
      resolve(null);
    };
    
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

// 全データ取得
export async function getAllLyrics(): Promise<SavedLyric[]> {
  const db = await initDB();
  
  // IndexedDB使えない場合はLocalStorage
  if (!db) {
    const data = localStorage.getItem(LOCALSTORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => {
      // エラー時はLocalStorage
      const data = localStorage.getItem(LOCALSTORAGE_KEY);
      resolve(data ? JSON.parse(data) : []);
    };
  });
}

// データ保存
export async function saveLyric(lyric: SavedLyric): Promise<void> {
  const db = await initDB();
  
  // IndexedDB使えない場合はLocalStorage
  if (!db) {
    const data = await getAllLyrics();
    const updated = data.filter(l => l.id !== lyric.id);
    updated.push(lyric);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updated));
    return;
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(lyric);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// データ削除
export async function deleteLyric(id: number): Promise<void> {
  const db = await initDB();
  
  // IndexedDB使えない場合はLocalStorage
  if (!db) {
    const data = await getAllLyrics();
    const updated = data.filter(l => l.id !== id);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updated));
    return;
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// LocalStorageからIndexedDBへ移行（可能な場合のみ）
export async function migrateFromLocalStorage(): Promise<void> {
  const db = await initDB();
  if (!db) {
    console.log('✅ LocalStorageモードで動作中');
    return;
  }

  const localData = localStorage.getItem(LOCALSTORAGE_KEY);
  if (!localData) return;

  try {
    const lyrics: SavedLyric[] = JSON.parse(localData);
    for (const lyric of lyrics) {
      await saveLyric(lyric);
    }
    localStorage.removeItem(LOCALSTORAGE_KEY);
    console.log('✅ LocalStorage → IndexedDB 移行完了');
  } catch (error) {
    console.error('❌ 移行エラー:', error);
  }
}