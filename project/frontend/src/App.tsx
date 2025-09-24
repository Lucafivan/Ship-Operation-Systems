import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import NotFoundPage from './pages/NotFound';
import MonitoringVoyages from './pages/MonitoringVoyages';
import ProtectedRoute from './auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout'
import Bongkaran from './pages/Bongkaran';
import Pengajuan from './pages/Pengajuan';
import Acc_Pengajuan from './pages/Acc_Pengajuan';
import Vessel from './pages/Vessel';
import Voyage from './pages/Voyage';
import Realisasi from './pages/Realisasi';
import Shipside from './pages/Shipside';
import Port from './pages/Port';
import DashboardPage from './pages/Dashboard';

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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vessel" element={<Vessel />} />
            <Route path="/voyage" element={<Voyage />} />  
            <Route path="/bongkaran" element={<Bongkaran />} />
            <Route path="/pengajuan" element={<Pengajuan />} />
            <Route path="/acc_pengajuan" element={<Acc_Pengajuan/>}/>
            <Route path="/realisasi" element={<Realisasi/>}/>
            <Route path="/shipside" element={<Shipside/>}/>
            <Route path="/port" element={<Port/>}/>
            <Route path="/monitoring" element={<MonitoringVoyages />} />
          </Route>
        </Route>

        {/* Rute untuk halaman yang tidak ditemukan */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;