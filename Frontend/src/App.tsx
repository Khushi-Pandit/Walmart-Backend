// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Products from './pages/Products';
// import Test from './pages/Test'; // 👈 ADD THIS LINE
import OlaMapPlayground from './components/OlaMapPlayground'; // 👈 ADD THIS LINE
import Direction from './pages/Direction'; // 👈 ADD THIS LINE

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/products" element={<Products />} />
        
        <Route path="/direction" element={<Direction />} />
      </Routes>
    </Router>
  );
}

export default App;
