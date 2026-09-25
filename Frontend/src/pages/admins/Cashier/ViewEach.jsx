import { useNavigate, useParams } from "react-router-dom";
import { getOneCashier, deleteCashier } from "../../../api/cashierApi";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const ViewEach = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        setNotFound(false);
  
        const res = await getOneCashier(Number(id));
  
        if (!res.data) {
          setNotFound(true);
        } else {
          setStaff(res.data);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [id]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This cashier will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteCashier(id);
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Cashier has been deleted.",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/admin/cashiers");
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete cashier",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading cashier details...
      </div>
    );
  }

  if (notFound || !staff) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-semibold text-red-500">Cashier Not Found</h2>
        <button
          onClick={() => navigate("/admin/cashiers")}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="w-full bg-white rounded-2xl shadow-md p-8">
        <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-semibold text-green-700">
            Cashier Details
          </h2>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="text-gray-500 text-sm">ID</h3>
            <p className="text-lg font-semibold">{staff.user_id}</p>
          </div>

          <div>
            <h3 className="text-gray-500 text-sm">Name</h3>
            <p className="text-lg font-semibold">{staff.name}</p>
          </div>

          <div>
            <h3 className="text-gray-500 text-sm">Email</h3>
            <p className="text-gray-800">{staff.email}</p>
          </div>

          <div>
            <h3 className="text-gray-500 text-sm">Role</h3>
            <span className="inline-block mt-1 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 font-semibold">
              Cashier
            </span>
          </div>

          <div>
            <h3 className="text-gray-500 text-sm">Status</h3>
            <span
              className={`inline-block mt-1 px-3 py-1 text-sm rounded-full font-semibold ${
                staff.is_active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}
            >
              {staff.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(`/admin/cashiers/update/${staff.user_id}`)}
              className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => handleDelete(id)}
              className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
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
