import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import LoginPage from './pages/LoginPage';
import Output from './pages/Output';
import NotFound from './pages/NotFound';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import KeywordRules from './pages/KeywordRules';
import SummaryStats from './pages/SummaryStats';
import { AuthProvider } from './components/AuthProvider';
import './App.css';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Index />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/keyword-rules" element={<KeywordRules />} />
          <Route path="/summary" element={<SummaryStats />} />
          <Route path="/output" element={<Output />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}