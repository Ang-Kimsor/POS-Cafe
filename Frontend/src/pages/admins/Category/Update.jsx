import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import { getOneCategory, updateCategory } from "./../../../api/categoryApi";

const Update = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch category detail
    const fetchCategory = async () => {
      try {
        setFetchLoading(true);
  
        const res = await getOneCategory(Number(id));
  
        if (res.data) {
          setFormData({
            name: res.data.name || "",
            description: res.data.description || "",
            is_active: res.data.is_active !== undefined ? !!res.data.is_active : true,
          });
        } else {
          setError("Category not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load category");
      } finally {
        setFetchLoading(false);
      }
    };
    
    fetchCategory();
  }, [id]);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log(formData);

    try {
      setLoading(true);

      await updateCategory(id, formData);

      await Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Category updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/admin/categories");
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to update category",
      });

      setError("Update failed");
    } finally {
      setLoading(false);
    }
  };

  // Loading UI
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

          <h2 className="text-2xl font-semibold text-green-700">
            Update Category
          </h2>
        </div>

        {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 font-medium text-gray-600">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              maxLength={100}
              placeholder="Category name (max 100 characters)"
              className="input"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <p className="mt-1 text-xs text-gray-500">Must be unique.</p>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-600">
              Description 
            </label>
            <textarea
              name="description"
              placeholder="Describe this category"
              className="input h-32 resize-y min-h-30"
              value={formData.description}
              onChange={handleChange}
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
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#07564d] text-white rounded-lg shadow"
            >
              {loading ? "Updating..." : "Update Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Update;
