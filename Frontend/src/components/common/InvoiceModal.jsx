import { useDispatch } from "react-redux";
import { clearOrder } from "../../redux/slices/orderSlice";
import { useEffect, useState } from "react";
import { getSetting, getCashierSetting } from "../../api/settingApi";
import { formatDateTime } from "../../utils/dateHelper";

const InvoiceModal = ({
  order,
  onClose,
  isModal = true,
  clearCart = true,
  header = null,
}) => {
  const dispatch = useDispatch();
  const [settings, setSettings] = useState(null);
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res =
          role == "admin" ? await getSetting() : await getCashierSetting();
        setSettings(res.data);
      } catch (err) {
        console.error("Failed to fetch settings for invoice", err);
      }
    };
    fetchSettings();
  }, [role]);

  if (!order) return null;

  const handleClose = () => {
    if (clearCart) {
      dispatch(clearOrder());
    }
    if (onClose) onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  const subtotal = parseFloat(order.total_price) || 0;
  const discount = parseFloat(order.discount) || 0;
  const total = parseFloat(order.final_price) || 0;
  const tax = parseFloat((total - (subtotal - discount)).toFixed(2));

  const content = (
    <div
      className={`bg-white w-full max-w-130 flex flex-col overflow-hidden z-100 ${isModal ? "max-h-[92vh] rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200" : "sm:rounded-2xl shadow-xl border border-gray-100 mx-auto print:shadow-none print:border-none print:rounded-none"}`}
    >
      {/* OPTIONAL HEADER */}
      {header && (
        <div className="px-2 py-4 flex justify-between items-center no-print border-b border-gray-100 bg-white sticky top-0 z-20">
          {header}
        </div>
      )}

      {/* INVOICE CONTENT (SCROLLABLE AREA) */}
      <div
        id="invoice-print-area"
        className="p-5 overflow-y-auto flex-1 custom-scrollbar print:overflow-visible"
      >
        {/* MERCHANT INFO */}
        <div className="text-center mb-8">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="w-20 h-20 object-contain mx-auto mb-3 rounded-2xl"
            onError={(e) => (e.target.style.display = "none")}
          />
          <div className="text-xl font-black text-gray-900 tracking-tighter uppercase mb-1">
            {settings?.shop_name || "Cafe POS System"}
          </div>
        </div>

        {/* QUEUE NUMBER */}
        <div className="flex flex-col items-center mb-6 p-2 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <div className="text-[9px] font-black text-gray-400 uppercase tracking-wide mb-1">
            Waiting Number
          </div>
          <div className="text-3xl font-black text-gray-900 tracking-tighter">
            {order.queue_number || "000"}
          </div>
          <div
            className={`mt-1 text-[15px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
              order.status === "paid"
                ? "text-emerald-600"
                : order.status === "pending"
                  ? "text-amber-600"
                  : "text-rose-600"
            }`}
          >
            {order.status}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="min-w-0">
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Receipt ID
            </div>
            <div className="text-green-600 font-mono text-[11px] font-bold break-all">
              {order.invoice_code}
            </div>
          </div>
          <div className="text-right min-w-0">
            <div className="text-[9px] text-gray-400 font-bold uppercase mb-1">
              Date
            </div>
            <div className="text-[10px] text-gray-800 font-black wrap-break-word">
              {(() => {
                return formatDateTime(order.created_at);
              })()}
            </div>
          </div>
        </div>

        {/* TABLE - STACKED STYLE FROM VIEWEACH */}
        <div className="mb-6">
          <div className="border-b-2 border-gray-900 pb-2 mb-2">
            <div className="flex justify-between text-[9px] uppercase font-black text-gray-900 tracking-widest px-1">
              <span>Description</span>
              <span>Total</span>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {order.order_products?.map((item) => (
              <div key={item.order_product_id} className="py-3 px-1">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="text-xs font-black text-gray-900 uppercase leading-tight">
                      {item.product?.name}
                    </div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase mb-1">
                      {item.size?.size} Size
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium">
                      {item.qty} x $
                      {parseFloat(item.subtotal / item.qty).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-xs font-black text-gray-900 pt-0.5">
                    ${parseFloat(item.subtotal).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REMARK */}
        {order.remark && (
          <div className="mb-6 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Remark
            </div>
            <div className="text-[10px] text-gray-700 font-medium italic">
              "{order.remark}"
            </div>
          </div>
        )}

        {/* TOTALS */}
        <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200">
          <div className="flex flex-col items-end space-y-1.5">
            <div className="flex justify-between w-full text-[11px] text-gray-500">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between w-full text-[11px] text-gray-500">
              <span>
                Tax ({((tax / (subtotal - discount || 1)) * 100).toFixed(0)}%)
              </span>
              <span>${tax.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between w-full text-[11px] text-red-500 font-bold italic">
                <span>Discount</span>
                <span>- ${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between w-full text-sm pt-3 mt-1 border-t border-gray-900">
              <div className="flex flex-col">
                <span className="font-black text-gray-900 uppercase tracking-tighter">
                  Amount Paid
                </span>
                {order.payment_method && (
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                    via {order.payment_method}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span className="font-black text-green-600 text-lg">
                  ${total.toFixed(2)}
                </span>
                <span className="text-lg font-black text-gray-500 -mt-0.5">
                  ៛{(Math.round((total * 4000) / 100) * 100).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-10 text-center pt-6 border-t border-dashed border-gray-200">
          <p className="text-[9px] font-black text-gray-900 uppercase tracking-[0.3em] mb-1">
            Thank You
          </p>
          <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest italic">
            Order #{order.invoice_code.split("-").pop()}
          </p>
          <p className="text-[10px] text-gray-600 font-medium tracking-widest ">
            Wi-Fi: {settings?.wifi_name || "N/A"} <br />
            Password: {settings?.wifi_password || "N/A"}
          </p>
        </div>
      </div>

      {/* FOOTER BUTTONS (NOT PRINTED) */}
      {isModal && (
        <div className="px-6 py-4 flex gap-3 no-print bg-gray-50 border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 border-2 border-teal-500 text-teal-600 font-black uppercase tracking-widest rounded-xl hover:bg-teal-50 transition text-[10px]"
          >
            Print
          </button>
          <button
            onClick={handleClose}
            className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white font-black uppercase tracking-widest rounded-xl transition text-[10px] shadow-lg shadow-teal-500/20"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6 overflow-y-auto">
      {content}
    </div>
  );
};

export default InvoiceModal;
