import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../api/axios";

const Update = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    key_name: "",
    value: "",
  });

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        setFetchLoading(true);
        const res = await api.get(`/admin/setting/${id}`, { skipLoading: true });
        if (res.data) {
          setFormData({
            key_name: res.data.key_name,
            value: res.data.value,
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load setting", "error");
        navigate("/admin/settings");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchSetting();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put(`/admin/setting/${id}`, { value: formData.value }, { skipLoading: true });
      await Swal.fire({
        icon: "success",
        title: "Setting Updated!",
        text: "Configuration has been saved successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/admin/settings");
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to update setting",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading)
    return;

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
            <h2 className="text-2xl font-semibold text-green-700">
              Update Setting
            </h2>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-medium">Key Name</label>
              <input
                type="text"
                value={formData.key_name}
                disabled
                className="input bg-gray-50 text-gray-500 cursor-not-allowed"
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
                rows="6"
                placeholder="Enter value..."
                required
                className="input"
              />
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
                {loading ? "Updating..." : "Update Setting"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Update;
