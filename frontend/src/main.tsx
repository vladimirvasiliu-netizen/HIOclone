import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Orders from './pages/Orders';
import Drivers from './pages/Drivers';
import Fleets from './pages/Fleets';
import RoutingRules from './pages/RoutingRules';
import Settings from './pages/Settings';
import OrderDetails from './pages/OrderDetails';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { applyDarkTheme, readStoredDarkTheme } from './lib/theme';
import './index.css';

// Aplicam tema salvata inainte de randare (fara "flash"), DAR doar daca exista
// o sesiune. Delogat (pagina de login) ramane mereu pe tema deschisa.
const hasSession = Boolean(localStorage.getItem('auth'));
applyDarkTheme(hasSession && readStoredDarkTheme());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Rute protejate: toate impartasesc shell-ul (sidebar + topbar) via Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Overview />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/fleets" element={<Fleets />} />
            <Route path="/rules" element={<RoutingRules />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
