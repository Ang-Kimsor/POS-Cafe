import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getOneProduct, deleteProduct } from "../../../api/productApi";

const ViewEach = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FETCH
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getOneProduct(id);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Product not found", "error");
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, navigate]);

  // DELETE
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This product will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteProduct(id);

        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/admin/products");
      } catch {
        Swal.fire("Error", "Delete failed", "error");
      }
    }
  };

  // UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading product...
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="w-full bg-white rounded-2xl shadow-xl p-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-semibold text-green-700">
            Product Details
          </h2>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* IMAGE */}
          <div className="flex justify-center">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-80 h-80 object-cover rounded-xl border"
            />
          </div>

          {/* INFO */}
          <div className="space-y-4">
            <div>
              <h3 className="text-gray-500 text-sm">Product Name</h3>
              <p className="text-lg font-semibold">{product.name}</p>
            </div>

            <div>
              <h3 className="text-gray-500 text-sm">Category</h3>
              <p>{product.category.name}</p>
            </div>

            <div>
              <h3 className="text-gray-500 text-sm">Description</h3>
              <p>{product.description}</p>
            </div>

            {/* 🔥 SIZES + PRICES */}
            <div>
              <h3 className="text-gray-500 text-sm mb-2">Sizes & Prices</h3>

              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((s) =>
                  s.pivot.price <= 0 ? null : (
                    <span
                      key={s.size_id}
                      className={`px-2 py-1 rounded w-fit ${s.deleted_at || !s.is_active ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-800'}`}
                    >
                      {s.size}: ${s.pivot.price} {s.deleted_at ? '(Deleted)' : (!s.is_active ? '(Inactive)' : '')}
                    </span>
                  ),
                )}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() =>
                  navigate(`/admin/products/update/${product.product_id}`)
                }
                className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Edit
              </button>

              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEach;
