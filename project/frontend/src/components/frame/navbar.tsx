import spilLogo from "../../assets/spil_logo.png";
import { Button } from "../ui/Button";
import { Link } from "react-router-dom";
import Navprofile from '../ui/navprofile';

function Navbar() {
  return (
    
    <header className="h-16 bg-gray-50 border-b border-gray-200 px-4 flex items-center justify-between">
      {/* Logo kiri */}
      <div className="flex items-center h-full">
        <img src={spilLogo} alt="SPIL Logo" className="h-7 object-contain" />
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <Link to="/monitoring">
            <Button  type="button" variant="secondary">
              Monitoring
            </Button>
        </Link>
        <Link to="/vessel">
          <Button  type="button" variant="primary">
            Tambah Vessel
          </Button>
        </Link>
      </div>
    </header>
  )
}

export default Navbar