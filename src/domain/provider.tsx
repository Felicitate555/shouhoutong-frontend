import { createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode } from 'react';
import { createSeed } from './seed';
import { reducer } from './store';
import type { Action, DemoState } from './types';

const STORAGE = 'shouhoutong-demo-v1';
function load(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw) {
      const data = JSON.parse(raw) as DemoState;
      if (data.version === 1 && Array.isArray(data.cases) && data.cases.length === 4 && data.cases.every(c => c.id && c.customer && c.product && Array.isArray(c.messages) && Array.isArray(c.evidence) && Array.isArray(c.activity))) return data;
    }
  } catch { /* Corrupt or blocked local storage falls back to the clean demo. */ }
  return createSeed();
}
const Context = createContext<{ state: DemoState; dispatch: Dispatch<Action>; toast: (message: string) => void; storageWarning: boolean } | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [notice, setNotice] = useState('');
  const [storageWarning, setStorageWarning] = useState(false);
  useEffect(() => {
    try { localStorage.setItem(STORAGE, JSON.stringify(state)); setStorageWarning(false); }
    catch { setStorageWarning(true); }
  }, [state]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 4000); return () => clearTimeout(timer); }, [notice]);
  return <Context.Provider value={{ state, dispatch, toast: setNotice, storageWarning }}>{children}<div className={`toast ${notice ? 'visible' : ''}`} role="status" aria-live="polite">{notice}</div></Context.Provider>;
}
export function useDemo() { const value = useContext(Context); if (!value) throw new Error('DemoProvider is required'); return value; }
export const formatTime = (value: string) => new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Shanghai' }).format(new Date(value));
export const formatDate = (value: string) => new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', timeZone: 'Asia/Shanghai' }).format(new Date(value));
