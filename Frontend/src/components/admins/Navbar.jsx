import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { logout } from "../../api/authApi";
import { faBars, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({ setSidebarOpen }) => {
  const { user: authUser, isLoading, isVerifying } = useAuth();
  const user = authUser || { name: "User" };
  const handleLogout = () => {
    logout();
  };
  return (
    <nav className={`bg-white px-6 py-3 shadow-sm border-b border-gray-100 flex justify-between items-center sticky top-0 z-99 ${isLoading || isVerifying ? "pointer-events-none opacity-80" : ""}`}>
      <div className="flex items-center gap-4">
        <button onClick={setSidebarOpen} className="p-1 cursor-pointer">
          <FontAwesomeIcon icon={faBars} />
        </button>
        <span className="text-gray-700 font-medium">Admin Panel</span>
      </div>
      <div className="flex items-center gap-4">

        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{user.name}</p>
          <p className="text-[11px] font-bold text-green-500 leading-none">Online</p>
        </div>
        <p className="bg-red-500 rounded-full size-10 flex items-center justify-center text-white font-serif text-xl">{user.name.charAt(0)}</p>
        <button onClick={handleLogout}
          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
          title="Logout">
          <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
