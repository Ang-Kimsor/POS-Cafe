import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../../components/cashiers/ProductCard";
import OrderList from "../../components/cashiers/OrderList";
import { InvoiceModal, KHQRPaymentModal } from "../../components/common";
import { getAllCategories } from "../../api/categoryApi";
import { getAllProducts } from "../../api/productApi";
import { createOrder, checkAdminKHQRPayment } from "../../api/orderApi";
import { getSetting } from "../../api/settingApi";
import { clearOrder } from "../../redux/slices/orderSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import {
  faBagShopping,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const POS = () => {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [setting, setSetting] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [qrData, setQrData] = useState(null);
  const [backgroundQRs, setBackgroundQRs] = useState([]);
  const [remark, setRemark] = useState("");
  const [showOrderPanel, setShowOrderPanel] = useState(false);

  const { items: orderList, subtotal } = useSelector((state) => state.order);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes, settingRes] = await Promise.all([
          getAllCategories({ status: 'active' }),
          getAllProducts(),
          getSetting(),
        ]);
        setCategories(catRes.data);
        setProducts(prodRes.data);
        setSetting(settingRes.data);
      } catch (error) {
        console.error("Failed to fetch POS data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          }
        } catch (err) {
          console.error("Background QR check failed", err);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [backgroundQRs]);

  const filteredProducts = selectedCategoryId
    ? products.filter((p) => p.category_id === selectedCategoryId)
    : products;

  const handleConfirmOrder = async () => {
    if (orderList.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      const items = orderList.map((item) => ({
        product_id: item.id.toString().split("-")[0],
        size_id: item.id.toString().split("-")[1],
        qty: item.qty,
        price: item.price,
      }));
      const res = await createOrder({
        items,
        payment_method: paymentMethod,
        remark,
      });
      const orderData = res.data.data;

      // Clear the cart immediately after order is saved
      dispatch(clearOrder());
      setRemark("");
      setShowOrderPanel(false);

      if (paymentMethod === "qr") {
        if (res.data.khqr) {
          setQrData({
            order: orderData,
            qr: res.data.khqr.qr,
            md5: res.data.khqr.md5,
          });
        } else {
          // Handle generation failure
          alert(
            "Failed to generate QR code. The order has been saved as pending.",
          );
          setInvoiceOrder(orderData);
        }
      } else {
        setInvoiceOrder(orderData);
      }
    } catch (err) {
      console.error("Order failed:", err);
      alert("Failed to save order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // CALCULATE TOTALS WITH PERCENTAGE BASED DISCOUNT & THRESHOLD
  const threshold = parseFloat(setting?.discount_at || 10);
  const isDiscountEligible =
    Number(setting?.enable_discount) === 1 && subtotal >= threshold;

  const currentDiscountRate = isDiscountEligible
    ? parseFloat(setting?.discount_percent || 0) / 100
    : 0;
  const currentDiscount = subtotal * currentDiscountRate;

  const currentTaxRate = parseFloat(setting?.tax_percent || 10) / 100;
  const currentTax = (subtotal - currentDiscount) * currentTaxRate;
  const currentTotal = subtotal - currentDiscount + currentTax;

  return (
    <>
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
          clearCart={true}
        />
      )}
      {qrData && (
        <KHQRPaymentModal
          order={qrData.order}
          qrData={qrData}
          checkFunction={checkAdminKHQRPayment}
          onSuccess={() => {
            setInvoiceOrder({ ...qrData.order, status: 'paid' });
            setQrData(null);
          }}
          onCancel={() => {
            setBackgroundQRs((prev) => [...prev, qrData]);
            setQrData(null);
          }}
        />
      )}
      <div className="w-full h-[calc(100vh-60px)] flex flex-col">
        <div className="bg-white border-b px-6 py-3 sticky top-0 z-10 flex justify-between items-center gap-4">
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar flex-1">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`px-4 py-1 text-sm whitespace-nowrap rounded-lg transition ${
                selectedCategoryId === null
                  ? "bg-teal-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Items
            </button>

            {loading ? (
              null
            ) : (
              categories.map((cat) => (
                <button
                  key={cat.category_id}
                  onClick={() => setSelectedCategoryId(cat.category_id)}
                  className={`px-4 py-1 text-sm whitespace-nowrap rounded-lg transition ${
                    selectedCategoryId === cat.category_id
                      ? "bg-teal-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))
            )}
          </div>

          {/* MOBILE TOGGLE IN NAVBAR */}
          <button
            onClick={() => setShowOrderPanel(true)}
            className="xl:hidden relative p-2 text-gray-600 hover:text-teal-600 transition-colors"
          >
            <FontAwesomeIcon icon={faBagShopping} size="lg" />
            {orderList.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {orderList.length}
              </span>
            )}
          </button>
        </div>
        <div className="bg-gray-100 flex-1 flex overflow-hidden relative">
          {/* LEFT - PRODUCT GRID */}
          <div className="w-full xl:w-2/3 p-4 md:p-6 grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-4 overflow-y-auto">
            {loading ? (
              <div className="col-span-full flex items-center justify-center h-64 text-gray-400">
                Loading products...
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((item) => (
                <ProductCard key={item.product_id} product={item} />
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center h-64 text-gray-400">
                No products found.
              </div>
            )}
          </div>

          {/* RIGHT - ORDER PANEL */}
          <div
            className={`
            fixed inset-0 z-30 xl:z-0 xl:relative xl:inset-auto
            xl:flex xl:w-1/3 bg-white shadow-2xl xl:shadow-md xl:m-4 flex flex-col xl:rounded-xl overflow-hidden border border-gray-100
            transition-transform duration-300 ease-in-out
            ${showOrderPanel ? "translate-x-0" : "translate-x-full xl:translate-x-0"}
          `}
          >
            {/* HEADER */}
            <div className="px-5 py-4 border-b border-black/10 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                {/* MOBILE CLOSE BUTTON */}
                <button
                  onClick={() => setShowOrderPanel(false)}
                  className="xl:hidden w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
                <h2 className="text-lg font-semibold text-gray-800">Order</h2>
              </div>
              <div className="flex items-center gap-3">
                {orderList.length > 0 && (
                  <button
                    onClick={() => dispatch(clearOrder())}
                    className="text-[10px] text-red-500 hover:text-red-600 font-bold uppercase tracking-wider transition-colors"
                  >
                    Clear Cart
                  </button>
                )}
                <span className="px-2 py-0.5 bg-teal-50 text-teal-600 text-xs font-bold rounded-full">
                  {orderList.length} items
                </span>
              </div>
            </div>

            {/* ORDER LIST (SCROLL AREA) */}
            <div className="px-4 py-3 space-y-1 flex-1 overflow-y-auto">
              {orderList.length > 0 ? (
                orderList.map((item, index) => (
                  <div key={item.id}>
                    <OrderList
                      id={index}
                      length={orderList.length}
                      item={item}
                    />
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-60">
                  <p className="text-sm">Select items to start an order</p>
                </div>
              )}
            </div>

            {/* SUMMARY (FIXED AT BOTTOM) */}
            <div className="border-t border-black/10 px-5 py-4 bg-gray-50/50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-800">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Tax ({setting?.tax_percent || 0}%)</span>
                  <span className="font-medium text-gray-800">
                    ${currentTax.toFixed(2)}
                  </span>
                </div>

                {Number(setting?.enable_discount) === 1 && (
                  <div className="flex justify-between text-red-500 italic">
                    <span>
                      Discount{" "}
                      {subtotal < threshold
                        ? `(Min $${threshold})`
                        : `(${setting?.discount_percent}%)`}
                    </span>
                    <span className="font-medium">
                      - ${currentDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* TOTAL */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <span className="font-semibold text-gray-800">
                  Total Amount
                </span>
                <span className="text-xl font-bold text-teal-600">
                  ${currentTotal.toFixed(2)}
                </span>
              </div>

              {/* REMARK */}
              <div className="mt-4">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 block">
                  Remark
                </span>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Order notes (optional)..."
                  className="w-full px-4 py-2 text-xs border border-gray-200 rounded-xl focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none h-14 bg-white"
                />
              </div>

              {/* PAYMENT METHOD */}
              <div className="mt-5">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-2 block">
                  Payment Method
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all border ${paymentMethod === "cash" ? "bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}
                  >
                    CASH
                  </button>
                  <button
                    onClick={() => setPaymentMethod("qr")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all border ${paymentMethod === "qr" ? "bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}
                  >
                    QR
                  </button>
                </div>
              </div>

              {/* PAY BUTTON */}
              <button
                onClick={handleConfirmOrder}
                disabled={orderList.length === 0 || submitting}
                className={`mt-4 w-full py-3.5 text-md font-bold rounded-xl transition-all shadow-sm ${
                  orderList.length > 0 && !submitting
                    ? "bg-teal-500 hover:bg-teal-600 text-white hover:shadow-md"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                }`}
              >
                {submitting ? "Saving..." : "Checkout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default POS;
