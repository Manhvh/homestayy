import React from "react";
import toast from "react-hot-toast";

const BookingModal = ({
  isOpen,
  onClose,
  room,
  hotelInfo,
  user,
  currency,
  openLoginModal,
  checkInDate,
  setCheckInDate,
  checkOutDate,
  setCheckOutDate,
  guests,
  setGuests,
  setSearchDates,
  isAvailable,
  setIsAvailable,
  isCheckingAvailability,
  isLoading,
  isBooking,
  isBooked,
  numberOfNights,
  nightlyBreakdown,
  estimatedTotal,
  onSubmitHandler,
}) => {
  if (!isOpen || !room) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[92vh] overflow-y-auto p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading || isBooking}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 flex items-center justify-center transition cursor-pointer font-bold text-base"
          title="Đóng (Esc)"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="pr-10 mb-5">
          <div className="text-blue-600 font-semibold text-xs tracking-wider uppercase mb-1">
            Kiểm tra lịch trống & Đặt phòng
          </div>
          <h2 className="text-2xl font-bold font-playfair text-gray-900">
            {room.roomType}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            <span className="font-medium text-gray-700">{hotelInfo?.name || "Homestay"}</span>
            {hotelInfo?.city && <span> • {hotelInfo.city}</span>}
          </p>
        </div>

        {/* Unauthenticated notice inside modal if accessed */}
        {!user && (
          <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Bạn cần đăng nhập tài khoản trước khi hoàn tất đặt phòng.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                openLoginModal();
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs whitespace-nowrap transition-colors cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        {/* Price Preview Card */}
        <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-4 mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-700 font-medium mb-0.5">Giá tiêu chuẩn</p>
            <p className="text-xl font-extrabold text-gray-900">
              {Number(room.pricePerNight).toLocaleString("vi-VN")} {currency}{" "}
              <span className="text-xs font-normal text-gray-500">/ đêm</span>
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
            Thanh toán tại chỗ
          </span>
        </div>

        {/* Seasonal pricing info if available inside modal */}
        {room.seasonalPricing && room.seasonalPricing.length > 0 && (
          <div className="mb-5 p-3.5 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs">
            <p className="font-semibold text-amber-900 mb-1.5">
              Bảng giá theo mùa / dịp lễ:
            </p>
            <div className="space-y-1">
              {room.seasonalPricing.map((s, idx) => (
                <div key={idx} className="flex justify-between text-gray-600">
                  <span>{s.name} ({s.startDate} đến {s.endDate}):</span>
                  <strong className="text-gray-900">
                    {Number(s.pricePerNight).toLocaleString("vi-VN")} {currency}/đêm
                  </strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmitHandler} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <label htmlFor="modalCheckInDate" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                Ngày nhận phòng *
              </label>
              <input
                type="date"
                id="modalCheckInDate"
                min={new Date().toISOString().split("T")[0]}
                value={checkInDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setCheckInDate(val);
                  const nextCheckOut = checkOutDate && val && checkOutDate <= val ? "" : checkOutDate;
                  if (nextCheckOut !== checkOutDate) setCheckOutDate(nextCheckOut);
                  setSearchDates({ checkIn: val, checkOut: nextCheckOut });
                  setIsAvailable(false);
                }}
                required
                className="w-full min-w-0 max-w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none"
              />
            </div>

            <div className="min-w-0">
              <label htmlFor="modalCheckOutDate" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                Ngày trả phòng *
              </label>
              <input
                type="date"
                id="modalCheckOutDate"
                min={checkInDate || new Date().toISOString().split("T")[0]}
                value={checkOutDate}
                disabled={!checkInDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setCheckOutDate(val);
                  setSearchDates({ checkOut: val });
                  setIsAvailable(false);
                }}
                required
                className="w-full min-w-0 max-w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition appearance-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="modalGuests" className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                Số lượng khách *
              </label>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                Giới hạn: Tối đa {room?.maxGuests || 2} người
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                id="modalGuests"
                min="1"
                max={room?.maxGuests || 2}
                value={guests}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 1;
                  const maxLimit = room?.maxGuests || 2;
                  if (val > maxLimit) {
                    toast.error(`Phòng này chỉ phục vụ tối đa ${maxLimit} khách.`);
                    setGuests(maxLimit);
                    setSearchDates({ guests: maxLimit });
                  } else {
                    const nextG = Math.max(1, val);
                    setGuests(nextG);
                    setSearchDates({ guests: nextG });
                  }
                }}
                required
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <span className="text-xs text-gray-500 whitespace-nowrap">người</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Đã bao gồm người lớn & trẻ em theo quy định của homestay.
            </p>
          </div>

          {/* Nights & Estimated Price Summary */}
          {numberOfNights > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2 mt-4 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Thời gian lưu trú:</span>
                <strong className="text-gray-900">{numberOfNights} đêm</strong>
              </div>
              {nightlyBreakdown.length <= 7 && (
                <div className="py-1.5 border-y border-gray-200/80 space-y-1 max-h-32 overflow-y-auto">
                  {nightlyBreakdown.map((n, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] text-gray-500">
                      <span>
                        Đêm {idx + 1} ({n.dateStr} - {n.seasonName}):
                      </span>
                      <span className="font-semibold text-gray-700">
                        {n.nightRate.toLocaleString("vi-VN")} {currency}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Hình thức thanh toán:</span>
                <strong className="text-gray-900">Thanh toán tại homestay</strong>
              </div>

              <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline text-sm">
                <span className="font-bold text-gray-800">Tổng thanh toán:</span>
                <span className="text-lg font-extrabold text-blue-600">
                  {estimatedTotal.toLocaleString("vi-VN")} {currency}
                </span>
              </div>
            </div>
          )}

          {/* Availability feedback */}
          {isAvailable && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium">
              Phòng đang còn trống trong thời gian này! Bạn có thể bấm Đặt phòng ngay.
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isBooking}
              className="w-full sm:w-1/3 px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={isLoading || isCheckingAvailability || isBooking || isBooked}
              className={`w-full sm:w-2/3 px-6 py-3 rounded-xl font-bold text-white text-sm transition-all shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                isBooked
                  ? "bg-green-600"
                  : isLoading || isBooking
                  ? "bg-blue-500"
                  : isAvailable
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 animate-pulse"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
              }`}
            >
              {(isLoading || isBooking || isCheckingAvailability) && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              )}
              {!user ? (
                <span>Đăng nhập để đặt phòng</span>
              ) : isBooked ? (
                <span>Đã đặt phòng thành công! Đang chuyển hướng...</span>
              ) : isLoading || isBooking ? (
                <span>Đang xử lý đặt phòng...</span>
              ) : isCheckingAvailability ? (
                <span>Đang kiểm tra lịch trống...</span>
              ) : isAvailable ? (
                <span>Xác nhận đặt phòng ngay</span>
              ) : (
                <span>Kiểm tra lịch phòng trống</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
