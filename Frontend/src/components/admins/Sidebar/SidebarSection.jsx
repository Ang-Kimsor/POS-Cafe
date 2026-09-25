// use for each section dropdown
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import SidebarNavLink from "./SidebarNavLink";

const SidebarSection = ({
  section,
  isOpen,
  sidebarOpen,
  setSidebarOpen,
  onToggle,
  onExpandSidebar,
}) => {
  const location = useLocation();
  
  // Check if any child item is active
  const isChildActive = section.items.some(item => {
    if (item.end) {
      return location.pathname === item.to;
    }
    return location.pathname.startsWith(item.to);
  });

  return (
    <div className="mb-0.5">
      <button
        type="button"
        onClick={() => {
          if (!sidebarOpen) {
            onExpandSidebar();
          }
          onToggle();
        }}
        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-[#04342e] ${
          isChildActive ? "bg-[#04342e]" : ""
        }`}
        title={!sidebarOpen ? section.title : undefined}
      >
        <span className={`flex w-5 shrink-0 justify-center ${isChildActive ? "text-white" : "text-white/90"}`}>
          <FontAwesomeIcon icon={section.sectionIcon} className="text-sm" />
        </span>
        {sidebarOpen && (
          <>
            <span className={`min-w-0 flex-1 text-sm font-semibold tracking-wide ${isChildActive ? "text-white" : "text-white/95"}`}>
              {section.title}
            </span>
            <FontAwesomeIcon
              icon={isOpen ? faChevronDown : faChevronRight}
              className={`text-xs shrink-0 ${isChildActive ? "text-white/80" : "text-white/60"}`}
            />
          </>
        )}
      </button>

      {sidebarOpen && isOpen && (
        <ul className="border-l-2 border-white/15 ml-5 mr-2 my-1 space-y-0.5 pl-2">
          {section.items.map((item) => (
            <li key={item.label}>
              <SidebarNavLink item={item} setSidebarOpen={setSidebarOpen} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SidebarSection;
