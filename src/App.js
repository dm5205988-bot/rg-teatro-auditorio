import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MapaVenta from './pages/MapaVenta';
import AdminProfile from './pages/AdminProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/venta/:eventoId" element={<MapaVenta />} />
        <Route path="/admin" element={<AdminProfile />} />
      </Routes>
    </Router>
  );
}

export default App;