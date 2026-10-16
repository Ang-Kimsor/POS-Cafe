import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMugHot } from "@fortawesome/free-solid-svg-icons";
import {
  useLoading,
  setGlobalLoadingHandlers,
} from "../../context/LoadingContext";

const GlobalLoading = () => {
  const { isLoading, loadingMessage, showLoading, hideLoading, forceHideLoading } = useLoading();

  useEffect(() => {
    // Register global handlers for non-React files like axios.js
    setGlobalLoadingHandlers(showLoading, hideLoading, forceHideLoading);
  }, [showLoading, hideLoading, forceHideLoading]);

  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-[10000] flex items-center justify-center bg-slate-900/25 backdrop-blur-[2px] p-4 transition-opacity duration-200 select-none"
    >
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 px-6 py-6 w-full max-w-[270px] flex flex-col items-center text-center">
        {/* Tailwind CSS Circular Spinner */}
        <div className="relative flex items-center justify-center w-12 h-12 mb-3.5">
          {/* Pure Tailwind CSS Spinner Ring (no SVG, no icon) */}
          <div className="w-12 h-12 rounded-full border-[3px] border-slate-200 border-t-[#07564d] animate-spin" />

          {/* Centered Cafe Icon */}
          <div className="absolute inset-0 flex items-center justify-center text-[#07564d]">
            <FontAwesomeIcon icon={faMugHot} className="text-sm" />
          </div>
        </div>

        {/* Text Content */}
        <h4 className="text-slate-800 font-semibold text-sm tracking-tight">
          {loadingMessage || "Please wait..."}
        </h4>

        {/* Slim Indeterminate Progress Line */}
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-4">
          <div className="bg-[#07564d] h-full rounded-full animate-indeterminate" />
        </div>
      </div>
    </div>
  );
};

export default GlobalLoading;
