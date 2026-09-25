import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  getAllOrders,
  deleteOrder,
  getOneOrder,
  markOrderPaid,
  markOrderPending,
  generateAdminKHQR,
  checkAdminKHQRPayment,
} from "../../../api/orderApi";
import { InvoiceModal, KHQRPaymentModal } from "../../../components/common";
import {
  faTrash,
  faPrint,
  faCheck,
  faUndo,
  faQrcode,
  faFilter,
  faSync,
  faEraser,
} from "@fortawesome/free-solid-svg-icons";
import { formatDateTime } from "../../../utils/dateHelper";
import DataTable from "../../../components/common/DataTable";

const ViewAll = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState("");
  const [printingOrder, setPrintingOrder] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [backgroundQRs, setBackgroundQRs] = useState([]);
  const [resetKey, setResetKey] = useState(0);

  const initialFilters = {
    status: "all",
    start_date: "",
    end_date: "",
    search: "",
    sort_by: "order_id",
    sort_direction: "desc",
  };

  const [filters, setFilters] = useState({
    ...initialFilters,
    page: 1,
    per_page: 10,
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getAllOrders(filters, !initialLoad);
      setOrders(res.data.data);
      setPagination(res.data);
      if (initialLoad) setInitialLoad(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [filters, initialLoad]);

  const handleFetchAndPrint = async (orderId) => {
    try {
      const res = await getOneOrder(orderId);
      setPrintingOrder(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch order details", "error");
    }
  };

  const handleMarkPaid = async (id) => {
    const result = await Swal.fire({
      title: "Mark as Paid?",
      text: "Are you sure this order is fully paid?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#087467",
      confirmButtonText: "Yes, Paid!",
    });

    if (result.isConfirmed) {
      try {
        await markOrderPaid(id);
        Swal.fire({
          icon: "success",
          title: "Paid!",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchOrders();
      } catch {
        Swal.fire("Error", "Action failed", "error");
      }
    }
  };

  const handleMarkPending = async (id) => {
    const result = await Swal.fire({
      title: "Mark as Pending?",
      text: "Revert this order's status to pending?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#eab308",
      confirmButtonText: "Yes, Pending",
    });

    if (result.isConfirmed) {
      try {
        await markOrderPending(id);
        Swal.fire({
          icon: "success",
          title: "Pending!",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchOrders();
      } catch {
        Swal.fire("Error", "Action failed", "error");
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This order will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteOrder(id);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchOrders();
      } catch {
        Swal.fire("Error", "Delete failed", "error");
      }
    }
  };

  const handleShowKHQR = async (order) => {
    try {
      const res = await generateAdminKHQR({
        amount: order.final_price,
        invoice_code: order.invoice_code,
      });

      setQrData({
        order: order,
        qr: res.data.qr,
        md5: res.data.md5,
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to generate QR code", "error");
    } finally {
      // Done
    }
  };

  const handleReset = () => {
    setFilters({ ...initialFilters, page: 1, per_page: 10 });
    setResetKey(prev => prev + 1);
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (backgroundQRs.length === 0) return;

    const interval = setInterval(async () => {
      for (const qr of backgroundQRs) {
        try {
          const res = await checkAdminKHQRPayment({ md5: qr.md5, order_id: qr.order.order_id });
          if (res.data.paid) {
            setBackgroundQRs((prev) => prev.filter((q) => q.md5 !== qr.md5));
            Swal.fire({
              icon: "success",
              title: "Payment Received!",
              text: `Order ${qr.order.invoice_code} has been paid successfully in the background.`,
              toast: true,
              position: "top-end",
              timer: 5000,
              showConfirmButton: false,
            });
            fetchOrders();
          }
        } catch (err) {
          console.error("Background QR check failed", err);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [backgroundQRs, fetchOrders]);

  const columns = [
    {
      header: "Invoice",
      accessor: "invoice_code",
      sortable: true,
      className: "font-bold text-gray-900",
    },
    {
      header: "Date",
      accessor: "created_at",
      sortable: true,
      render: (row) => formatDateTime(row.created_at),
    },
    {
      header: "Subtotal",
      accessor: "total_price",
      sortable: true,
      render: (row) => `$${parseFloat(row.total_price || 0).toFixed(2)}`,
    },
    {
      header: "Discount",
      accessor: "discount",
      sortable: true,
      render: (row) => <span className="text-rose-600">-${parseFloat(row.discount || 0).toFixed(2)}</span>,
    },
    {
      header: "Tax",
      accessor: "tax_amount",
      sortable: true,
      render: (row) => <span className="text-emerald-600">+${parseFloat(row.tax_amount || 0).toFixed(2)}</span>,
    },
    {
      header: "Final Price",
      accessor: "final_price",
      sortable: true,
      className: "font-semibold text-[#087467]",
      render: (row) => `$${parseFloat(row.final_price).toFixed(2)}`,
    },
    { header: "Payment", accessor: "payment_method", sortable: false },
    {
      header: "Status",
      accessor: "status",
      sortable: false,
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${row.status === "pending"
            ? "bg-amber-50 text-amber-600 border-amber-100"
            : row.status === "cancelled"
              ? "bg-rose-50 text-rose-600 border-rose-100"
              : "bg-emerald-50 text-emerald-600 border-emerald-100"
            }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      header: "Cashier",
      accessor: (row) => row.cashier?.name || "N/A",
      sortKey: "cashier_id",
      sortable: true,
      className: "text-xs",
    },
    {
      header: "Action",
      accessor: "action",
      sortable: false,
      className: "text-right w-44",
      render: (row) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => handleFetchAndPrint(row.order_id)}
            className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-600 hover:text-white transition-all duration-200 shadow-sm"
            title="Print Invoice"
          >
            <FontAwesomeIcon icon={faPrint} className="text-xs" />
          </button>

          {row.status === "pending" && (
            <>
              <button
                onClick={() => handleMarkPaid(row.order_id)}
                className="w-8 h-8 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all duration-200 shadow-sm"
                title="Mark Paid"
              >
                <FontAwesomeIcon icon={faCheck} className="text-xs" />
              </button>

              {row.payment_method === "qr" && (
                <button
                  onClick={() => handleShowKHQR(row)}
                  className="w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-200 shadow-sm"
                  title="Show KHQR"
                >
                  <FontAwesomeIcon icon={faQrcode} className="text-xs" />
                </button>
              )}
            </>
          )}

          {row.status === "cancelled" && (
            <button
              onClick={() => handleMarkPending(row.order_id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 shadow-sm bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
              title="Restore to Pending"
            >
              <FontAwesomeIcon icon={faUndo} className="text-xs" />
            </button>
          )}

          {row.status === "pending" && (
            <button
              onClick={() => handleDelete(row.order_id)}
              className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all duration-200 shadow-sm"
              title="Delete Order"
            >
              <FontAwesomeIcon icon={faTrash} className="text-xs" />
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage all customer transactions</p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm font-semibold uppercase tracking-wider mr-2">
            <FontAwesomeIcon icon={faFilter} size="xs" />
            <span>Filters:</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Status</span>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="custom-select block w-40 transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Start Date</span>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              className="block w-44 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-700"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">End Date</span>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              className="block w-44 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-gray-700"
            />
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
              onClick={fetchOrders}
              className="p-2 text-gray-400 hover:text-emerald-600 transition-all"
              title="Refresh"
            >
              <FontAwesomeIcon icon={faSync} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <DataTable
          key={resetKey}
          columns={columns}
          data={orders}
          loading={loading}
          searchPlaceholder="Search orders by invoice code, cashier..."
          serverSide={true}
          paginationData={pagination}
          onPageChange={(page) => setFilters({ ...filters, page })}
          onRowsPerPageChange={(per_page) => setFilters({ ...filters, per_page, page: 1 })}
          onSearch={(search) => setFilters({ ...filters, search, page: 1 })}
          onSort={(sort_by, sort_direction) => setFilters({ ...filters, sort_by, sort_direction, page: 1 })}
          searchValue={filters.search}
        />
      </div>

      {printingOrder && (
        <InvoiceModal
          isOpen={!!printingOrder}
          onClose={() => setPrintingOrder(null)}
          order={printingOrder}
        />
      )}

      {qrData && (
        <KHQRPaymentModal
          order={qrData.order}
          qrData={qrData}
          checkFunction={checkAdminKHQRPayment}
          onSuccess={() => {
            setQrData(null);
            fetchOrders();
          }}
          onCancel={() => {
            setBackgroundQRs((prev) => [...prev, qrData]);
            setQrData(null);
          }}
        />
      )}

    </div>
  );
};

export default ViewAll;
