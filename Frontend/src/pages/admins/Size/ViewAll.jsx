import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faPlus,
  faTrash,
  faUndo,
  faFilter,
  faSync,
  faEraser,
} from "@fortawesome/free-solid-svg-icons";
import { deleteSize, getAllSizes, restoreSize } from "../../../api/sizeApi";
import DataTable from "../../../components/common/DataTable";

const ViewAll = () => {
  const navigate = useNavigate();

  const [sizes, setSizes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const initialFilters = {
    status: "active",
    search: "",
    sort_by: "size_id",
    sort_direction: "asc",
  };

  const [filters, setFilters] = useState({
    ...initialFilters,
    page: 1,
    per_page: 10,
  });

  // Load data
  const fetchSizes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllSizes(filters, !initialLoad);
      setSizes(res.data.data);
      setPagination(res.data);
      if (initialLoad) setInitialLoad(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch sizes");
    } finally {
      setLoading(false);
    }
  }, [filters, initialLoad]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This size will be moved to trash!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteSize(id);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: res.data.message,
          timer: 1500,
          showConfirmButton: false,
        });
        fetchSizes();
      } catch {
        Swal.fire("Error", "Delete failed", "error");
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await restoreSize(id);
      Swal.fire({
        icon: "success",
        title: "Restored!",
        text: res.data.message,
        timer: 1500,
        showConfirmButton: false,
      });
      fetchSizes();
    } catch {
      Swal.fire("Error", "Restore failed", "error");
    }
  };

  const handleReset = () => {
    setFilters({ ...initialFilters, page: 1, per_page: 10 });
    setResetKey((prev) => prev + 1);
  };

  useEffect(() => {
    fetchSizes();
  }, [fetchSizes]);

  const columns = [
    {
      header: "ID",
      accessor: "size_id",
      sortable: true,
      className: "w-16",
    },
    {
      header: "Size Name",
      accessor: "size",
      sortable: true,
      render: (row) => (
        <span
          className={`font-semibold ${row.deleted_at ? "text-gray-400 line-through" : "text-gray-800"}`}
        >
          {row.size}
        </span>
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
                onClick={() => navigate(`/admin/sizes/update/${row.size_id}`)}
                className="w-8 h-8 flex items-center justify-center bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all duration-200 shadow-sm"
                title="Edit Size"
              >
                <FontAwesomeIcon icon={faPen} className="text-xs" />
              </button>
              <button
                onClick={() => handleDelete(row.size_id)}
                className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all duration-200 shadow-sm"
                title="Delete Size"
              >
                <FontAwesomeIcon icon={faTrash} className="text-xs" />
              </button>
            </>
          ) : (
            <button
              onClick={() => handleRestore(row.size_id)}
              className="w-8 h-8 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all duration-200 shadow-sm"
              title="Restore Size"
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
              Sizes Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage product sizes (e.g., S, M, L, Regular, Large)
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/sizes/add")}
            className="flex items-center gap-2 px-4 py-2 bg-[#087467] text-white rounded-xl hover:bg-[#065e53] transition-all shadow-md shadow-green-100 font-medium"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Size</span>
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
              Status
            </span>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="custom-select block w-48 transition-all"
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
              onClick={fetchSizes}
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
          data={sizes}
          loading={loading}
          searchPlaceholder="Search sizes..."
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
