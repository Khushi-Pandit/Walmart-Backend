// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Direction from './pages/Direction'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />        
        <Route path="/direction" element={<Direction />} />
      </Routes>
    </Router>
  );
}

export default App;
