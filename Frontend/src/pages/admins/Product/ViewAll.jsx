import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPen,
  faPlus,
  faTrash,
  faUndo,
  faFilter,
  faSync,
  faEraser,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import {
  getAllProducts,
  deleteProduct,
  restoreProduct,
} from "../../../api/productApi";
import { getAllCategories } from "../../../api/categoryApi";
import DataTable from "../../../components/common/DataTable";
import ImagePlaceholder from "../../../assets/imageplaceholder.jpg";

const ViewAll = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const initialFilters = {
    category_id: "all",
    status: "active",
    search: "",
    sort_by: "product_id",
    sort_direction: "asc",
  };

  const [filters, setFilters] = useState({
    ...initialFilters,
    page: 1,
    per_page: 10,
  });

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchCategoryQuery, setSearchCategoryQuery] = useState("");

  const filteredCategories = categories
    .filter((c) => c.name.toLowerCase().includes(searchCategoryQuery.toLowerCase()))
    .slice(0, 10);

  const selectedCategory = categories.find((c) => String(c.category_id) === String(filters.category_id));
  const selectedCategoryName =
    filters.category_id === "all"
      ? "All Categories"
      : selectedCategory
      ? selectedCategory.name + (selectedCategory.deleted_at ? " (Deleted)" : (!selectedCategory.is_active ? " (Inactive)" : ""))
      : "All Categories";

  // FETCH
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllProducts(filters, !initialLoad);
      setProducts(res.data.data);
      setPagination(res.data);
      if (initialLoad) setInitialLoad(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [filters, initialLoad]);

  const fetchCategories = async () => {
    try {
      const res = await getAllCategories({ status: "all" });
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This product will be moved to trash!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteProduct(id);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchProducts();
      } catch {
        Swal.fire("Error", "Delete failed", "error");
      }
    }
  };

  // RESTORE
  const handleRestore = async (id) => {
    try {
      await restoreProduct(id);
      Swal.fire({
        icon: "success",
        title: "Restored!",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchProducts();
    } catch {
      Swal.fire("Error", "Restore failed", "error");
    }
  };

  const handleReset = () => {
    setFilters({ ...initialFilters, page: 1, per_page: 10 });
    setResetKey((prev) => prev + 1);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const columns = [
    { header: "ID", accessor: "product_id", sortable: true, className: "w-16" },
    {
      header: "Image",
      accessor: "image_url",
      sortable: false,
      render: (row) => (
        <img
          src={row.image_url || ImagePlaceholder}
          alt={row.name}
          className={`w-12 h-12 object-cover rounded-lg shadow-sm border border-gray-100 ${row.deleted_at ? "grayscale opacity-50" : ""}`}
        />
      ),
    },
    {
      header: "Name",
      accessor: "name",
      sortable: true,
      render: (row) => (
        <span
          className={`font-semibold ${row.deleted_at ? "text-gray-400 line-through" : "text-gray-800"}`}
        >
          {row.name}
        </span>
      ),
    },
    {
      header: "Category",
      accessor: (row) => row.category?.name || "N/A",
      sortKey: "category_id",
      sortable: true,
    },
    {
      header: "Prices",
      accessor: "prices",
      sortable: false,
      render: (row) => (
        <div className="flex flex-wrap gap-1.5">
          {row.sizes
            ?.filter((s) => s.pivot.price > 0)
            .map((s, index, arr) => (
              <span
                key={s.size_id}
                className={`text-[12px] font-semibold ${row.deleted_at ? "text-gray-400" : "text-emerald-600"}`}
              >
                {s.size}: ${s.pivot.price}{index < arr.length - 1 ? "," : ""}
              </span>
            ))}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      sortable: false,
      render: (row) => (
        <span className={`text-sm font-semibold ${row.deleted_at ? "text-red-500" : (!row.is_active ? "text-orange-500" : "text-emerald-600")}`}>
          {row.deleted_at ? "Deleted" : (!row.is_active ? "Inactive" : "Active")}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: "action",
      sortable: false,
      className: "text-right w-32",
      render: (row) => (
        <div className="flex justify-end gap-2">
          {!row.deleted_at ? (
            <>
              <button
                onClick={() =>
                  navigate(`/admin/products/view/${row.product_id}`)
                }
                className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-sm"
                title="View Details"
              >
                <FontAwesomeIcon icon={faEye} className="text-xs" />
              </button>
              <button
                onClick={() =>
                  navigate(`/admin/products/update/${row.product_id}`)
                }
                className="w-8 h-8 flex items-center justify-center bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all duration-200 shadow-sm"
                title="Edit Product"
              >
                <FontAwesomeIcon icon={faPen} className="text-xs" />
              </button>
              <button
                onClick={() => handleDelete(row.product_id)}
                className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all duration-200 shadow-sm"
                title="Delete Product"
              >
                <FontAwesomeIcon icon={faTrash} className="text-xs" />
              </button>
            </>
          ) : (
            <button
              onClick={() => handleRestore(row.product_id)}
              className="w-8 h-8 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all duration-200 shadow-sm"
              title="Restore Product"
            >
              <FontAwesomeIcon icon={faUndo} className="text-xs" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading && initialLoad) return null;

  return (
    <div className="p-4 min-h-screen bg-gray-50/50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Products Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your cafe menu items and pricing
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/products/add")}
            className="flex items-center gap-2 px-4 py-2 bg-[#087467] text-white rounded-xl hover:bg-[#065e53] transition-all shadow-md shadow-green-100 font-medium"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Product</span>
          </button>
        </div>

        {/* FILTERS */}
        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm font-semibold uppercase tracking-wider mr-2">
            <FontAwesomeIcon icon={faFilter} size="xs" />
            <span>Filters:</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">
              Category
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 w-48 text-left flex justify-between items-center transition-all"
              >
                <span className="truncate">{selectedCategoryName}</span>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`text-[10px] text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {isCategoryDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsCategoryDropdownOpen(false)}></div>
                  <div className="absolute top-full mt-2 w-full min-w-[220px] bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-2 max-h-60 overflow-hidden flex flex-col">
                    <div className="px-2 pb-2 border-b border-gray-50">
                      <input
                        type="text"
                        placeholder="Search category..."
                        value={searchCategoryQuery}
                        onChange={(e) => setSearchCategoryQuery(e.target.value)}
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto flex-1">
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={() => {
                          setFilters({ ...filters, category_id: 'all', page: 1 });
                          setIsCategoryDropdownOpen(false);
                          setSearchCategoryQuery("");
                        }}
                      >
                        All Categories
                      </button>
                      {filteredCategories.map((c) => (
                        <button
                          key={c.category_id}
                          type="button"
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex justify-between items-center"
                          onClick={() => {
                            setFilters({ ...filters, category_id: c.category_id, page: 1 });
                            setIsCategoryDropdownOpen(false);
                            setSearchCategoryQuery("");
                          }}
                        >
                          <span>
                            {c.name}
                            {c.deleted_at && <span className="ml-1 text-red-500 text-xs">(Deleted)</span>}
                            {!c.deleted_at && !c.is_active && <span className="ml-1 text-orange-500 text-xs">(Inactive)</span>}
                          </span>
                        </button>
                      ))}
                      {filteredCategories.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          No categories found
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">
              Status
            </span>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="block w-40 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          <div className="flex items-center gap-1 mt-5 ml-auto">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all text-sm font-medium"
              title="Reset Filters & Search"
            >
              <FontAwesomeIcon icon={faEraser} />
              <span>Reset</span>
            </button>
            <button
              onClick={fetchProducts}
              className="p-2 text-gray-400 hover:text-emerald-600 transition-all"
              title="Refresh"
            >
              <FontAwesomeIcon
                icon={faSync}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* TABLE */}
        <DataTable
          key={resetKey}
          columns={columns}
          data={products}
          loading={loading}
          searchPlaceholder="Search products by name..."
          serverSide={true}
          paginationData={pagination}
          onPageChange={(page) => setFilters({ ...filters, page })}
          onRowsPerPageChange={(per_page) =>
            setFilters({ ...filters, per_page, page: 1 })
          }
          onSort={(sort_by, sort_direction) =>
            setFilters({ ...filters, sort_by, sort_direction, page: 1 })
          }
          onSearch={(search) => setFilters({ ...filters, search, page: 1 })}
          searchValue={filters.search}
        />
      </div>
    </div>
  );
};

export default ViewAll;
