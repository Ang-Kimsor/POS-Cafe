import { useState, useEffect } from "react";
import { Navbar, Sidebar } from "./../components/admins";
import GlobalLoading from "../components/common/GlobalLoading";
import GlobalServerError from "../components/common/GlobalServerError";
import { Outlet } from "react-router-dom";
import {
  adminSidebarSections,
  adminSidebarInitiallyOpenId,
} from "../data/Sidebar";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div className=" bg-gray-100 relative overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sections={adminSidebarSections}
        initiallyOpenSectionId={adminSidebarInitiallyOpenId}
      />
      {/* Main */}
      <div
        className={`relative flex flex-col ${
          sidebarOpen ? "md:ml-64" : "md:ml-12"
        } w-[calc(100vw-56px)] md:w-auto ml-12 transition-all duration-300 h-screen`}
      >
        <GlobalServerError />
        <GlobalLoading />
        {/* Navbar */}
        <Navbar setSidebarOpen={() => setSidebarOpen(!sidebarOpen)} />
        <div className="relative flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
