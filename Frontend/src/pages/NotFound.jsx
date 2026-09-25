import { faArrowLeft, faExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-100 via-red-100 to-blue-100">
      <div className="text-center bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full flex flex-col items-center">
        {/* Icon */}
        <div className="text-red-400 text-6xl rounded-full p-3 mb-4 bg-red-200 size-24 flex items-center justify-center">
          <FontAwesomeIcon icon={faExclamation} />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-700 mb-2">404</h1>
        <h2 className="text-xl text-gray-600 mb-4">Page Not Found</h2>

        {/* Description */}
        <p className="text-gray-500 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>

        {/* Back Button */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition duration-200"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mt-1" />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
