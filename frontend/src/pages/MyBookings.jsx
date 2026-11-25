import React, { useEffect, useState, useMemo, useCallback } from "react";
import Pagination from "../components/Pagination";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { downloadCsv } from "../utils/csvExport";
import { parseLocalDateOnly, getLocalTodayYMD } from "../utils/formatters";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

const RATING_LABELS = {
  1: "Rất tệ",
  2: "Chưa hài lòng",
  3: "Bình thường",
  4: "Hài lòng",
  5: "Tuyệt vời",
};

const MyBookings = () => {
  const { axios, getToken, user, currency, navigate } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [payingBookingId, setPayingBookingId] = useState(null);

  // Order Details Modal state (stores ID so it stays live-synced after refresh)
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  // Review & Vote Modal states
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // Fetch User Bookings
  const fetchUserBookings = useCallback(async () => {
    try {
      setLoading(true);
      if (!user) {
        setLoading(false);
        return;
      }

      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const { data } = await axios.get("/api/bookings/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        toast.error(data.message);
        setBookings([]);
      }
    } catch (error) {
      setBookings([]);
      if (error.response?.status === 401) {
        toast.error("Vui lòng đăng nhập để xem đơn đặt phòng.");
      } else {
        toast.error("Lỗi tải danh sách đặt phòng.");
      }
    } finally {
      setLoading(false);
    }
  }, [axios, getToken, user]);

  // Pay or retry payment with VNPay Sandbox
  const handlePayWithVnpay = async (bookingId) => {
    if (payingBookingId) return;
    try {
      setPayingBookingId(bookingId);
      const token = await getToken();
      const { data } = await axios.post(
        "/api/payments/vnpay/create",
        { bookingId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast.error(data.message || "Không thể khởi tạo thanh toán VNPay.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Lỗi kết nối VNPay.");
    } finally {
      setPayingBookingId(null);
    }
  };

  // User cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn đặt phòng này không?")) return;

    try {
      const token = await getToken();
      const { data } = await axios.put(
        `/api/bookings/${bookingId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        fetchUserBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Open Review Modal for a specific confirmed booking
  const openReviewModal = (booking) => {
    if (booking.status !== "confirmed") {
      toast.error("Chỉ có thể gửi đánh giá cho các đơn đặt phòng đã được xác nhận.");
      return;
    }
    setReviewModalBooking(booking);
    setRating(booking.review?.rating || 5);
    setHoverRating(0);
    setComment(booking.review?.comment || "");
  };

  const closeReviewModal = useCallback(() => {
    if (isSubmittingReview) return;
    setReviewModalBooking(null);
    setRating(5);
    setHoverRating(0);
    setComment("");
  }, [isSubmittingReview]);

  // Submit Review & Vote Star
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalBooking || isSubmittingReview) return;

    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá về kỳ nghỉ của bạn.");
      return;
    }

    try {
      setIsSubmittingReview(true);
      const token = await getToken();
      const hotelId =
        reviewModalBooking.hotel?.id ||
        reviewModalBooking.hotel?._id ||
        reviewModalBooking.hotelId;
      const roomId =
        reviewModalBooking.room?.id ||
        reviewModalBooking.room?._id ||
        reviewModalBooking.roomId;
      const bookingId = reviewModalBooking.id || reviewModalBooking._id;

      const { data } = await axios.post(
        "/api/reviews",
        {
          hotelId,
          roomId,
          bookingId,
          rating,
          comment: comment.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(
          reviewModalBooking.review
            ? "Đã cập nhật đánh giá thành công!"
            : "Cảm ơn bạn đã đánh giá & vote sao cho homestay!"
        );
        setReviewModalBooking(null);
        fetchUserBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Không thể gửi đánh giá.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Delete user's own review
  const handleDeleteReview = async (reviewId) => {
    if (deletingReviewId) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) return;

    try {
      setDeletingReviewId(reviewId);
      const token = await getToken();
      const { data } = await axios.delete(`/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(data.message);
        fetchUserBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setDeletingReviewId(null);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user, fetchUserBookings]);

  // Close Details Modal on Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (reviewModalBooking) {
          closeReviewModal();
        } else if (selectedBookingId) {
          setSelectedBookingId(null);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reviewModalBooking, selectedBookingId, closeReviewModal]);

  const validBookings = useMemo(() => {
    const kw = searchQuery.trim().replace(/^#/, "").toLowerCase();
    return bookings.filter((b) => {
      if (!b || !(b.id || b._id)) return false;
      if (filterStatus !== "all" && b.status !== filterStatus) return false;
      if (kw) {
        const codeStr = String(b.bookingCode || b.booking_code || b.id || "").toLowerCase();
        const hotelStr = String(b.hotel?.name || "").toLowerCase();
        const roomStr = String(b.room?.roomType || "").toLowerCase();
        if (!codeStr.includes(kw) && !hotelStr.includes(kw) && !roomStr.includes(kw)) {
          return false;
        }
      }
      return true;
    });
  }, [bookings, filterStatus, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery]);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return validBookings.slice(startIndex, startIndex + PAGE_SIZE);
  }, [validBookings, currentPage]);

  const selectedBooking = useMemo(() => {
    if (!selectedBookingId) return null;
    return bookings.find((b) => String(b.id || b._id) === String(selectedBookingId)) || null;
  }, [bookings, selectedBookingId]);

  const todayMidnight = useMemo(() => parseLocalDateOnly(new Date()), []);

  const handleExportHistory = () => {
    if (validBookings.length === 0) {
      toast.error("Không có đơn đặt phòng nào để xuất hóa đơn.");
      return;
    }
    const todayStr = getLocalTodayYMD();
    downloadCsv({
      filename: `lich-su-dat-phong-${todayStr}.csv`,
      headers: [
        "Mã đơn",
        "Homestay",
        "Loại phòng",
        "Số khách",
        "Ngày nhận phòng",
        "Ngày trả phòng",
        `Tổng tiền (${currency})`,
        "Trạng thái đơn",
        "Phương thức thanh toán",
        "Trạng thái thanh toán",
        "Mã giao dịch",
      ],
      rows: validBookings.map((b) => [
        `#${b.bookingCode || b.id}`,
        b.hotel?.name || "Homestay",
        b.room?.roomType || "Phòng tiêu chuẩn",
        b.guests || 1,
        b.checkInDate ? new Date(b.checkInDate).toLocaleDateString("vi-VN") : "",
        b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString("vi-VN") : "",
        Number(b.totalPrice) || 0,
        b.status === "confirmed" ? "Đã xác nhận" : b.status === "cancelled" ? "Đã hủy" : "Chờ duyệt",
        b.paymentMethod === "VNPay" ? "Thanh toán trực tuyến VNPay" : "Thanh toán tại Homestay",
        b.isPaid ? "Đã thanh toán" : "Chưa thanh toán",
        b.transactionRef || "",
      ]),
    });
    toast.success("Đã tải xuống bảng hóa đơn lịch sử đặt phòng!");
  };

  const countAll = bookings.length;
  const countPending = bookings.filter((b) => b.status === "pending").length;
  const countConfirmed = bookings.filter((b) => b.status === "confirmed").length;
  const countCancelled = bookings.filter((b) => b.status === "cancelled").length;

  const statusTabs = [
    { id: "all", label: `Tất cả(${countAll})` },
    { id: "pending", label: `Chờ duyệt(${countPending})` },
    { id: "confirmed", label: `Đã xác nhận(${countConfirmed})` },
    { id: "cancelled", label: `Đã hủy(${countCancelled})` },
  ];

  return (
    <div className="min-h-screen bg-white pt-28 pb-24 px-4 sm:px-8 md:px-14 lg:px-20">
      <div className="max-w-6xl mx-auto">
        {/* Page Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
          Lịch Sử Đặt Phòng
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-9 h-9 border-4 border-[#5546F6] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 mt-3">Đang tải lịch sử đặt phòng...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center py-20 text-center bg-gray-50/70 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Bạn chưa có đơn đặt phòng nào</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              Hãy khám phá các homestay tuyệt vời và lên kế hoạch cho kỳ nghỉ sắp tới của bạn.
            </p>
            <button
              onClick={() => navigate("/rooms")}
              className="bg-[#5546F6] hover:bg-[#4636E3] text-white font-medium text-sm px-6 py-2.5 rounded-full transition shadow-sm cursor-pointer"
            >
              Khám phá phòng ngay
            </button>
          </div>
        ) : (
          <div className="mt-7">
            {/* Top Tabs & Right Action Pills (Matching Reference Layout) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              {/* Clean Text Status Tabs */}
              <div className="flex flex-wrap items-center gap-5 sm:gap-8">
                {statusTabs.map((tab) => {
                  const isActive = filterStatus === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilterStatus(tab.id)}
                      className={`text-sm sm:text-[15px] font-medium transition-colors cursor-pointer ${
                        isActive
                          ? "text-[#5546F6] font-semibold"
                          : "text-gray-800 hover:text-[#5546F6]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Right Pill Actions + Compact Search */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm mã đơn, homestay..."
                    className="w-48 sm:w-52 pl-3.5 pr-8 py-2 text-xs text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-full outline-none focus:border-[#5546F6] transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                      title="Xóa từ khóa"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleExportHistory}
                  className="px-5 py-2 text-xs sm:text-[13px] font-medium text-gray-800 bg-white hover:bg-gray-50 border border-gray-200 rounded-full transition cursor-pointer whitespace-nowrap"
                >
                  Xem hóa đơn
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/rooms")}
                  className="px-5 py-2 text-xs sm:text-[13px] font-medium text-white bg-[#5546F6] hover:bg-[#4636E3] rounded-full shadow-xs transition cursor-pointer whitespace-nowrap"
                >
                  Đặt phòng mới
                </button>
              </div>
            </div>

            {/* Rounded Table Column Header Bar */}
            <div className="hidden md:grid grid-cols-12 items-center px-6 py-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-900">
              <div className="col-span-5">Phòng & Homestay</div>
              <div className="col-span-3 text-center">Trạng thái</div>
              <div className="col-span-2 text-center">Tổng tiền</div>
              <div className="col-span-2 text-center">Chi tiết</div>
            </div>

            {/* Rows List */}
            {validBookings.length === 0 ? (
              <div className="mt-4 py-14 text-center text-sm text-gray-500 border-b border-gray-100">
                Không tìm thấy đơn đặt phòng nào khớp với bộ lọc hiện tại.
                {(searchQuery || filterStatus !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStatus("all");
                    }}
                    className="ml-2 text-[#5546F6] font-semibold hover:underline cursor-pointer"
                  >
                    Đặt lại bộ lọc
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200/80">
                {paginatedBookings.map((booking) => {
                  const bookingId = booking.id || booking._id;
                  const displayCode =
                    booking.bookingCode ||
                    booking.booking_code ||
                    String(bookingId).slice(-6);
                  const checkInDay = parseLocalDateOnly(booking.checkInDate);
                  const checkOutDay = parseLocalDateOnly(booking.checkOutDate);
                  const daysLeft =
                    checkInDay && checkInDay > todayMidnight
                      ? Math.round((checkInDay - todayMidnight) / (1000 * 60 * 60 * 24))
                      : 0;
                  const nights =
                    checkInDay && checkOutDay && checkOutDay > checkInDay
                      ? Math.round((checkOutDay - checkInDay) / (1000 * 60 * 60 * 24))
                      : 1;

                  return (
                    <div
                      key={bookingId}
                      className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 md:gap-2 px-3 sm:px-6 py-6 sm:py-7 hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Col 1: Thumbnail + Name + Subtle Quantity/Stay Meta */}
                      <div className="md:col-span-5 flex items-center gap-4 min-w-0">
                        <img
                          src={booking.room?.images?.[0] || assets.roomImg1}
                          alt={booking.hotel?.name || "Homestay"}
                          onClick={() => setSelectedBookingId(bookingId)}
                          className="w-18 h-18 sm:w-20 sm:h-20 rounded-md object-cover shrink-0 bg-gray-100 cursor-pointer hover:opacity-90 transition"
                        />
                        <div className="min-w-0 flex-1">
                          <h3
                            onClick={() => setSelectedBookingId(bookingId)}
                            className="text-sm sm:text-[16px] font-medium text-gray-900 truncate cursor-pointer hover:text-[#5546F6] transition"
                          >
                            {booking.hotel?.name || "Homestay"}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                            {booking.room?.roomType || "Phòng tiêu chuẩn"} • {booking.guests || 1} khách ({nights} đêm)
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5 flex flex-wrap items-center gap-x-2">
                            <span className="font-mono">
                              #{String(displayCode).replace(/^#/, "")}
                            </span>
                            <span>•</span>
                            <span>
                              {booking.checkInDate
                                ? new Date(booking.checkInDate).toLocaleDateString("vi-VN")
                                : "N/A"}{" "}
                              →{" "}
                              {booking.checkOutDate
                                ? new Date(booking.checkOutDate).toLocaleDateString("vi-VN")
                                : "N/A"}
                            </span>
                            {booking.review && (
                              <span className="text-amber-500 font-semibold">
                                ★ {booking.review.rating}/5
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Col 2: Clean Minimal Status Text (Matching Screenshot) */}
                      <div className="md:col-span-3 flex md:flex-col items-center justify-between md:justify-center text-sm">
                        <span className="md:hidden text-xs text-gray-400 font-medium">Trạng thái:</span>
                        <div className="text-right md:text-center">
                          {booking.status === "confirmed" ? (
                            <span className="text-emerald-600 font-medium">Đã xác nhận</span>
                          ) : booking.status === "cancelled" ? (
                            <span className="text-rose-500 font-medium">Đã hủy</span>
                          ) : (
                            <span>
                              <span className="text-amber-500 font-medium">Chờ duyệt</span>
                              {daysLeft > 0 && (
                                <span className="text-gray-400 font-normal">
                                  {" "}
                                  - còn {daysLeft} ngày
                                </span>
                              )}
                            </span>
                          )}
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {booking.status === "cancelled" && booking.isPaid
                              ? booking.refundStatus === "refunded"
                                ? "Đã hoàn tiền VNPay"
                                : "Chờ hoàn tiền VNPay"
                              : booking.isPaid
                              ? "Đã thanh toán VNPay"
                              : booking.paymentMethod === "VNPay"
                              ? "VNPay • Chưa thanh toán"
                              : "Thanh toán tại Homestay"}
                          </p>
                        </div>
                      </div>

                      {/* Col 3: Total Price */}
                      <div className="md:col-span-2 flex md:block items-center justify-between text-center">
                        <span className="md:hidden text-xs text-gray-400 font-medium">Tổng tiền:</span>
                        <span className="text-sm sm:text-[15px] font-semibold text-gray-900">
                          {Number(booking.totalPrice).toLocaleString("vi-VN")} {currency}
                        </span>
                      </div>

                      {/* Col 4: Single Purple Pill Details CTA (Matching Screenshot) */}
                      <div className="md:col-span-2 flex justify-end md:justify-center pt-1 md:pt-0">
                        <button
                          type="button"
                          onClick={() => setSelectedBookingId(bookingId)}
                          className="px-5 py-2 rounded-full bg-[#5546F6] hover:bg-[#4636E3] text-white text-xs font-medium shadow-xs transition cursor-pointer whitespace-nowrap"
                        >
                          Chi tiết đơn
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {validBookings.length > PAGE_SIZE && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalItems={validBookings.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= ORDER DETAILS MODAL ================= */}
      {selectedBooking && (() => {
        const b = selectedBooking;
        const bId = b.id || b._id;
        const displayCode = String(b.bookingCode || b.booking_code || bId).replace(/^#/, "");
        const isMailSent = Boolean(b.isSendMail || b.is_send_mail);
        const isPaid = Boolean(b.isPaid);
        const isVnpay = b.paymentMethod === "VNPay";
        const canReview = b.status === "confirmed";
        const checkInDay = parseLocalDateOnly(b.checkInDate);
        const canCancel = b.status !== "cancelled" && Boolean(checkInDay && todayMidnight < checkInDay);

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs"
            onClick={() => setSelectedBookingId(null)}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedBookingId(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold cursor-pointer"
                title="Đóng"
              >
                ✕
              </button>

              {/* Header */}
              <div className="pr-10 pb-5 border-b border-gray-100">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-[#5546F6] bg-indigo-50 px-2.5 py-1 rounded-full">
                    Mã đơn #{displayCode}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      b.status === "confirmed"
                        ? "bg-emerald-50 text-emerald-700"
                        : b.status === "cancelled"
                        ? "bg-rose-50 text-rose-600"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {b.status === "confirmed"
                      ? "Đã xác nhận"
                      : b.status === "cancelled"
                      ? "Đã hủy"
                      : "Đang chờ duyệt"}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isPaid
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isPaid ? "✓ Đã thanh toán" : "Chưa thanh toán"}
                  </span>
                  {b.status === "cancelled" && isPaid && (
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        b.refundStatus === "refunded"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {b.refundStatus === "refunded" ? "Đã hoàn tiền VNPay" : "Chờ hoàn tiền VNPay"}
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {b.hotel?.name || "Homestay"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                  <img src={assets.locationIcon} alt="loc" className="w-3.5 h-3.5" />
                  <span>{b.hotel?.address || "Việt Nam"}</span>
                </p>
              </div>

              {/* Room & Stay Info */}
              <div className="py-5 border-b border-gray-100 flex flex-col sm:flex-row gap-5">
                <img
                  src={b.room?.images?.[0] || assets.roomImg1}
                  alt={b.room?.roomType || "Room"}
                  className="w-full sm:w-44 h-32 rounded-2xl object-cover bg-gray-100 shrink-0"
                />
                <div className="flex-1 grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Loại phòng</p>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      {b.room?.roomType || "Phòng tiêu chuẩn"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Số lượng khách</p>
                    <p className="font-semibold text-gray-900 mt-0.5">{b.guests || 1} người</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Nhận phòng</p>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      {b.checkInDate ? new Date(b.checkInDate).toLocaleDateString("vi-VN") : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Trả phòng</p>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      {b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString("vi-VN") : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment & Mail Details */}
              <div className="py-5 border-b border-gray-100 space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Hình thức thanh toán:</span>
                  <span className="font-semibold text-gray-900">
                    {isVnpay ? "Thanh toán trực tuyến VNPay" : "Thanh toán tại Homestay"}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Email xác nhận:</span>
                  <span className={isMailSent ? "text-blue-600 font-semibold" : "text-gray-500"}>
                    {isMailSent ? "Đã gửi email xác nhận" : "Chưa gửi email"}
                  </span>
                </div>
                {isPaid && b.paidAt && (
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500">Thời gian thanh toán:</span>
                    <span className="font-semibold text-emerald-700">
                      {new Date(b.paidAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                )}
                {b.transactionRef && (
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500">Mã giao dịch VNPay:</span>
                    <span className="font-mono text-xs font-semibold text-gray-800">
                      {b.transactionRef}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="font-bold text-gray-900">Tổng thanh toán:</span>
                  <span className="text-xl font-extrabold text-[#5546F6]">
                    {Number(b.totalPrice).toLocaleString("vi-VN")} {currency}
                  </span>
                </div>
              </div>

              {/* Review & Owner Reply inside Details Modal */}
              {b.review && (
                <div className="mt-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-800 uppercase">
                        Đánh giá của bạn
                      </span>
                      <span className="text-amber-500 text-sm">
                        {"★".repeat(b.review.rating)}
                        <span className="text-gray-300">{"★".repeat(5 - b.review.rating)}</span>
                      </span>
                      <span className="text-xs font-semibold text-amber-700">
                        ({b.review.rating}/5 - {RATING_LABELS[b.review.rating] || "Hài lòng"})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => openReviewModal(b)}
                        className="text-[#5546F6] hover:underline font-semibold cursor-pointer"
                      >
                        Chỉnh sửa
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        disabled={deletingReviewId === (b.review.id || b.review._id)}
                        onClick={() => handleDeleteReview(b.review.id || b.review._id)}
                        className="text-rose-600 hover:underline font-semibold cursor-pointer disabled:opacity-50"
                      >
                        {deletingReviewId === (b.review.id || b.review._id) ? "Đang xóa..." : "Xóa"}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 italic">"{b.review.comment}"</p>

                  {b.review.ownerReply && (
                    <div className="bg-white/90 border-l-4 border-[#5546F6] rounded-r-xl px-3.5 py-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-indigo-900">
                          Phản hồi từ Chủ homestay ({b.hotel?.name || "Homestay"})
                        </span>
                        {b.review.repliedAt && (
                          <span className="text-[11px] text-gray-400">
                            {new Date(b.review.repliedAt).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{b.review.ownerReply}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5">
                {!isPaid && b.status !== "cancelled" && (
                  <button
                    type="button"
                    disabled={payingBookingId === bId}
                    onClick={() => handlePayWithVnpay(bId)}
                    className="px-5 py-2.5 rounded-full bg-[#5546F6] hover:bg-[#4636E3] disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                  >
                    {payingBookingId === bId
                      ? "Đang tạo cổng..."
                      : isVnpay
                      ? "Thanh toán lại VNPay"
                      : "Thanh toán VNPay"}
                  </button>
                )}

                {canReview && (
                  <button
                    type="button"
                    onClick={() => openReviewModal(b)}
                    className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                  >
                    {b.review ? "Sửa đánh giá" : "Đánh giá & Vote sao"}
                  </button>
                )}

                {(b.room?.id || b.room?._id || b.roomId) && (
                  <button
                    type="button"
                    onClick={() => {
                      const rId = b.room?.id || b.room?._id || b.roomId;
                      setSelectedBookingId(null);
                      navigate(`/rooms/${rId}`);
                      window.scrollTo(0, 0);
                    }}
                    className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition cursor-pointer"
                  >
                    Đặt lại phòng
                  </button>
                )}

                {canCancel ? (
                  <button
                    type="button"
                    onClick={() => handleCancelBooking(bId)}
                    className="px-5 py-2.5 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
                  >
                    Hủy đơn
                  </button>
                ) : (
                  b.status !== "cancelled" && (
                    <span
                      className="px-3.5 py-2 rounded-full bg-gray-100 text-gray-400 text-[11px] font-medium"
                      title="Không thể hủy đơn khi đã đến hoặc qua ngày nhận phòng"
                    >
                      Không thể hủy (đã đến hạn)
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= REVIEW & VOTE STAR MODAL ================= */}
      {reviewModalBooking && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeReviewModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg p-6 md:p-7 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeReviewModal}
              disabled={isSubmittingReview}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="mb-5 pr-8">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                Đánh giá trải nghiệm lưu trú
              </p>
              <h3 className="text-xl font-bold font-playfair text-gray-900">
                {reviewModalBooking.hotel?.name || "Homestay"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {reviewModalBooking.room?.roomType || "Phòng tiêu chuẩn"} • Nhận phòng:{" "}
                {reviewModalBooking.checkInDate
                  ? new Date(reviewModalBooking.checkInDate).toLocaleDateString("vi-VN")
                  : ""}
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-5">
              {/* Star Voting */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 text-center">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                  Bình chọn số sao cho Homestay
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const activeStar = hoverRating || rating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={`text-3xl transition-transform hover:scale-125 cursor-pointer ${
                          star <= activeStar ? "text-amber-400" : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs font-semibold text-amber-700 mt-2">
                  {hoverRating || rating} / 5 sao —{" "}
                  {RATING_LABELS[hoverRating || rating] || "Tuyệt vời"}
                </p>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Nhận xét chi tiết của bạn *
                </label>
                <textarea
                  rows="4"
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm thực tế của bạn về không gian homestay, độ sạch sẽ, tiện nghi và sự hỗ trợ của chủ nhà..."
                  className="w-full rounded-2xl border border-gray-300 p-3.5 text-sm outline-none focus:ring-2 focus:ring-[#5546F6] focus:border-[#5546F6]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 rounded-full bg-[#5546F6] hover:bg-[#4636E3] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-2"
                >
                  {isSubmittingReview && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  )}
                  <span>
                    {isSubmittingReview
                      ? "Đang lưu..."
                      : reviewModalBooking.review
                      ? "Cập nhật đánh giá"
                      : "Gửi đánh giá & Vote sao"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
