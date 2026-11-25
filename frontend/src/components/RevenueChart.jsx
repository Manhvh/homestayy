import React, { useState, useMemo } from "react";

const formatShortMoney = (value) => {
  const n = Number(value) || 0;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} tr`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
};

const RevenueChart = ({
  data = [],
  currency = "VNĐ",
  title = "Biểu Đồ Doanh Thu 6 Tháng Gần Nhất",
  subtitle = "Thống kê doanh thu từ các đơn đặt phòng đã xác nhận theo từng tháng",
  accent = "blue", // "blue" | "purple"
  onExportCsv,
  exportLabel = "Xuất báo cáo CSV",
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const { maxRevenue, total6mRevenue, total6mConfirmed, total6mPaid } = useMemo(() => {
    const maxVal = safeData.reduce((m, item) => Math.max(m, Number(item.revenue) || 0), 0);
    const totalRev = safeData.reduce((s, item) => s + (Number(item.revenue) || 0), 0);
    const totalConf = safeData.reduce((s, item) => s + (Number(item.confirmedBookings) || 0), 0);
    const totalPaid = safeData.reduce((s, item) => s + (Number(item.paidRevenue) || 0), 0);
    return {
      maxRevenue: maxVal > 0 ? maxVal : 1_000_000,
      total6mRevenue: totalRev,
      total6mConfirmed: totalConf,
      total6mPaid: totalPaid,
    };
  }, [safeData]);

  const barGradient =
    accent === "purple"
      ? "from-purple-600 to-indigo-500"
      : "from-blue-600 to-cyan-500";
  const barHoverGradient =
    accent === "purple"
      ? "from-purple-700 to-indigo-600"
      : "from-blue-700 to-cyan-600";
  const badgeStyle =
    accent === "purple"
      ? "bg-purple-50 text-purple-700 border-purple-200"
      : "bg-blue-50 text-blue-700 border-blue-200";

  const yTicks = [1, 0.75, 0.5, 0.25, 0];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${badgeStyle}`}>
            6 tháng: {total6mRevenue.toLocaleString("vi-VN")} {currency}
          </span>
          {typeof onExportCsv === "function" && (
            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>{exportLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-metrics bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-[11px] font-semibold uppercase text-gray-400">Tổng doanh thu 6 tháng</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5">
            {total6mRevenue.toLocaleString("vi-VN")} {currency}
          </p>
        </div>
        <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <p className="text-[11px] font-semibold uppercase text-emerald-700">Đã thanh toán VNPay</p>
          <p className="text-sm font-bold text-emerald-700 mt-0.5">
            {total6mPaid.toLocaleString("vi-VN")} {currency}
          </p>
        </div>
        <div className="px-3.5 py-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
          <p className="text-[11px] font-semibold uppercase text-blue-700">Đơn đã duyệt (6 tháng)</p>
          <p className="text-sm font-bold text-blue-700 mt-0.5">{total6mConfirmed} đơn xác nhận</p>
        </div>
      </div>

      {/* Chart Canvas */}
      {safeData.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          Chưa có dữ liệu thống kê doanh thu 6 tháng gần nhất.
        </div>
      ) : (
        <div className="relative pt-6">
          <div className="flex gap-3">
            {/* Y-Axis Labels */}
            <div className="hidden sm:flex flex-col justify-between h-56 text-[10px] font-medium text-gray-400 text-right pr-1 select-none w-14 shrink-0">
              {yTicks.map((ratio, idx) => (
                <span key={idx}>{formatShortMoney(maxRevenue * ratio)}</span>
              ))}
            </div>

            {/* Grid & Bars */}
            <div className="relative flex-1 h-56">
              {/* Horizontal dashed gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {yTicks.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-full border-t ${
                      idx === yTicks.length - 1 ? "border-gray-300" : "border-dashed border-gray-200"
                    }`}
                  />
                ))}
              </div>

              {/* Bars */}
              <div className="relative z-10 h-full grid grid-cols-6 gap-2 sm:gap-5 items-end px-1 sm:px-3">
                {safeData.map((item, idx) => {
                  const rev = Number(item.revenue) || 0;
                  const paidRev = Number(item.paidRevenue) || 0;
                  const heightPct = rev > 0 ? Math.max(4, Math.round((rev / maxRevenue) * 100)) : 0;
                  const paidPct = rev > 0 ? Math.min(100, Math.round((paidRev / rev) * 100)) : 0;
                  const isHovered = hoveredIdx === idx;

                  return (
                    <div
                      key={item.key || idx}
                      className="relative h-full flex flex-col items-center justify-end group"
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      {/* Hover Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-30 w-44 bg-gray-900 text-white rounded-xl p-2.5 shadow-xl text-[11px] pointer-events-none">
                          <p className="font-bold text-amber-300 border-b border-gray-700 pb-1 mb-1">
                            Tháng {item.month}
                          </p>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Doanh thu:</span>
                            <span className="font-bold">{rev.toLocaleString("vi-VN")} {currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">VNPay:</span>
                            <span className="text-emerald-300 font-semibold">{paidRev.toLocaleString("vi-VN")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Đơn duyệt:</span>
                            <span className="font-semibold">
                              {item.confirmedBookings || 0} / {item.totalBookings || 0}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Value Label above bar */}
                      <span className="text-[10px] font-bold text-gray-600 mb-1 whitespace-nowrap">
                        {rev > 0 ? formatShortMoney(rev) : "0"}
                      </span>

                      {/* Bar Track */}
                      <div className="w-full max-w-[44px] h-full flex items-end justify-center">
                        <div
                          className={`relative w-full rounded-t-xl bg-gradient-to-t transition-all duration-500 overflow-hidden cursor-pointer shadow-xs ${
                            isHovered ? barHoverGradient : barGradient
                          }`}
                          style={{ height: `${heightPct}%`, minHeight: rev > 0 ? "8px" : "2px" }}
                        >
                          {/* Paid online portion highlight strip at bottom of bar */}
                          {paidPct > 0 && (
                            <div
                              className="absolute bottom-0 left-0 right-0 bg-emerald-400/35 border-t border-emerald-200/70"
                              style={{ height: `${paidPct}%` }}
                              title={`Thanh toán VNPay: ${paidPct}%`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* X-Axis Month Labels & Confirmed Counts */}
          <div className="flex gap-3 mt-2.5">
            <div className="hidden sm:block w-14 shrink-0" />
            <div className="flex-1 grid grid-cols-6 gap-2 sm:gap-5 px-1 sm:px-3 text-center">
              {safeData.map((item, idx) => (
                <div key={item.key || idx} className="leading-tight">
                  <p className="text-xs font-bold text-gray-700">{item.label || item.month}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {item.confirmedBookings || 0} đơn
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-end gap-4 mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-3 h-3 rounded-xs bg-gradient-to-r ${barGradient}`}
              />
              <span>Doanh thu đơn đã xác nhận</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-400/60 border border-emerald-500" />
              <span>Tỷ trọng đã thanh toán VNPay</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
