import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { LayoutDashboard, Table, Target, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { logout } = useAuth();

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if ((location.state as { keepSidebarOpen?: boolean } | null)?.keepSidebarOpen) {
      setExpanded(true);
    }
  }, [location.state]);

  // Link style: center saat collapsed, start saat expanded
  const getLinkClass = (path: string) => {
    const active = currentPath === path ? "bg-[#3a9542]" : "hover:bg-[#3a9542]";
    const layout = expanded ? "justify-start px-3 gap-3" : "justify-center px-0 gap-0";
    return `flex items-center h-10 rounded-xl text-white transition-colors ${layout} ${active}`;
  };

  const handleLogout = () => {
    logout();
    toast.success("Logout success");
    navigate("/login");
  };

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`h-screen text-gray-100 transition-all duration-200 ease-out will-change-[width] bg-[#16332f] shadow-xl ring-1 ring-black/20 flex flex-col ${expanded ? "w-60 p-4" : "w-16 p-2"}`}
    >
      <nav className="flex flex-col gap-2 h-full">
          <Link to="/voyage" state={{ keepSidebarOpen: true }} className={getLinkClass("/dashboard")}>
            <LayoutDashboard size={20} className="shrink-0" />
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-200
                ${expanded ? "opacity-100 max-w-[160px] ml-2" : "opacity-0 max-w-0 ml-0"}`}
            >
              Voyage
            </span>
          </Link>

          <Link to="/bongkaran" state={{ keepSidebarOpen: true }} className={getLinkClass("/dashboard")}>
            <LayoutDashboard size={20} className="shrink-0" />
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-200
                ${expanded ? "opacity-100 max-w-[160px] ml-2" : "opacity-0 max-w-0 ml-0"}`}
            >
              Bongkaran
            </span>
          </Link>

          <Link to="/pengajuan" state={{ keepSidebarOpen: true }} className={getLinkClass("/early-warning")}>
            <LayoutDashboard size={20} className="shrink-0" />
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-200
                ${expanded ? "opacity-100 max-w-[160px] ml-2" : "opacity-0 max-w-0 ml-0"}`}
            >
              Pengajuan
            </span>
          </Link>

          <Link to="/acc_pengajuan" state={{ keepSidebarOpen: true }} className={getLinkClass("/report")}>
            <Target size={20} className="shrink-0" />
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-200
                ${expanded ? "opacity-100 max-w-[160px] ml-2" : "opacity-0 max-w-0 ml-0"}`}
            >
              Acc Pengajuan
            </span>
          </Link>

          <Link to="/realisasi" state={{ keepSidebarOpen: true }} className={getLinkClass("/report")}>
            <Target size={20} className="shrink-0" />
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-200
                ${expanded ? "opacity-100 max-w-[160px] ml-2" : "opacity-0 max-w-0 ml-0"}`}
            >
              Realisasi
            </span>
          </Link>

          <Link to="/shipside" state={{ keepSidebarOpen: true }} className={getLinkClass("/report")}>
            <Target size={20} className="shrink-0" />
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-200
                ${expanded ? "opacity-100 max-w-[160px] ml-2" : "opacity-0 max-w-0 ml-0"}`}
            >
              Shipside
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className={`mt-auto rounded-xl font-semibold bg-red-600 text-white hover:brightness-95 mb-24 h-10
              ${expanded ? "px-3 gap-2 flex items-center justify-start" : "px-0 gap-0 w-full flex items-center justify-center"}`}
          >
            <LogOut size={20} className="shrink-0" />
            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-200
                ${expanded ? "opacity-100 max-w-[160px] ml-2" : "opacity-0 max-w-0 ml-0"}`}
            >
              Logout
            </span>
          </button>
        </nav>
    </aside>
  );
}

export default Sidebar;