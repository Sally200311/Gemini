import { Asset, Transaction } from '../types';
import { MOCK_ASSETS, MOCK_TRANSACTIONS } from '../constants';

// Key for LocalStorage
const ASSETS_KEY = 'gemini_wealth_assets';
const TRANSACTIONS_KEY = 'gemini_wealth_transactions';

// 在此專案中，為了確保預覽環境穩定性，即使是"Real Mode"也優先使用 LocalStorage 進行使用者資料存取。
// 真正的 Firebase 整合通常需要複雜的 Config 物件，這在單檔預覽中容易出錯。
// 因此我們模擬 Firestore 的 CRUD 行為。

export const getAssets = (): Asset[] => {
  const stored = localStorage.getItem(ASSETS_KEY);
  if (!stored) {
    // 第一次載入寫入預設資料
    localStorage.setItem(ASSETS_KEY, JSON.stringify(MOCK_ASSETS));
    return MOCK_ASSETS;
  }
  return JSON.parse(stored);
};

export const saveAsset = (asset: Asset) => {
  const assets = getAssets();
  const existingIndex = assets.findIndex(a => a.id === asset.id);
  
  if (existingIndex >= 0) {
    assets[existingIndex] = asset;
  } else {
    assets.push(asset);
  }
  
  localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
  return assets;
};

export const deleteAsset = (id: string) => {
    let assets = getAssets();
    assets = assets.filter(a => a.id !== id);
    localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
    return assets;
}

export const getTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(TRANSACTIONS_KEY);
  if (!stored) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(MOCK_TRANSACTIONS));
    return MOCK_TRANSACTIONS;
  }
  return JSON.parse(stored);
};

export const addTransaction = (transaction: Transaction) => {
  const txs = getTransactions();
  txs.unshift(transaction); // Add to top
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
  return txs;
};
