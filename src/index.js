// src/index.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ResultsPage from './ResultsPage'; // ⬅️ new
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/results" element={<ResultsPage />} />
    </Routes>
  </Router>
);
