import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation, Link } from "react-router-dom";
import { logout } from "../../api/authApi";
import { faStore, faHistory, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const { user: authUser, isLoading, isVerifying } = useAuth();
  const user = authUser || { name: "User" };
  const handleLogout = () => {
    logout();
  };

  return (
    <nav className={`bg-white px-6 py-3 shadow-sm border-b border-gray-100 flex justify-between items-center sticky top-0 z-100 w-full ${isLoading || isVerifying ? "pointer-events-none opacity-80" : ""}`}>
      <div className="flex items-center gap-8">
        <span className="text-gray-700 font-medium mr-2">Cashier Panel</span>
        <div className="flex items-center gap-2 bg-gray-100/50 p-1 rounded-xl">
          <Link
            to="/cashier"
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${!location.pathname.includes("/history")
              ? "bg-white text-teal-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <FontAwesomeIcon icon={faStore} className="mr-2" />
            POS
          </Link>
          <Link
            to="/cashier/history"
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${location.pathname.includes("/history")
              ? "bg-white text-teal-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <FontAwesomeIcon icon={faHistory} className="mr-2" />
            History
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{user.name}</p>
          <p className="text-[11px] font-bold text-green-500 leading-none">Online</p>
        </div>
        <p className="bg-red-500 rounded-full size-10 flex items-center justify-center text-white font-serif text-xl">{user.name.charAt(0)}</p>
        <button
          onClick={handleLogout}
          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
          title="Logout"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
