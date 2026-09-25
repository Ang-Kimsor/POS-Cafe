import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const SidebarNavLink = ({ item, setSidebarOpen }) => {
  const handleClick = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <NavLink
      to={item.to}
      end={Boolean(item.end)}
      onClick={handleClick}
      className={({ isActive }) =>
        `flex w-full items-start gap-3 rounded-md px-2 py-2 text-left text-sm transition hover:bg-[#04342e]/90 ${
          isActive ? "bg-[#04342e] ring-1 ring-white/20" : ""
        }`
      }
    >
      <span className="mt-0.5 flex w-4 shrink-0 justify-center text-white/80">
        <FontAwesomeIcon icon={item.icon} className="text-xs" />
      </span>
      <span className=" min-w-0 flex-1">
        <span className="block font-medium leading-tight text-white">
          {item.label}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-white/55">
          {item.hint}
        </span>
      </span>
    </NavLink>
  );
};

export default SidebarNavLink;
