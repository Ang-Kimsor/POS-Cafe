import { useState, useMemo, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faSort,
  faSortUp,
  faSortDown,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faSync,
} from "@fortawesome/free-solid-svg-icons";

const DataTable = ({
  columns,
  data = [],
  initialRowsPerPage = 10,
  searchPlaceholder = "Search...",
  loading = false,
  emptyMessage = "No data found",
  showUpdatingOverlay = true,
  // New props for server-side pagination
  serverSide = false,
  paginationData = null,
  onPageChange = null,
  onRowsPerPageChange = null,
  onSearch = null,
  searchValue = "",
  onSort = null,
}) => {
  const [searchTerm, setSearchTerm] = useState(searchValue);

  useEffect(() => {
    setSearchTerm(searchValue);
  }, [searchValue]);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  const [localRowsPerPage, setLocalRowsPerPage] = useState(initialRowsPerPage);

  const isFirstRender = useRef(true);

  // Handle server-side search debounce
  useEffect(() => {
    if (!serverSide || !onSearch) return;

    // Skip the initial effect call on mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Don't trigger search if it's already the same as what the parent provided
    if (searchTerm === searchValue) return;

    const handler = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, serverSide, onSearch, searchValue]);

  // Determine which values to use (local or server)
  const currentPage =
    serverSide && paginationData
      ? paginationData.current_page
      : localCurrentPage;
  const rowsPerPage =
    serverSide && paginationData ? paginationData.per_page : localRowsPerPage;
  const totalEntries =
    serverSide && paginationData
      ? paginationData.total
      : data
        ? data.length
        : 0;
  const totalPages =
    serverSide && paginationData
      ? paginationData.last_page
      : Math.ceil((data ? data.length : 0) / rowsPerPage);

  // HANDLE SEARCHING (Client-side only)
  const filteredData = useMemo(() => {
    if (serverSide) return data; // Data is already filtered/paginated from server
    if (!searchTerm) return data;

    return data.filter((item) => {
      return columns.some((col) => {
        const value =
          typeof col.accessor === "function"
            ? col.accessor(item)
            : item[col.accessor];

        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns, serverSide]);

  // HANDLE SORTING (Client-side only)
  const sortedData = useMemo(() => {
    if (serverSide) return filteredData;
    const sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const col = columns.find(
          (c) => c.accessor === sortConfig.key || c.header === sortConfig.key,
        );
        const aValue =
          typeof col?.accessor === "function"
            ? col.accessor(a)
            : a[col?.accessor];
        const bValue =
          typeof col?.accessor === "function"
            ? col.accessor(b)
            : b[col?.accessor];

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig, columns, serverSide]);

  // HANDLE PAGINATION (Client-side only)
  const paginatedData = useMemo(() => {
    if (serverSide) return sortedData;
    const startIndex = (localCurrentPage - 1) * localRowsPerPage;
    return sortedData.slice(startIndex, startIndex + localRowsPerPage);
  }, [sortedData, localCurrentPage, localRowsPerPage, serverSide]);

  const handleSort = (column) => {
    if (!column.sortable) return;

    // Determine the key to sort by. Use sortKey if provided, otherwise use accessor.
    // If accessor is a function, we MUST have a sortKey for server-side sorting.
    const key =
      column.sortKey ||
      (typeof column.accessor === "string" ? column.accessor : null);

    if (!key) {
      console.warn(
        "Sorting failed: No sortKey provided for a functional accessor.",
      );
      return;
    }

    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    if (serverSide && onSort) {
      onSort(key, direction);
    }
  };

  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    if (serverSide && onPageChange) {
      onPageChange(pageNumber);
    } else {
      setLocalCurrentPage(pageNumber);
    }
  };

  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = Number(e.target.value);
    if (serverSide && onRowsPerPageChange) {
      onRowsPerPageChange(newRowsPerPage);
    } else {
      setLocalRowsPerPage(newRowsPerPage);
      setLocalCurrentPage(1);
    }
  };

  return (
    <div className="w-full">
      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Show</span>
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="custom-select w-20"
          >
            {[5, 10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>entries</span>
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              if (!serverSide) {
                setLocalCurrentPage(1);
              }
            }}
            disabled={loading}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#087467] transition-all shadow-sm"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white relative">
        {/* Loading Overlay for updates */}
        {loading &&
          showUpdatingOverlay &&
          paginatedData &&
          paginatedData.length > 0 && (
            <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-200">
              <div className="flex flex-col items-center gap-2 translate-y-[-5%]">
                <FontAwesomeIcon
                  icon={faSync}
                  spin
                  className="text-[#087467] text-2xl"
                />
                <span className="text-[10px] font-bold text-[#087467] uppercase tracking-widest">
                  Updating...
                </span>
              </div>
            </div>
          )}

        <table className="w-full text-sm text-left">
          <thead className="bg-[#087467] text-white">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(col)}
                  className={`p-4 font-semibold text-white! whitespace-nowrap group ${
                    col.sortable
                      ? "cursor-pointer select-none hover:bg-[#07564d] transition-colors"
                      : ""
                  } ${col.className || ""}`}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && (
                      <span className="text-[10px] opacity-0 group-hover:opacity-70">
                        {sortConfig.key ===
                        (col.sortKey ||
                          (typeof col.accessor === "string"
                            ? col.accessor
                            : null)) ? (
                          sortConfig.direction === "asc" ? (
                            <FontAwesomeIcon icon={faSortUp} />
                          ) : (
                            <FontAwesomeIcon icon={faSortDown} />
                          )
                        ) : (
                          <FontAwesomeIcon icon={faSort} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-slate-100 ${loading && paginatedData && paginatedData.length > 0 ? "opacity-50" : ""}`}
          >
            {loading && (!paginatedData || paginatedData.length === 0) ? (
              <tr>
                <td colSpan={columns.length} className="p-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <span className="animate-pulse">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData && paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-emerald-50 transition-colors duration-150"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`p-4 text-gray-700 ${col.className || ""}`}
                    >
                      {col.render
                        ? col.render(row)
                        : typeof col.accessor === "function"
                          ? col.accessor(row)
                          : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-12 text-center text-slate-400 italic"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER / PAGINATION */}
      <div className="mt-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-500 font-medium">
          Showing {totalEntries === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}{" "}
          to {Math.min(currentPage * rowsPerPage, totalEntries)} of{" "}
          {totalEntries} entries
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-[#087467] hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="First Page"
            >
              <FontAwesomeIcon icon={faAngleDoubleLeft} className="text-xs" />
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-[#087467] hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Previous Page"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
            </button>

            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2)
                  pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                      currentPage === pageNum
                        ? "bg-[#087467] text-white"
                        : "text-gray-600 hover:bg-emerald-50 hover:text-[#087467]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-[#087467] hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Next Page"
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-[#087467] hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Last Page"
            >
              <FontAwesomeIcon icon={faAngleDoubleRight} className="text-xs" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
