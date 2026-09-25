import { Outlet } from "react-router-dom";
import { Navbar } from "../components/cashiers";
import GlobalLoading from "../components/common/GlobalLoading";
import GlobalServerError from "../components/common/GlobalServerError";

const CashierLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100 relative flex-col">
      <GlobalServerError />
      <GlobalLoading />
      <Navbar />
      <div className="relative flex-1 overflow-y-scroll">
        <Outlet />
      </div>
    </div>
  );
};

export default CashierLayout;
