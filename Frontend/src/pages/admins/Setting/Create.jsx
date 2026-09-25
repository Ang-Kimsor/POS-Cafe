import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { createSetting } from "../../../api/settingApi";

const Create = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    key_name: "",
    value: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createSetting(formData);
      await Swal.fire({
        icon: "success",
        title: "Setting Created!",
        text: "New configuration key has been added.",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/admin/settings");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.message || "Failed to create setting", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-[calc(100vh-60px)]">
      <div className="w-full mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-semibold text-green-700">Add Setting</h2>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6 w-full">

            <div>
              <label className="block mb-2 font-medium">
                Key Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="key_name"
                value={formData.key_name}
                onChange={handleChange}
                placeholder="e.g. shop_email"
                required
                className="input"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Value <span className="text-red-500">*</span>
              </label>
              <textarea
                name="value"
                value={formData.value}
                onChange={handleChange}
                rows="4"
                placeholder="Enter value..."
                required
                className="input" />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#07564d] text-white rounded-lg"
              >
                {loading ? "Saving..." : "Save Setting"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Create;
