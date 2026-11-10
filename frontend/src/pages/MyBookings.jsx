import React, { useEffect, useState, useMemo, useCallback } from "react";
import Title from "../components/Title";
import Pagination from "../components/Pagination";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
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

  // Review & Vote Modal states
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // Function to fetch the User Booking Data from database
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

  // Open Review Modal for a specific booking
  const openReviewModal = (booking) => {
    setReviewModalBooking(booking);
    setRating(booking.review?.rating || 5);
    setHoverRating(0);
    setComment(booking.review?.comment || "");
  };

  const closeReviewModal = () => {
    if (isSubmittingReview) return;
    setReviewModalBooking(null);
    setRating(5);
    setHoverRating(0);
    setComment("");
  };

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

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32 max-w-7xl mx-auto">
      <Title
        title="Lịch Sử Đặt Phòng"
        subTitle="Theo dõi chi tiết tất cả các chuyến đi, quản lý trạng thái đơn đặt phòng và đánh giá các homestay bạn đã trải nghiệm."
        align="left"
      />

      <div className="mt-8 w-full text-gray-800">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-gray-500">Đang tải lịch sử đặt phòng...</div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-2xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-700 mb-2">Bạn chưa có đơn đặt phòng nào</h3>
            <p className="text-gray-500 mb-6">
              Hãy khám phá các homestay tuyệt vời và lên kế hoạch cho kỳ nghỉ sắp tới.
            </p>
            <button
              onClick={() => navigate("/rooms")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-md cursor-pointer"
            >
              Khám phá phòng ngay
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter Tabs & Search Bar */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "all", label: `Tất cả (${bookings.length})` },
                  {
                    id: "pending",
                    label: `Chờ duyệt (${bookings.filter((b) => b.status === "pending").length})`,
                  },
                  {
                    id: "confirmed",
                    label: `Đã xác nhận (${bookings.filter((b) => b.status === "confirmed").length})`,
                  },
                  {
                    id: "cancelled",
                    label: `Đã hủy (${bookings.filter((b) => b.status === "cancelled").length})`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterStatus(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      filterStatus === tab.id
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full md:w-80">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm mã đơn, tên homestay hoặc phòng..."
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
                {(searchQuery || filterStatus !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStatus("all");
                    }}
                    className="text-xs text-red-600 hover:underline font-semibold whitespace-nowrap cursor-pointer"
                  >
                    Đặt lại
                  </button>
                )}
              </div>
            </div>

            {validBookings.length === 0 ? (
              <div className="p-10 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-500 text-sm">
                Không tìm thấy đơn đặt phòng nào khớp với bộ lọc hiện tại.
              </div>
            ) : (
            paginatedBookings.map((booking) => {
                const bookingId = booking.id || booking._id;
                const displayCode =
                  booking.bookingCode ||
                  booking.booking_code ||
                  `#${String(bookingId).slice(-6)}`;
                const isMailSent = Boolean(booking.isSendMail || booking.is_send_mail);
                const canReview = booking.status !== "cancelled";

                return (
                  <div
                    key={bookingId}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
                  >
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      {/* Hotel info */}
                      <div className="flex flex-col sm:flex-row gap-5 flex-1">
                        <img
                          src={booking.room?.images?.[0] || assets.roomImg1}
                          alt="hotel-img"
                          className="w-full sm:w-48 h-36 rounded-xl object-cover shadow-sm"
                        />
                        <div className="flex flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span
                                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                  booking.status === "confirmed"
                                    ? "bg-green-100 text-green-700"
                                    : booking.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {booking.status === "confirmed"
                                  ? "Đã xác nhận"
                                  : booking.status === "cancelled"
                                  ? "Đã hủy"
                                  : "Đang chờ duyệt"}
                              </span>
                              <span
                                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                  isMailSent
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {isMailSent ? "Đã gửi mail xác nhận" : "Chưa gửi mail"}
                              </span>
                              <span className="text-xs font-mono font-semibold text-gray-500">
                                Mã: {displayCode.startsWith("#") ? displayCode : `#${displayCode}`}
                              </span>
                            </div>
                            <h4 className="font-playfair text-xl font-bold text-gray-900">
                              {booking.hotel?.name || "Homestay"}
                              <span className="font-inter text-sm font-normal text-gray-500 ml-2">
                                ({booking.room?.roomType || "Phòng tiêu chuẩn"})
                              </span>
                            </h4>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                              <img src={assets.locationIcon} alt="loc" className="w-3.5 h-3.5" />
                              {booking.hotel?.address || "Việt Nam"}
                            </p>
                          </div>

                          <div className="text-sm text-gray-600 mt-3">
                            <span>
                              Khách: <strong>{booking.guests || 1} người</strong> |{" "}
                            </span>
                            <span>
                              Tổng tiền:{" "}
                              <strong className="text-gray-900 text-base">
                                {Number(booking.totalPrice).toLocaleString("vi-VN")} {currency}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex sm:flex-col justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 text-sm">
                        <div className="mb-2">
                          <p className="text-gray-400 text-xs uppercase font-medium">Nhận phòng</p>
                          <p className="font-semibold text-gray-800">
                            {booking.checkInDate
                              ? new Date(booking.checkInDate).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs uppercase font-medium">Trả phòng</p>
                          <p className="font-semibold text-gray-800">
                            {booking.checkOutDate
                              ? new Date(booking.checkOutDate).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Actions & Payment Info */}
                      <div className="flex flex-col justify-between items-end border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 min-w-[200px]">
                        <div className="text-left lg:text-right w-full">
                          <span className="text-[11px] text-gray-400 block uppercase font-semibold">
                            Hình thức thanh toán
                          </span>
                          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg inline-block mt-1">
                            Thanh toán tại Homestay
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4 self-stretch lg:self-end justify-end">
                          {(booking.room?.id || booking.room?._id || booking.roomId) && (
                            <button
                              onClick={() => {
                                const rId =
                                  booking.room?.id || booking.room?._id || booking.roomId;
                                navigate(`/rooms/${rId}`);
                                window.scrollTo(0, 0);
                              }}
                              className="px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-medium rounded-xl transition cursor-pointer"
                            >
                              Đặt lại
                            </button>
                          )}

                          {canReview && (
                            <button
                              onClick={() => openReviewModal(booking)}
                              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                            >
                              {booking.review ? "Sửa đánh giá" : "Đánh giá & Vote sao"}
                            </button>
                          )}

                          {booking.status !== "cancelled" && (
                            <button
                              onClick={() => handleCancelBooking(bookingId)}
                              className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium rounded-xl transition cursor-pointer"
                            >
                              Hủy đơn
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Display User's Submitted Review if exists */}
                    {booking.review && (
                      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                              Đánh giá của bạn:
                            </span>
                            <div className="flex items-center text-amber-500 text-sm">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={
                                    star <= booking.review.rating
                                      ? "text-amber-500"
                                      : "text-gray-300"
                                  }
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-xs font-semibold text-amber-700">
                              ({booking.review.rating}/5 sao - {RATING_LABELS[booking.review.rating] || "Hài lòng"})
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1 italic">
                            "{booking.review.comment}"
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => openReviewModal(booking)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                          >
                            Chỉnh sửa
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            disabled={deletingReviewId === (booking.review.id || booking.review._id)}
                            onClick={() =>
                              handleDeleteReview(booking.review.id || booking.review._id)
                            }
                            className="text-xs text-red-600 hover:text-red-800 font-semibold underline cursor-pointer disabled:opacity-50"
                          >
                            {deletingReviewId === (booking.review.id || booking.review._id)
                              ? "Đang xóa..."
                              : "Xóa"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

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

      {/* Review & Vote Star Popup Modal */}
      {reviewModalBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeReviewModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg p-6 md:p-7 relative"
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
                  ? new Date(reviewModalBooking.checkInDate).toLocaleDateString()
                  : ""}
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-5">
              {/* Star Voting */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 text-center">
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
                  className="w-full rounded-xl border border-gray-300 p-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  disabled={isSubmittingReview}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-2"
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
