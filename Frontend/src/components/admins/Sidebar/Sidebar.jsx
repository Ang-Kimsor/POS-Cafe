// React
import { useState } from "react";
// Icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDoorOpen, faX } from "@fortawesome/free-solid-svg-icons";
import {
  adminSidebarSections,
  adminSidebarInitiallyOpenId,
} from "../../../data/Sidebar";
// Component
import SidebarSection from "./SidebarSection";
// API
import { logout } from "../../../api/authApi";

import { useAuth } from "../../../context/AuthContext";

// Main
const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  sections = adminSidebarSections,
  initiallyOpenSectionId = adminSidebarInitiallyOpenId,
}) => {
  const [expanded, setExpanded] = useState(() =>
    Object.fromEntries(
      sections.map((s) => [s.id, s.id === initiallyOpenSectionId]),
    ),
  );

  // Toggle Drop Down
  const toggleSection = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const { user, isLoading, isVerifying } = useAuth();
  const userRole = user?.role;
  
  const filteredSections = sections
    .filter((section) => !section.superadminOnly || userRole === "superadmin")
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.superadminOnly || userRole === "superadmin"
      ),
    }));

  return (
    <aside
      className={`${sidebarOpen ? "md:w-64 w-full" : "md:w-12 w-12"} ${isLoading || isVerifying ? "pointer-events-none opacity-80" : ""} z-20 h-screen bg-[#07564d] fixed left-0 text-white transition-all duration-300 flex flex-col shadow-lg`}
    >
      {/* Sidebar Header */}
      <div className="p-4 shrink-0 border-b border-white/10">
        <div className="font-bold flex justify-between items-center gap-2">
          <p className={`${!sidebarOpen && "text-[12px]"} truncate`}>
            {sidebarOpen ? "Cafe System" : "CS"}
          </p>
          <button
            type="button"
            className={`${sidebarOpen ? "block" : "hidden"} md:hidden text-white/90 p-1`}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <FontAwesomeIcon icon={faX} />
          </button>
        </div>
      </div>
      {/* Each Section Dropdown with submenu */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 pb-6">
        {filteredSections.map((section) => (
          <SidebarSection
            key={section.id}
            section={section}
            isOpen={expanded[section.id]}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onToggle={() => toggleSection(section.id)}
            onExpandSidebar={() => setSidebarOpen(true)}
          />
        ))}
      </nav>
      {/* Logout */}
      <div
        onClick={() => (sidebarOpen ? logout() : setSidebarOpen(true))}
        className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm mb-2 border-t border-white/10"
      >
        <span className="flex w-8 h-8 items-center justify-center text-white/90">
          <FontAwesomeIcon icon={faDoorOpen} className="text-sm" />
        </span>

        {sidebarOpen && (
          <span className=" min-w-0 flex-1">
            <span className="block font-medium leading-tight text-white">
              Logout
            </span>
          </span>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
