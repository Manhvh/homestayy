import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const VnpaySandboxMock = () => {
  const [searchParams] = useSearchParams();
  const { axios, getToken, currency, navigate } = useAppContext();

  const txnRef = searchParams.get("vnp_TxnRef") || "";
  const amount = Math.round(Number(searchParams.get("vnp_Amount") || 0) / 100);
  const orderInfo = searchParams.get("vnp_OrderInfo") || "Thanh toán đơn đặt phòng HomeStay";
  // const secureHash = searchParams.get("vnp_SecureHash") || "";

  const [bankCode, setBankCode] = useState("NCB");
  const [cardNumber, setCardNumber] = useState("9704198526191432198");
  const [cardHolder, setCardHolder] = useState("NGUYEN VAN A");
  const [issueDate, setIssueDate] = useState("07/15");
  const [processing, setProcessing] = useState(false);

  const handleSimulate = async (responseCode) => {
    if (processing) return;
    try {
      setProcessing(true);
      const token = await getToken();
      const { data } = await axios.post(
        "/api/payments/vnpay/sandbox-simulate",
        {
          txnRef,
          responseCode,
          bankCode,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast.error(data.message || "Không thể hoàn tất mô phỏng VNPay Sandbox.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (!txnRef) {
    return (
      <div className="min-h-[70vh] pt-32 pb-20 px-4 flex flex-col items-center justify-center text-center">
        <p className="text-gray-700 font-bold text-lg mb-2">Phiên thanh toán không hợp lệ</p>
        <button
          type="button"
          onClick={() => navigate("/my-bookings")}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold cursor-pointer"
        >
          Quay lại Lịch sử đặt phòng
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] pt-28 pb-16 px-4 bg-slate-100 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
        {/* VNPay Sandbox Header */}
        <div className="bg-gradient-to-r from-[#005BAA] to-[#0073CE] px-6 py-5 text-white flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight">VNPAY</span>
              <span className="text-[11px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
                SANDBOX SIMULATOR
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Order summary */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Nội dung thanh toán:</span>
              <strong className="text-gray-900">{orderInfo}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mã tham chiếu:</span>
              <span className="font-mono font-bold text-gray-800">{txnRef}</span>
            </div>
            <div className="pt-2 border-t border-blue-200 flex justify-between items-baseline text-sm">
              <span className="font-bold text-gray-800">Số tiền thanh toán:</span>
              <span className="text-xl font-extrabold text-[#005BAA]">
                {amount.toLocaleString("vi-VN")} {currency}
              </span>
            </div>
          </div>

          {/* Test Card Form */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Thông tin thẻ
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Ngân hàng</label>
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  <option value="NCB">Ngân hàng NCB (Thẻ test chuẩn)</option>
                  <option value="VIETCOMBANK">Vietcombank</option>
                  <option value="TECHCOMBANK">Techcombank</option>
                  <option value="MBBANK">MB Bank</option>
                  <option value="VNPAYQR">VNPay QR</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Số thẻ test</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Tên chủ thẻ</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Ngày phát hành</label>
                <input
                  type="text"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              disabled={processing}
              onClick={() => handleSimulate("00")}
              className="flex-1 py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition cursor-pointer"
            >
              {processing ? "Đang xác thực..." : "Thanh toán thành công"}
            </button>
            <button
              type="button"
              disabled={processing}
              onClick={() => handleSimulate("24")}
              className="sm:w-auto py-3.5 px-5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-semibold rounded-xl text-sm transition cursor-pointer disabled:opacity-50"
            >
              Hủy giao dịch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VnpaySandboxMock;
