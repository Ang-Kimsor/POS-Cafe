import { useNavigate, useParams } from "react-router-dom";
import { deleteCategory, getOneCategory } from "../../../api/categoryApi";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { formatDateTime } from "../../../utils/dateHelper";

const ViewEach = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setNotFound(false);
  
        const res = await getOneCategory(Number(id));
  
        if (!res.data) {
          setNotFound(true);
        } else {
          setCategory(res.data);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategory();
  }, [id]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This category will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteCategory(id);

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Category has been deleted.",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/admin/categories");
      } catch (err) {
        console.error(err);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete category",
        });
      }
    }
  };

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading category...
      </div>
    );
  }

  // Not found UI
  if (notFound || !category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-semibold text-red-500">
          Category Not Found
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
            Category Details
          </h2>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="text-gray-500 text-sm">Category ID</h3>
            <p className="text-lg font-semibold">{category.category_id}</p>
          </div>

          <div>
            <h3 className="text-gray-500 text-sm">Name</h3>
            <p className="text-lg font-semibold">{category.name}</p>
          </div>

          <div>
            <h3 className="text-gray-500 text-sm">Description</h3>
            <p className="text-gray-800 whitespace-pre-wrap">
              {category.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-gray-500 text-sm">Created</h3>
              <p>{formatDateTime(category.created_at)}</p>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Updated</h3>
              <p>{formatDateTime(category.updated_at)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-gray-500 text-sm">Status</h3>
            {category.deleted_at ? (
              <span className="inline-block mt-1 px-3 py-1 text-sm rounded-full bg-red-100 text-red-700">
                Deleted ({formatDateTime(category.deleted_at)})
              </span>
            ) : (
              <span className="inline-block mt-1 px-3 py-1 text-sm rounded-full bg-emerald-100 text-emerald-800">
                Active
              </span>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() =>
                navigate(`/admin/categories/update/${category.category_id}`)
              }
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
