import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createSize } from "../../../api/sizeApi";

const Create = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    size: "",
    is_active: true,
  });

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.size) {
      return Swal.fire("Error", "Please enter a size name", "error");
    }

    try {
      setLoading(true);
      await createSize(formData);
      await Swal.fire({
        icon: "success",
        title: "Created!",
        text: "Size added successfully",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/admin/sizes");
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Failed to create size",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-semibold text-green-700">Add New Size</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block mb-2 font-medium">
              Size Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleChange}
              className="input"
              placeholder="e.g., S, M, L, Regular, Large, 500ml"
              required
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="font-medium text-gray-600">Active Status</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                className="sr-only peer"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {formData.is_active ? "Active" : "Inactive"}
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2 bg-gray-200 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#07564d] text-white rounded-lg font-medium shadow-md hover:bg-[#06463e] transition-all"
            >
              {loading ? "Saving..." : "Save Size"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Create;
