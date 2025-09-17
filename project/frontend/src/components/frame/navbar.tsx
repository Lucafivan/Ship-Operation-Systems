import spilLogo from "../../assets/spil_logo.png";

function Navbar() {
  return (
    <header className="h-16 bg-gray-50 border-b border-gray-200 px-4 flex items-center justify-between">
      {/* Logo kiri */}
      <div className="flex items-center h-full">
        <img src={spilLogo} alt="SPIL Logo" className="h-7 object-contain" />
        <h1 className="text-xl font-semibold text-gray-800 pl-4">
          Ship Operation System
        </h1>
      </div>
    </header>
  )
}

export default Navbar