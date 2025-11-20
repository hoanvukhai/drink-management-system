import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; 
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
        <Toaster position="top-right" />
        <App />
    </BrowserRouter>
  </React.StrictMode>,
);