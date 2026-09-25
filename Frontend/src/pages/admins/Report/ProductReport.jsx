import React, { useState, useEffect, useCallback } from "react";
import { getProductReport, exportProductReport } from "../../../api/reportApi";
import { getAllProducts } from "../../../api/productApi";
import { getAllCategories } from "../../../api/categoryApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faDownload,
  faSync,
  faEraser,
  faFilter,
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import DataTable from "../../../components/common/DataTable";
import KPICard from "../../../components/admins/KPICard";

const ProductReport = () => {
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState("");

  const initialFilters = {
    search: "",
    product_id: "all",
    category_id: "all",
    start_date: "",
    end_date: "",
    page: 1,
    per_page: 10,
    sort_by: "revenue",
    sort_direction: "desc",
  };

  // Filters
  const [filters, setFilters] = useState(initialFilters);

  // Debounced search term for the main table search
  const [searchTerm, setSearchTerm] = useState("");
  
  // Custom dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchDropdownQuery, setSearchDropdownQuery] = useState("");
  
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchCategoryQuery, setSearchCategoryQuery] = useState("");

  const fetchProductsList = async () => {
    try {
      const res = await getAllProducts({ per_page: 999, status: 'all' }, true);
      const list = res.data?.data || res.data;
      setProducts(Array.isArray(list) ? list : []);

      const catRes = await getAllCategories({ per_page: 999, status: 'all' }, true);
      const catList = catRes.data?.data || catRes.data;
      setCategories(Array.isArray(catList) ? catList : []);
    } catch (error) {
      console.error("Error fetching products or categories", error);
      setError("Failed to fetch products or categories");
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Skip global loading if we already have initial data
      const res = await getProductReport(filters, !initialLoad);
      setData(res.data);
      setError("");
      if (initialLoad) setInitialLoad(false);
    } catch (error) {
      console.error("Error fetching product report", error);
      setError("Failed to fetch product report data");
    } finally {
      setLoading(false);
    }
  }, [filters, initialLoad]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "category_id") {
      setFilters({ ...filters, category_id: value, product_id: "all", page: 1 });
    } else {
      setFilters({ ...filters, [name]: value, page: 1 });
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilters({ ...initialFilters, page: 1, per_page: 10 });
  };

  const handleExport = async () => {
    try {
      const res = await exportProductReport(filters);
      
      // Handle file download from blob
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Product_Detailed_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed", error);
    }
  };

  const filteredDropdownProducts = products
    .filter((p) => p.name.toLowerCase().includes(searchDropdownQuery.toLowerCase()))
    .filter((p) => filters.category_id === "all" || p.category_id == filters.category_id)
    .slice(0, 10);

  const selectedProduct = products.find((p) => p.product_id === filters.product_id);
  const selectedProductName =
    filters.product_id === "all"
      ? "All Products"
      : selectedProduct
      ? selectedProduct.name + (selectedProduct.deleted_at ? " (Deleted)" : (!selectedProduct.is_active ? " (Inactive)" : ""))
      : "All Products";

  const filteredCategories = categories
    .filter((c) => c.name.toLowerCase().includes(searchCategoryQuery.toLowerCase()))
    .slice(0, 10);

  const selectedCategory = categories.find((c) => c.category_id === (filters.category_id === "all" ? filters.category_id : Number(filters.category_id)) || String(c.category_id) === String(filters.category_id));
  const selectedCategoryName =
    filters.category_id === "all"
      ? "All Categories"
      : selectedCategory
      ? selectedCategory.name + (selectedCategory.deleted_at ? " (Deleted)" : (!selectedCategory.is_active ? " (Inactive)" : ""))
      : "All Categories";

  const columns = [
    {
      header: "Product Name",
      accessor: "name",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 font-bold text-sm tracking-tighter group-hover:bg-white group-hover:text-teal-600 transition border border-gray-100">
            {row.name.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-bold text-gray-800 group-hover:text-teal-700 transition">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: "category",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-gray-500 font-medium px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg">
          {row.category}
        </span>
      ),
    },
    {
      header: "Sold Units",
      accessor: "sold",
      sortable: true,
      className: "text-left min-w-[150px]",
      render: (row) => (
        <div className="flex flex-col gap-1 py-1">
          <span className="text-sm font-bold text-gray-900 mb-0.5">
            Total: {row.sold.toLocaleString()}
          </span>
          <div className="flex flex-wrap gap-1">
            {row.size_stats && row.size_stats.length > 0 ? (
              row.size_stats.map((s) => {
                return (
                  <span
                    key={s.size_id}
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-100"
                    title={s.name}
                  >
                    {s.name}: {s.qty}
                  </span>
                );
              })
            ) : (
              <span className="text-[10px] text-gray-400 italic">No sales recorded</span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Revenue",
      accessor: "revenue",
      sortable: true,
      className: "text-center",
      render: (row) => (
        <span className="text-sm font-bold text-emerald-600">
          {row.revenue}
        </span>
      ),
    },
  ];



  return (
    <div className="p-4 space-y-6 bg-gray-50/50 min-h-screen relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Product Analytics
          </h1>
          <p className="text-gray-500 text-sm">
            Deep dive into item performance and category trends
          </p>
        </div>
          <button
            onClick={handleExport}
            disabled={!data?.performance?.data || data.performance.data.length === 0}
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition shadow-sm ${
              (!data?.performance?.data || data.performance.data.length === 0)
                ? "bg-gray-400 cursor-not-allowed opacity-70"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            <FontAwesomeIcon icon={faDownload} />
            Export
          </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-gray-400 text-sm font-semibold uppercase tracking-wider mr-2">
          <FontAwesomeIcon icon={faFilter} size="xs" />
          <span>Filters:</span>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 min-w-[180px] text-left flex justify-between items-center"
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

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 min-w-[180px] text-left flex justify-between items-center"
          >
            <span className="truncate">{selectedProductName}</span>
            <FontAwesomeIcon 
              icon={faChevronDown} 
              className={`text-[10px] text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
              <div className="absolute top-full mt-2 w-full min-w-[220px] bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-2 max-h-60 overflow-hidden flex flex-col">
                <div className="px-2 pb-2 border-b border-gray-50">
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={searchDropdownQuery}
                    onChange={(e) => setSearchDropdownQuery(e.target.value)}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto flex-1">
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                    onClick={() => {
                      setFilters({ ...filters, product_id: 'all', page: 1 });
                      setIsDropdownOpen(false);
                      setSearchDropdownQuery("");
                    }}
                  >
                    All Products
                  </button>
                  {filteredDropdownProducts.map((p) => (
                    <button
                      key={p.product_id}
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex justify-between items-center"
                      onClick={() => {
                        setFilters({ ...filters, product_id: p.product_id, page: 1 });
                        setIsDropdownOpen(false);
                        setSearchDropdownQuery("");
                      }}
                    >
                      <span>
                        {p.name}
                        {p.deleted_at && <span className="ml-1 text-red-500 text-xs">(Deleted)</span>}
                        {!p.deleted_at && !p.is_active && <span className="ml-1 text-orange-500 text-xs">(Inactive)</span>}
                      </span>
                    </button>
                  ))}
                  {filteredDropdownProducts.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-400 text-center">No products found</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <input
            type="date"
            name="start_date"
            value={filters.start_date}
            onChange={handleFilterChange}
            className="bg-transparent text-sm font-medium text-gray-700 outline-none"
          />
          <FontAwesomeIcon
            icon={faChevronRight}
            className="text-[10px] text-gray-400"
          />
          <input
            type="date"
            name="end_date"
            value={filters.end_date}
            onChange={handleFilterChange}
            className="bg-transparent text-sm font-medium text-gray-700 outline-none"
          />
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all text-sm font-medium"
            title="Reset Filters"
          >
            <FontAwesomeIcon icon={faEraser} />
            <span>Reset</span>
          </button>
          <button
            onClick={fetchProducts}
            className="p-2 text-gray-400 hover:text-emerald-600 transition"
            title="Refresh"
          >
            <FontAwesomeIcon
              icon={faSync}
              className={loading && !initialLoad ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Local Loading Overlay */}
        {loading && !initialLoad && (
          <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-2 translate-y-[-10%]">
              <FontAwesomeIcon
                icon={faSync}
                spin
                className="text-teal-500 text-3xl"
              />
              <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">
                Searching...
              </span>
            </div>
          </div>
        )}

        <div
          className={
            loading && !initialLoad
              ? "opacity-50 transition-all duration-200 blur-[1px]"
              : "transition-all duration-200"
          }
        >
          {/* Mini Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {data &&
              data.stats.map((stat, idx) => (
                <KPICard key={idx} title={stat.title} value={stat.value} desc={stat.desc} />
              ))}
          </div>

          {/* Product Performance Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faChartPie} className="text-teal-500" />
                Performance Rankings
              </h3>
            </div>
            {/* ERROR */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}
            <DataTable
              columns={columns}
              data={data?.performance?.data || []}
              loading={loading}
              searchPlaceholder="Search products by name"
              onSearch={(search) => setSearchTerm(search)}
              showUpdatingOverlay={false}
              serverSide={true}
              paginationData={data?.performance}
              onPageChange={(page) => setFilters({ ...filters, page })}
              onRowsPerPageChange={(per_page) =>
                setFilters({ ...filters, per_page, page: 1 })
              }
              onSort={(sort_by, sort_direction) =>
                setFilters({ ...filters, sort_by, sort_direction, page: 1 })
              }
              searchValue={searchTerm}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReport;
