import { useEffect, useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import Swal from "sweetalert2";

const KHQRPaymentModal = ({
  order,
  qrData,
  onSuccess,
  onCancel,
  checkFunction,
}) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [dots, setDots] = useState("");
  const [checking, setChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    if (checking || !qrData?.md5) return;
    setChecking(true);
    try {
      // Use the passed check function (role-aware)
      const res = await checkFunction({
        md5: qrData.md5,
        order_id: order.order_id,
      });

      if (res.data.paid) {
        setIsVerifying(false);

        Swal.fire({
          icon: "success",
          title: "Payment Verified!",
          text: "The payment has been received successfully.",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });

        setTimeout(() => {
          onSuccess();
        }, 1000);
        return true;
      }
    } catch (err) {
      console.error("Error checking payment:", err);
    } finally {
      setChecking(false);
    }
    return false;
  }, [checking, qrData?.md5, order?.order_id, checkFunction, onSuccess]);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    // Polling every 5 seconds
    const pollInterval = setInterval(async () => {
      const isPaid = await checkStatus();
      if (isPaid) {
        clearInterval(pollInterval);
        clearInterval(dotInterval);
      }
    }, 5000);
    return () => {
      clearInterval(pollInterval);
      clearInterval(dotInterval);
    };
  }, [qrData?.md5, order?.order_id, checkStatus]);

  if (!qrData || !order) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-linear-to-r from-red-600 to-red-800 p-6 text-white text-center relative">
          <div className="absolute top-4 right-4">
            <button
              onClick={onCancel}
              className="text-white/60 hover:text-white transition p-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Bakong KHQR</h2>
          <p className="text-white/80 text-xs mt-1 font-medium">
            Scan to pay securely
          </p>
        </div>

        {/* Amount Section */}
        <div className="p-8 text-center">
          <div className="inline-block bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 mb-6">
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest block mb-1">
              Total Amount
            </span>
            <span className="text-3xl font-black text-gray-900">
              ${parseFloat(order.final_price).toFixed(2)}
            </span>
          </div>

          {/* QR Code Container */}
          <div className="relative group mx-auto w-64 h-64 mb-6">
            <div className="absolute inset-0 bg-red-600/10 blur-3xl rounded-full opacity-60"></div>
            <div className="relative bg-white p-4 rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
              <QRCodeSVG
                value={qrData.qr}
                size={220}
                level="H"
                includeMargin={false}
                className="w-full h-full"
              />

              {/* Scan Overlay Effect */}
              <div className="absolute inset-0 pointer-events-none border-4 border-red-600/20 rounded-3xl"></div>
            </div>
          </div>

          {/* Status info */}
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-gray-700">
                  {isVerifying
                    ? `Waiting for payment${dots}`
                    : "Payment Received!"}
                </span>
              </div>
              {isVerifying && (
                <button
                  onClick={checkStatus}
                  disabled={checking}
                  className="text-[10px] text-teal-600 font-bold uppercase hover:underline disabled:opacity-50 mt-1"
                >
                  {checking ? "Checking..." : "Check Status Manually"}
                </button>
              )}
            </div>

            <div className="bg-gray-50 px-4 py-2 rounded-xl border border-dashed border-gray-200">
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block">
                Invoice Code
              </span>
              <span className="text-[11px] font-mono font-bold text-gray-600">
                {order.invoice_code}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={onCancel}
            className="w-full py-4 px-4 bg-white border-2 border-gray-100 text-gray-400 font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition text-[10px]"
          >
            Cancel & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default KHQRPaymentModal;
