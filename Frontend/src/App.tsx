// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Direction from './pages/Direction'; 
import Layout from './pages/layout';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />        
        <Route path="/direction" element={<Direction />} />
        <Route path="/layout" element={<Layout/>} />
        <Route path="/Dashboard" element={<Dashboard/>} />
      </Routes>
    </Router>
  );
}

export default App;
