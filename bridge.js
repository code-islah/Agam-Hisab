const DB_VERSION = 1;
const STORE_NAME = "shopData";

function openDB(param) {
  return new Promise((resolve, reject) => {
    
    function getDBName() {
      const row = localStorage.getItem('login');
      if (!row) {
       return null;
      }
      const login = JSON.parse(row);
      return `shopDB_${login.email}`;
    }
    
    const DB_NAME = getDBName();
    if (!DB_NAME) {
      reject("No login found!");
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id"
        });
      }
    }

    request.onsuccess = () => {
      resolve(request.result);
    }

    request.onerror = () => {
      reject(request.error);
    }
  })
}

async function saveShopData(data) {
  const login = getLogin();
  if (!login) {
    return;
  }

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");

    const store = tx.objectStore(STORE_NAME);

    store.put({
      id: "main",
      value: data
    });

    tx.oncomplete = () => {
      resolve(true);
    }
    tx.onerror = () => {
      reject(tx.error);
    }
  })
}


async function loadShopData() {
  const login = getLogin();
  if (!login) {
    return;
  }

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const request = store.get("main");

    request.onsuccess = () => {
      resolve(request.result?.value || null)
    }

    request.onerror = () => {
      reject(request.error)
    }
  });
}