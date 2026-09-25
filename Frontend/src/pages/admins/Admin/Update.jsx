import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { getOneAdmin, updateAdmin } from "../../../api/adminApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Update = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "admin",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setFetchLoading(true);
        const res = await getOneAdmin(Number(id));
        if (res.data) {
          setFormData((prev) => ({
            ...prev,
            name: res.data.name || "",
            email: res.data.email || "",
            role: res.data.role || "admin",
          }));
        } else {
          setError("Admin not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load admin");
      } finally {
        setFetchLoading(false);
      }
    };
    
    fetchStaff();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password || formData.confirmPassword) {
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.password)) {
        setError("Password must be at least 8 characters and include uppercase, lowercase, and a number");
        Swal.fire({
          icon: "error",
          title: "Invalid password",
          text: "Password must be at least 8 characters and include uppercase, lowercase, and a number",
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Passwords do not match",
        });
        return;
      }
    }

    try {
      setLoading(true);
      const data = { ...formData };
      delete data.confirmPassword;
      if (!data.password) {
        delete data.password;
      }

      await updateAdmin(id, data);

      await Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Admin updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/admin/admins");
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to update admin",
      });
      setError("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return;
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-semibold text-green-700">Update Admin</h2>
        </div>

        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block mb-2 font-medium text-gray-600">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              className="input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 font-medium text-gray-600">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              className="input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>



          {/* Password (optional) */}
          <div>
            <label className="block mb-2 font-medium text-gray-600">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Leave blank to keep current password"
                className="input w-full pr-10"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
                title="Password must be at least 8 characters and include uppercase, lowercase, and a number"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-2 font-medium text-gray-600">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm new password"
                className="input w-full pr-10"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters, include uppercase, lowercase, and a number.
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#07564d] text-white rounded-lg shadow"
            >
              {loading ? "Updating..." : "Update Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Update;
