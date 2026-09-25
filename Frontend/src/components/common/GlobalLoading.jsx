import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";
import {
  useLoading,
  setGlobalLoadingHandlers,
} from "../../context/LoadingContext";

const GlobalLoading = () => {
  const { isLoading, showLoading, hideLoading, forceHideLoading } = useLoading();

  useEffect(() => {
    // Register global handlers for non-React files like axios.js
    setGlobalLoadingHandlers(showLoading, hideLoading, forceHideLoading);
  }, [showLoading, hideLoading, forceHideLoading]);

  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 z-[10000] flex items-center justify-center bg-gray-900/60 p-6 transition-all duration-300">
      <div className="max-w-xs w-full bg-white border border-gray-200 shadow-xl rounded-lg p-8 flex flex-col items-center">
        {/* Main Spinner */}
        <FontAwesomeIcon
          icon={faSync}
          spin
          className="text-emerald-600 text-5xl mb-6"
        />

        <div className="flex flex-col items-center text-center">
          <p className="text-gray-900 font-bold text-xl mb-1">
            Please Wait...
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoading;
