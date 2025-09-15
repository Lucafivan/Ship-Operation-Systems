import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import NotFoundPage from './pages/NotFound';
import ProtectedRoute from './auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout'

function App() {
  return (
    // Bungkus semua rute dengan UIProvider
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* Public route */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected route */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
          </Route>
        </Route>

        {/* Rute untuk halaman yang tidak ditemukan */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;