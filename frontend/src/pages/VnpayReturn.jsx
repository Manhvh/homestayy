import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const formatVnpPayDate = (payDate) => {
  if (!payDate || String(payDate).length < 14) return "";
  const s = String(payDate);
  return `${s.slice(6, 8)}/${s.slice(4, 6)}/${s.slice(0, 4)} ${s.slice(8, 10)}:${s.slice(10, 12)}:${s.slice(12, 14)}`;
};

const VnpayReturn = () => {
  const location = useLocation();
  const { axios, navigate, currency } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;
    const verifyPayment = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/payments/vnpay/return${location.search}`);
        if (active) {
          setResult(data);
        }
      } catch (error) {
        if (active) {
          setResult({
            success: false,
            code: error.response?.data?.code || "99",
            message:
              error.response?.data?.message ||
              "Không thể xác thực kết quả giao dịch thanh toán VNPay.",
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (location.search) {
      verifyPayment();
    } else {
      setResult({
        success: false,
        code: "99",
        message: "Thiếu thông tin tham số giao dịch trả về từ VNPay.",
      });
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [axios, location.search]);

  if (loading) {
    return (
      <div className="min-h-[75vh] pt-32 pb-20 px-4 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm font-semibold text-gray-700">
          Đang xác thực chữ ký bảo mật VNPay (HMAC-SHA512)...
        </p>
      </div>
    );
  }

  const isSuccess = Boolean(result?.success);
  const payment = result?.payment || {};
  const booking = result?.booking || null;

  return (
    <div className="min-h-[80vh] pt-32 pb-20 px-4 flex items-center justify-center bg-gray-50/70">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Top Banner */}
        <div
          className={`p-8 text-center text-white ${
            isSuccess
              ? "bg-gradient-to-r from-emerald-600 to-teal-600"
              : "bg-gradient-to-r from-rose-600 to-red-600"
          }`}
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl font-bold mb-3">
            {isSuccess ? "✓" : "✕"}
          </div>
          <h1 className="text-2xl font-bold font-playfair">
            {isSuccess ? "Thanh Toán VNPay Thành Công!" : "Thanh Toán Chưa Hoàn Tất"}
          </h1>
          <p className="text-sm text-white/90 mt-1.5">{result?.message}</p>
        </div>

        {/* Receipt Details */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2.5 text-sm">
            {booking && (
              <>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Mã đơn đặt phòng:</span>
                  <strong className="font-mono text-gray-900">
                    #{booking.bookingCode || booking.id}
                  </strong>
                </div>
                {booking.hotel?.name && (
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500">Homestay:</span>
                    <strong className="text-gray-900 text-right">{booking.hotel.name}</strong>
                  </div>
                )}
                {booking.room?.roomType && (
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500">Loại phòng:</span>
                    <span className="font-medium text-gray-800">{booking.room.roomType}</span>
                  </div>
                )}
              </>
            )}

            {payment.transactionRef && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-500">Mã tham chiếu (TxnRef):</span>
                <span className="font-mono text-xs font-semibold text-gray-800">
                  {payment.transactionRef}
                </span>
              </div>
            )}

            {payment.transactionNo && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-500">Mã giao dịch VNPay:</span>
                <span className="font-mono text-xs font-semibold text-gray-800">
                  {payment.transactionNo}
                </span>
              </div>
            )}

            {payment.bankCode && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-500">Ngân hàng:</span>
                <span className="font-semibold text-gray-800">{payment.bankCode}</span>
              </div>
            )}

            {payment.payDate && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-500">Thời gian thanh toán:</span>
                <span className="font-medium text-gray-800">
                  {formatVnpPayDate(payment.payDate)}
                </span>
              </div>
            )}

            <div className="flex justify-between gap-2">
              <span className="text-gray-500">Mã phản hồi VNPay:</span>
              <span className="font-mono font-bold text-gray-800">{result?.code || "N/A"}</span>
            </div>

            {payment.amount > 0 && (
              <div className="pt-2.5 mt-1 border-t border-gray-200 flex justify-between items-baseline">
                <span className="font-bold text-gray-800">Số tiền giao dịch:</span>
                <span
                  className={`text-lg font-extrabold ${
                    isSuccess ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {Number(payment.amount).toLocaleString("vi-VN")} {currency}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate("/my-bookings")}
              className="flex-1 py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition cursor-pointer"
            >
              Xem lịch sử đặt phòng
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 py-3 px-5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold rounded-xl text-sm transition cursor-pointer"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VnpayReturn;
