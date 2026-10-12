import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, Link } from 'react-router-dom';
import { DemoProvider } from './domain/provider';
import { Shell } from './components/Shell';
import { Desk } from './pages/Desk';
import { Support } from './pages/Support';
import { Device } from './pages/Device';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><DemoProvider><Routes><Route element={<Shell />}><Route index element={<Navigate to="/desk" replace />} /><Route path="desk" element={<Desk />} /><Route path="support" element={<Support />} /><Route path="devices/:id" element={<Device />} /><Route path="*" element={<div className="not-found"><h1>这个页面还不存在</h1><p>可以从工作台继续体验售后通。</p><Link className="button primary" to="/desk">返回工作台</Link></div>} /></Route></Routes></DemoProvider></BrowserRouter></React.StrictMode>);
