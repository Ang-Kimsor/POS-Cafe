import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faServer, faRedo } from "@fortawesome/free-solid-svg-icons";
import { useServerError, setGlobalServerErrorHandler } from "../../context/ServerErrorContext";

const GlobalServerError = () => {
  const { isServerError, triggerServerError } = useServerError();

  useEffect(() => {
    // Register global handler for non-React files like axios.js
    setGlobalServerErrorHandler(triggerServerError);
  }, [triggerServerError]);

  if (!isServerError) return null;

  return (
    <div className="absolute inset-0 z-[10000] flex items-center justify-center bg-gray-900/60 p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 flex flex-col items-center text-center">
        <FontAwesomeIcon icon={faServer} className="text-red-500 text-6xl mb-6" />
        
        <h2 className="text-gray-900 font-bold text-2xl mb-3">
          Connection Lost
        </h2>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          We are unable to communicate with the server. It might be down for maintenance or experiencing high traffic. Please check your connection and try again.
        </p>
        
        <button 
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
        >
          <FontAwesomeIcon icon={faRedo} />
          <span>Reload Page</span>
        </button>
      </div>
    </div>
  );
};

export default GlobalServerError;
