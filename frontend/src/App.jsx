import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DialPadPage from './pages/DialPadPage';
import CallLogPage from './pages/CallLogPage';
import AboutPage from './pages/AboutPage';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('caas_token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/dialpad" element={<PrivateRoute><DialPadPage /></PrivateRoute>} />
        <Route path="/calllog" element={<PrivateRoute><CallLogPage /></PrivateRoute>} />
        <Route path="/about" element={<PrivateRoute><AboutPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
