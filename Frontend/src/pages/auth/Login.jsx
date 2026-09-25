import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { login } from "./../../api/authApi";
import { useNavigate } from "react-router-dom";
import { setCookie } from "../../utils/cookieHelper";
import { useAuth } from "../../context/AuthContext";
import GlobalLoading from "../../components/common/GlobalLoading";
import GlobalServerError from "../../components/common/GlobalServerError";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigator = useNavigate();

  const handleLogin = async () => {
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const res = await login({
        email: email,
        password: password,
      });
      
      const role = res.data.user.role;
      const hours = role === "superadmin" ? 12 : 24;

      // Save token in Cookie (12h for superadmin, 24h for admin/cashier)
      setCookie("token", res.data.token, hours);

      // Clean up legacy localStorage if any
      localStorage.clear();

      // Redirect
      if (role === "admin" || role === "superadmin") navigator("/admin");
      else navigator("/cashier");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === "admin" || user.role === "superadmin") navigator("/admin");
      else if (user.role === "cashier") navigator("/cashier");
    }
  }, [user, navigator]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <GlobalServerError />
      <GlobalLoading />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        className="w-full max-w-[420px] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2rem] p-8 sm:p-12 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-emerald-100 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <FontAwesomeIcon icon={faUser} className="text-emerald-600 text-2xl transform -rotate-3" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">Please sign in to continue</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="relative z-10 mb-6 p-4 bg-red-50/80 backdrop-blur-sm text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center justify-center animate-pulse">
            {error}
          </div>
        )}

        {/* Username */}
        <div className="mb-5 relative group z-10">
          <FontAwesomeIcon
            icon={faUser}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-300"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 text-slate-900 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all duration-300"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-6 relative group z-10">
          <FontAwesomeIcon
            icon={faLock}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-300"
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-11 pr-12 py-3.5 bg-slate-50/50 text-slate-900 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all duration-300"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        </div>

        {/* Button */}
        <button
          type="submit"
          className="relative z-10 w-full py-4 mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg shadow-emerald-600/30 transform hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]"
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;
