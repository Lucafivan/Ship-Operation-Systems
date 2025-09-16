import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import NotFoundPage from './pages/NotFound';
import ProtectedRoute from './auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout'
import Bongkaran from './pages/Bongkaran';
import Pengajuan from './pages/Pengajuan';
import Acc_Pengajuan from './pages/Acc_Pengajuan';
import Vessel from './pages/Vessel';
import Voyages from './pages/voyages';
import Realisasi from './pages/Realisasi';
import Shipside from './pages/Shipside';

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
            <Route path="/vessels1" element={<Vessel />} />
            <Route path="/voyages2" element={<Voyages />} />  
            <Route path="/bongkaran3" element={<Bongkaran />} />
            <Route path="/pengajuan4" element={<Pengajuan />} />
            <Route path="/acc_pengajuan5" element={<Acc_Pengajuan/>}/>
            <Route path="/realisasi6" element={<Realisasi/>}/>
            <Route path="/shipside7" element={<Shipside/>}/>
          </Route>
        </Route>

        {/* Rute untuk halaman yang tidak ditemukan */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;