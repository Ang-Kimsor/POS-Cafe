import { useState, useEffect, useCallback } from "react";
import { getSalesReport, exportSalesReport } from "../../../api/reportApi";
import { getAllAdmins } from "../../../api/adminApi";
import { getAllCashiers } from "../../../api/cashierApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faFilter,
  faSync,
  faChevronRight,
  faEraser,
} from "@fortawesome/free-solid-svg-icons";
import KPICard from "../../../components/admins/KPICard";
import DataTable from "../../../components/common/DataTable";

const SalesReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [error, setError] = useState("");
  const [cashiers, setCashiers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const initialFilters = {
    start_date: "",
    end_date: "",
    payment_method: "all",
    cashier_id: "all",
    page: 1,
    per_page: 10,
    search: "",
    sort_by: "created_at",
    sort_direction: "desc",
  };

  // Filters
  const [filters, setFilters] = useState(initialFilters);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      // Skip global loading if we already have initial data
      const res = await getSalesReport(filters, !initialLoad);
      setData(res.data);
      setError("");
      if (initialLoad) setInitialLoad(false);
    } catch (error) {
      console.error("Error fetching sales report", error);
      setError("Failed to fetch sales report data");
    } finally {
      setLoading(false);
    }
  }, [filters, initialLoad]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  useEffect(() => {
    const fetchCashiers = async () => {
      try {
        const [adminRes, cashierRes] = await Promise.all([
          getAllAdmins({ per_page: 999, include_superadmin: true }, true),
          getAllCashiers({ per_page: 999 }, true)
        ]);
        const admins = adminRes.data?.data || adminRes.data || [];
        const cashiers = cashierRes.data?.data || cashierRes.data || [];
        setCashiers([...(Array.isArray(admins) ? admins : []), ...(Array.isArray(cashiers) ? cashiers : [])]);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchCashiers();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters({ ...initialFilters, page: 1, per_page: 10 });
    setResetKey((prev) => prev + 1);
  };

  const handleExport = async () => {
    try {
      const res = await exportSalesReport(filters);
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Detailed_Sales_Report_${filters.start_date || 'all'}_to_${filters.end_date || 'all'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed", error);
    }
  };

  const filteredCashiers = cashiers
    .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 10);

  const selectedCashier = cashiers.find(
    (c) => c.user_id === filters.cashier_id || c.id === filters.cashier_id
  );
  const selectedCashierName =
    filters.cashier_id === "all"
      ? "All Users"
      : selectedCashier
      ? `${selectedCashier.name} (${selectedCashier.role})`
      : "All Users";

  const columns = [
    {
      header: "Invoice ID",
      accessor: "id",
      sortable: true,
      className: "font-bold text-teal-600",
    },
    {
      header: "Cashier",
      accessor: "cashier",
      sortable: true,
      className: "text-gray-600",
    },
    {
      header: "Date & Time",
      accessor: "date",
      sortable: true,
      className: "text-gray-400 text-xs font-medium",
    },
    {
      header: "Amount",
      accessor: "amount",
      sortable: true,
      className: "font-bold text-gray-900",
    },
    {
      header: "Method",
      accessor: "method",
      sortable: false,
      render: (row) => (
        <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded text-[10px] font-bold uppercase">
          {row.method}
        </span>
      ),
    },
  ];



  return (
    <div className="p-4 space-y-6 bg-gray-50/50 min-h-screen relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales Report</h1>
          <p className="text-gray-500 text-sm">
            Monitor your shop revenue and transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={!data?.transactions?.data || data.transactions.data.length === 0}
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition shadow-sm ${
              (!data?.transactions?.data || data.transactions.data.length === 0)
                ? "bg-gray-400 cursor-not-allowed opacity-70"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            <FontAwesomeIcon icon={faDownload} />
            Export
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-gray-400 text-sm font-semibold uppercase tracking-wider mr-2">
          <FontAwesomeIcon icon={faFilter} size="xs" />
          <span>Filters:</span>
        </div>
        <select
          name="payment_method"
          value={filters.payment_method}
          onChange={handleFilterChange}
          className="custom-select w-[150px]"
        >
          <option value="all">All Payments</option>
          <option value="cash">Cash</option>
          <option value="qr">QR</option>
        </select>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="custom-select w-[150px] flex items-center text-left"
          >
            <span className="truncate w-full">{selectedCashierName}</span>
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
              <div className="absolute top-full mt-2 w-full min-w-[200px] bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-2 max-h-60 overflow-hidden flex flex-col">
                <div className="px-2 pb-2 border-b border-gray-50">
                  <input
                    type="text"
                    placeholder="Search user..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto flex-1">
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                    onClick={() => {
                      setFilters({ ...filters, cashier_id: 'all', page: 1 });
                      setIsDropdownOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    All Users
                  </button>
                  {filteredCashiers.map(cashier => (
                    <button
                      key={cashier.user_id || cashier.id}
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 flex justify-between items-center"
                      onClick={() => {
                        setFilters({ ...filters, cashier_id: cashier.user_id || cashier.id, page: 1 });
                        setIsDropdownOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      <span>{cashier.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        cashier.role === "superadmin"
                          ? "bg-amber-100 text-amber-800"
                          : cashier.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {cashier.role}
                      </span>
                    </button>
                  ))}
                  {filteredCashiers.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-400 text-center">No users found</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
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
            onClick={fetchSales}
            className="p-2 text-gray-400 hover:text-teal-600 transition shadow-sm bg-white rounded-lg border border-gray-100"
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
                className="text-teal-600 text-3xl"
              />
              <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">
                Updating...
              </span>
            </div>
          </div>
        )}

        <div
          className={
            loading && !initialLoad
              ? "opacity-50 transition-all duration-200"
              : "transition-all duration-200"
          }
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {data &&
              data.summary.map((item, idx) => (
                <KPICard key={idx} title={item.title} value={item.value} />
              ))}
          </div>

          {/* Main Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Transactions Ledger</h3>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <DataTable
              key={resetKey}
              columns={columns}
              data={data?.transactions?.data || []}
              loading={loading}
              showUpdatingOverlay={false}
              searchPlaceholder="Search invoice by number or user..."
              onSearch={(search) => setFilters({ ...filters, search, page: 1 })}
              serverSide={true}
              paginationData={data?.transactions}
              onPageChange={(page) => setFilters({ ...filters, page })}
              onRowsPerPageChange={(per_page) =>
                setFilters({ ...filters, per_page, page: 1 })
              }
              onSort={(sort_by, sort_direction) =>
                setFilters({ ...filters, sort_by, sort_direction, page: 1 })
              }
              searchValue={filters.search}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
