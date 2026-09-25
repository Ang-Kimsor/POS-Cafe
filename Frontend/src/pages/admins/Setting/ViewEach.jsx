import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../../api/axios";
import { deleteSetting } from "../../../api/settingApi";
import { formatDateTime } from "../../../utils/dateHelper";

const ViewEach = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [setting, setSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        setLoading(true);
        setNotFound(false);

        const res = await api.get(`/admin/setting/${id}`);

        if (!res.data) {
          setNotFound(true);
        } else {
          setSetting(res.data);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSetting();
  }, [id]);

  const handleDelete = async (id) => {
    const critical = ['tax_percent', 'shop_name'];
    if (critical.includes(setting?.key_name)) {
      return Swal.fire("Restricted", "This is a system-critical setting and cannot be deleted.", "warning");
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This setting will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteSetting(id);

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Setting has been deleted.",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/admin/settings");
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete setting",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      </div>
    );
  }

  if (notFound || !setting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-semibold text-red-500">
          Setting Not Found
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="w-full bg-white rounded-2xl shadow-md p-8 mx-auto">
        <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-semibold text-green-700">
            Setting Details
          </h2>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="text-gray-500 text-sm">Setting ID</h3>
            <p className="text-lg font-semibold">{setting.setting_id}</p>
          </div>

          <div>
            <h3 className="text-gray-500 text-sm">Key Name</h3>
            <p className="text-lg font-semibold">{setting.key_name}</p>
          </div>

          <div>
            <h3 className="text-gray-500 text-sm">Value</h3>
            <p className="text-gray-800 whitespace-pre-wrap break-all">
              {setting.value}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-gray-500 text-sm">Created</h3>
              <p className="text-gray-800">{formatDateTime(setting.created_at)}</p>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Updated</h3>
              <p className="text-gray-800">{formatDateTime(setting.updated_at)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-gray-500 text-sm">Status</h3>
            <span className="inline-block mt-1 px-3 py-1 text-sm rounded-full bg-emerald-100 text-emerald-800 font-medium">
              Active
            </span>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() =>
                navigate(`/admin/settings/update/${setting.setting_id}`)
              }
              className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => handleDelete(id)}
              className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEach;
