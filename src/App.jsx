import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import Products from './pages/Products';
import HistoricalData from './pages/HistoricalData';
import Settings from './pages/Settings';
import { useStore } from './store/useStore';

function App() {
  const { initData } = useStore();

  useEffect(() => {
    initData();
  }, [initData]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="products" element={<Products />} />
          <Route path="history" element={<HistoricalData />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
