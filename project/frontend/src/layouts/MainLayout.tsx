import { Outlet } from 'react-router-dom';
import Sidebar from '../components/frame/sidebar';
import Navbar from '../components/frame/navbar';


function MainLayout() {

  return (
    <> {/* Gunakan Fragment agar bisa menampung modal di luar div utama */}
      <div className="flex flex-col h-screen bg-gray-100">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar dan main content dalam flex, sidebar width dinamis */}
          <Sidebar />
          <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-green-200 via-green-300 to-green-400 transition-all duration-200">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}

export default MainLayout;