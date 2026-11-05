import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { assets, facilityIcons, roomCommonData, exclusiveOffers } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const RoomDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialCheckIn = searchParams.get('checkIn') || '';
  const initialCheckOut = searchParams.get('checkOut') || '';
  const initialDiscountCode = searchParams.get('discountCode') || '';

  const { rooms, getToken, axios, navigate, user, currency, openLoginModal } = useAppContext();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const [checkInDate, setCheckInDate] = useState(initialCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut);
  const [guests, setGuests] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Coupon / Exclusive Offer state
  const [couponInput, setCouponInput] = useState(initialDiscountCode);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showCouponList, setShowCouponList] = useState(false);

  const [isAvailable, setIsAvailable] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  // Close modal helper
  const closeModal = useCallback(() => {
    if (!isLoading && !isBooking) {
      setShowBookingModal(false);
    }
  }, [isLoading, isBooking]);

  // Lock body scroll and listen for Escape key when modal is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    if (showBookingModal) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showBookingModal, closeModal]);

  // Calculate number of nights
  const numberOfNights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = end - start;
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [checkInDate, checkOutDate]);

  // Calculate estimated total taking into account seasonal pricing
  const estimatedTotal = useMemo(() => {
    if (!room || numberOfNights <= 0) return 0;
    let total = 0;
    const start = new Date(checkInDate);
    for (let i = 0; i < numberOfNights; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      let nightRate = Number(room.pricePerNight) || 0;
      if (room.seasonalPricing && Array.isArray(room.seasonalPricing)) {
        for (const s of room.seasonalPricing) {
          if (dateStr >= s.startDate && dateStr <= s.endDate) {
            nightRate = Number(s.pricePerNight) || nightRate;
            break;
          }
        }
      }
      total += nightRate;
    }
    return total;
  }, [room, checkInDate, numberOfNights]);

  // Calculate discount amount from applied coupon
  const discountAmount = useMemo(() => {
    if (!appliedCoupon || estimatedTotal <= 0) return 0;
    let raw = (estimatedTotal * appliedCoupon.percent) / 100;
    if (appliedCoupon.maxDiscount) {
      raw = Math.min(raw, appliedCoupon.maxDiscount);
    }
    return Math.round(raw);
  }, [appliedCoupon, estimatedTotal]);

  // Final total price after discount
  const finalTotal = useMemo(() => {
    return Math.max(0, estimatedTotal - discountAmount);
  }, [estimatedTotal, discountAmount]);

  // Auto apply coupon if present in URL search param
  useEffect(() => {
    if (initialDiscountCode) {
      const match = exclusiveOffers.find(
        (o) => o.code.toUpperCase() === initialDiscountCode.trim().toUpperCase()
      );
      if (match) {
        setAppliedCoupon({
          code: match.code,
          title: match.title,
          percent: match.priceOff,
          maxDiscount: match.maxDiscount,
        });
      }
    }
  }, [initialDiscountCode]);

  // Handle coupon validation & apply
  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      toast.error("Vui lòng nhập mã ưu đãi!");
      return;
    }
    try {
      setIsApplyingCoupon(true);
      const { data } = await axios.post("/api/bookings/validate-coupon", {
        couponCode: code,
        subtotal: estimatedTotal,
        nights: numberOfNights > 0 ? numberOfNights : undefined,
      });
      if (data.success && data.coupon) {
        setAppliedCoupon(data.coupon);
        setCouponInput("");
        setShowCouponList(false);
        toast.success(data.message || `Đã áp dụng mã ${data.coupon.code}!`);
      } else {
        toast.error(data.message || "Mã ưu đãi không hợp lệ!");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
        return;
      }
      // Local fallback when offline
      const found = exclusiveOffers.find((o) => o.code.toUpperCase() === code);
      if (found) {
        setAppliedCoupon({
          code: found.code,
          title: found.title,
          percent: found.priceOff,
          maxDiscount: found.maxDiscount,
        });
        setCouponInput("");
        setShowCouponList(false);
        toast.success(`Đã áp dụng mã ${found.code} (Giảm ${found.priceOff}%)!`);
      } else {
        toast.error("Mã ưu đãi không hợp lệ hoặc đã hết hạn!");
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Review states
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Fetch reviews for this hotel
  const fetchReviews = useCallback(async (hotelId) => {
    if (!hotelId) return;
    try {
      const { data } = await axios.get(`/api/reviews/hotel/${hotelId}`);
      if (data.success) {
        setReviews(data.reviews || []);
        setTotalReviews(data.totalReviews || 0);
        setAverageRating(data.averageRating || 0);
      }
    } catch (error) {
      console.log("Fetch reviews error:", error.message);
    }
  }, [axios]);

  // Fetch room details: from rooms in context or directly from API
  const fetchRoomDetails = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Try finding in context rooms first
      const found = rooms.find(
        (r) => String(r.id) === String(id) || String(r._id) === String(id)
      );

      if (found) {
        setRoom(found);
        setMainImage(found.images?.[0] || assets.roomImg1);
        const hotelId = found.hotel?.id || found.hotel?._id || found.hotelId;
        if (hotelId) fetchReviews(hotelId);
        setLoading(false);
        return;
      }

      // 2. If not found in context (e.g. direct URL, refresh, or date-filtered out), fetch from backend API
      const { data } = await axios.get(`/api/rooms/${id}`);
      if (data.success && data.room) {
        setRoom(data.room);
        setMainImage(data.room.images?.[0] || assets.roomImg1);
        const hotelId = data.room.hotel?.id || data.room.hotel?._id || data.room.hotelId;
        if (hotelId) fetchReviews(hotelId);
      } else {
        setRoom(null);
      }
    } catch (err) {
      console.error("Fetch room error:", err);
      setRoom(null);
    } finally {
      setLoading(false);
    }
  }, [id, rooms, axios, fetchReviews]);

  useEffect(() => {
    if (id) {
      fetchRoomDetails();
    }
  }, [id, fetchRoomDetails]);

  // Check if the Room is Available
  const checkAvailability = async () => {
    if (isCheckingAvailability || isLoading || isBooking) return;
    try {
      setIsCheckingAvailability(true);

      if (!checkInDate || !checkOutDate) {
        toast.error("Vui lòng chọn cả ngày nhận và trả phòng.");
        setIsCheckingAvailability(false);
        return;
      }

      if (new Date(checkInDate) >= new Date(checkOutDate)) {
        toast.error("Ngày nhận phòng phải trước ngày trả phòng!");
        setIsCheckingAvailability(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      if (checkInDate < today) {
        toast.error("Ngày nhận phòng không thể ở quá khứ!");
        setIsCheckingAvailability(false);
        return;
      }

      const roomId = room?.id || room?._id || id;
      const { data } = await axios.post("/api/bookings/check-availability", {
        room: roomId,
        checkInDate,
        checkOutDate,
      });

      if (data.success) {
        if (data.isAvailable) {
          setIsAvailable(true);
          toast.success("Phòng đang còn trống! Bạn có thể đặt ngay.");
        } else {
          setIsAvailable(false);
          toast.error("Phòng đã kín trong khoảng thời gian này. Vui lòng chọn ngày khác.");
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Lỗi kiểm tra lịch phòng");
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Require user to be logged in before opening booking popup
  const handleOpenBookingModal = () => {
    if (isLoading || isBooking || isBooked) return;
    if (!user) {
      openLoginModal();
      return;
    }
    setShowBookingModal(true);
  };

  // Submit Handler to book
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isLoading || isBooking || isBooked || isCheckingAvailability) return;

    try {
      if (!user) {
        toast.error("Vui lòng đăng nhập để tiến hành đặt phòng!");
        openLoginModal();
        setShowBookingModal(false);
        return;
      }

      if (!isAvailable) {
        return checkAvailability();
      }

      const maxAllowed = room?.maxGuests || 2;
      if (guests > maxAllowed) {
        toast.error(`Phòng này chỉ phục vụ tối đa ${maxAllowed} người. Vui lòng chọn số lượng khách phù hợp.`);
        return;
      }
      if (guests < 1) {
        toast.error("Số lượng khách tối thiểu là 1 người.");
        return;
      }

      setIsLoading(true);
      setIsBooking(true);

      const roomId = room?.id || room?._id || id;
      const token = await getToken();
      const { data } = await axios.post(
        "/api/bookings/book",
        {
          room: roomId,
          checkInDate,
          checkOutDate,
          guests,
          paymentMethod: "Pay At Hotel",
          couponCode: appliedCoupon?.code || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        setIsBooked(true);
        toast.success(data.message || "Đặt phòng thành công!");
        setTimeout(() => {
          setShowBookingModal(false);
          setIsLoading(false);
          setIsBooking(false);
          navigate("/my-bookings");
          window.scrollTo(0, 0);
        }, 1200);
      } else {
        setIsLoading(false);
        setIsBooking(false);
        setIsBooked(false);
        toast.error(data.message);
      }
    } catch (error) {
      setIsLoading(false);
      setIsBooking(false);
      setIsBooked(false);
      toast.error(error.response?.data?.message || error.message || "Không thể tạo đơn đặt phòng");
    }
  };

  // Submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Vui lòng đăng nhập để gửi đánh giá!");
      return;
    }
    if (!userComment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    try {
      setIsSubmittingReview(true);
      const token = await getToken();
      const hotelId = room.hotel?.id || room.hotel?._id || room.hotelId;
      const roomId = room.id || room._id || id;

      const { data } = await axios.post(
        "/api/reviews",
        {
          hotelId,
          roomId,
          rating: userRating,
          comment: userComment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success("Cảm ơn bạn đã gửi đánh giá!");
        setUserComment("");
        setUserRating(5);
        fetchReviews(hotelId);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Lỗi gửi đánh giá");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="py-40 px-4 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium text-sm">Đang tải thông tin phòng nghỉ...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="py-40 px-4 max-w-md mx-auto text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy phòng nghỉ</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Phòng nghỉ bạn đang tìm kiếm không tồn tại hoặc đã ngừng nhận khách.
        </p>
        <button
          onClick={() => navigate("/rooms")}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-md"
        >
          Khám phá danh sách phòng khác
        </button>
      </div>
    );
  }

  const hotelInfo = room.hotel || {};
  const roomImages = Array.isArray(room.images) && room.images.length > 0 ? room.images : [assets.roomImg1];
  const activeImage = mainImage || roomImages[0] || assets.roomImg1;

  return (
    <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32 max-w-7xl mx-auto">
      {/* Room Details Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-gray-900 tracking-tight">
              {hotelInfo.name || "Homestay"}
            </h1>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
              {room.roomType}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
              Tối đa {room.maxGuests || 2} người
            </span>
          </div>
          {/* Room Address */}
          <div className="flex items-center gap-1.5 text-gray-500 mt-2 text-sm">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>
              {hotelInfo.address || "Việt Nam"}{hotelInfo.city ? `, ${hotelInfo.city}` : ""}
            </span>
          </div>
        </div>

        {/* Rating & Verified Badge (Phần bôi đỏ được cải thiện tinh tế & đồng bộ) */}
        <div className="flex items-center gap-2.5 self-start lg:self-center bg-white border border-gray-200 rounded-2xl p-2 sm:px-3.5 sm:py-2.5 shadow-xs">
          {/* Verified Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold whitespace-nowrap">
            <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Đã xác minh</span>
          </div>
        </div>
      </div>

      {/* Room Images Gallery */}
      <div className="flex flex-col lg:flex-row mt-6 gap-6">
        <div className="lg:w-2/3 w-full">
          <img
            src={activeImage}
            alt="Room Main"
            className="w-full h-96 lg:h-[460px] rounded-2xl shadow-lg object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:w-1/3 w-full">
          {roomImages.map((image, index) => (
            <img
              onClick={() => setMainImage(image)}
              key={index}
              src={image}
              alt={`Room thumbnail ${index + 1}`}
              className={`w-full h-44 lg:h-[220px] rounded-xl shadow-sm object-cover cursor-pointer transition-all duration-200 ${
                activeImage === image ? "ring-4 ring-blue-600 scale-[1.02]" : "hover:opacity-90"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Room highlights & Pricing */}
      <div className="flex flex-col md:flex-row md:justify-between items-start mt-10 gap-6 border-b border-gray-200 pb-8">
        <div className="flex-1">
          <h2 className="text-2xl font-bold font-playfair text-gray-800 mb-4">
            Tiện nghi & Dịch vụ nổi bật
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            {room.amenities &&
              (Array.isArray(room.amenities) ? room.amenities : []).map((item, index) => (
                <div key={index} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 text-gray-700">
                  {facilityIcons[item] && <img src={facilityIcons[item]} alt={item} className="w-5 h-5" />}
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl md:min-w-[300px] w-full md:w-auto shadow-sm">
          <p className="text-xs text-blue-700 uppercase font-semibold mb-1">Giá tiêu chuẩn</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-gray-900">
              {Number(room.pricePerNight).toLocaleString('vi-VN')} {currency}
            </span>
            <span className="text-gray-500 text-sm">/ đêm</span>
          </div>

          {/* Seasonal pricing info if available */}
          {room.seasonalPricing && room.seasonalPricing.length > 0 && (
            <div className="mt-4 pt-3 border-t border-blue-200 text-xs">
              <p className="font-semibold text-blue-900 mb-1">Bảng giá theo mùa / dịp lễ:</p>
              {room.seasonalPricing.map((s, idx) => (
                <div key={idx} className="flex justify-between text-gray-600 py-0.5">
                  <span>{s.name}:</span>
                  <strong className="text-gray-900">
                    {Number(s.pricePerNight).toLocaleString('vi-VN')} {currency} / đêm
                  </strong>
                </div>
              ))}
            </div>
          )}

          {/* Primary CTA button to open booking popup */}
          <button
            type="button"
            onClick={handleOpenBookingModal}
            disabled={isLoading || isBooking || isBooked}
            className="w-full mt-5 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
          >
            <span>{isLoading ? "Đang xử lý đặt phòng..." : user ? "Đặt phòng" : "Đăng nhập để đặt phòng"}</span>
          </button>
          {!user && (
            <p className="text-[11px] text-amber-700 bg-amber-50/80 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-2.5 text-center flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Vui lòng đăng nhập để đặt phòng này</span>
            </p>
          )}
        </div>
      </div>

      {/* Common specifications */}
      <div className="mt-12 space-y-4">
        <h3 className="text-xl font-bold font-playfair text-gray-800">Quy định & Tiêu chuẩn</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roomCommonData.map((spec, index) => (
            <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <img src={spec.icon} alt={spec.title} className="w-6 h-6 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">{spec.title}</p>
                <p className="text-sm text-gray-500">{spec.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hosted By */}
      <div className="my-10 p-6 bg-gray-50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={hotelInfo.owner?.image || assets.userIcon}
            alt="Host"
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
          />
          <div>
            <p className="text-lg font-bold text-gray-900">{hotelInfo.name || "Homestay"}</p>
            <p className="text-sm text-gray-500">Chủ nhà: {hotelInfo.owner?.username || "Chủ nhà HomeStay"}</p>
            <p className="text-xs text-gray-400">Liên hệ: {hotelInfo.contact}</p>
          </div>
        </div>
      </div>

      {/* Reviews and Ratings Section */}
      <div className="mt-14 pt-10 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold font-playfair text-gray-900">
              Đánh giá từ khách hàng ({totalReviews})
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-extrabold text-amber-500">
                ★ {averageRating > 0 ? averageRating : "5.0"}
              </span>
              <span className="text-gray-500 text-sm">trên 5 sao</span>
            </div>
          </div>
        </div>

        {/* Form to submit review */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-10">
          <h3 className="text-base font-bold text-gray-800 mb-3">Đánh giá</h3>
          {user ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Chọn số sao đánh giá:</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUserRating(star)}
                      className={`text-2xl cursor-pointer transition-transform hover:scale-125 ${
                        star <= userRating ? "text-amber-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-sm font-semibold text-gray-700 ml-2">{userRating} / 5 sao</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">Cảm nhận của bạn về homestay:</label>
                <textarea
                  rows="3"
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về phòng ốc, dịch vụ, tiện nghi và chủ nhà..."
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-gray-500">
              Vui lòng đăng nhập để có thể để lại đánh giá cho homestay này.
            </p>
          )}
        </div>

        {/* Review List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-xl text-gray-500 text-sm">
              Chưa có đánh giá nào cho homestay này. Hãy là người đầu tiên trải nghiệm và để lại đánh giá!
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id || rev.id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.user?.image || assets.userIcon}
                      alt="User"
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{rev.user?.username || "Khách hàng"}</p>
                      <p className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < rev.rating ? "text-amber-400" : "text-gray-300"}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Sticky CTA Bar */}
      <div className="fixed md:hidden bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 px-4 z-40 flex items-center justify-between shadow-2xl">
        <div>
          <p className="text-xs text-gray-500">Giá phòng</p>
          <p className="text-base font-bold text-gray-900">
            {Number(room.pricePerNight).toLocaleString('vi-VN')} {currency}
            <span className="text-xs font-normal text-gray-500">/đêm</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenBookingModal}
          disabled={isLoading || isBooking || isBooked}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm shadow flex items-center gap-1.5 cursor-pointer"
        >
          <span>{isLoading ? "Đang xử lý..." : user ? "Đặt phòng" : "Đăng nhập để đặt"}</span>
        </button>
      </div>

      {/* Booking & Availability Popup Modal */}
      {showBookingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all"
          onClick={closeModal}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[92vh] overflow-y-auto p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeModal}
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
                <span className="font-medium text-gray-700">{hotelInfo.name || "Homestay"}</span>
                {hotelInfo.city && <span> • {hotelInfo.city}</span>}
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
                    closeModal();
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
                  {Number(room.pricePerNight).toLocaleString('vi-VN')} {currency}{" "}
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
                        {Number(s.pricePerNight).toLocaleString('vi-VN')} {currency}/đêm
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={onSubmitHandler} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modalCheckInDate" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Ngày nhận phòng *
                  </label>
                  <input
                    type="date"
                    id="modalCheckInDate"
                    min={new Date().toISOString().split("T")[0]}
                    value={checkInDate}
                    onChange={(e) => {
                      setCheckInDate(e.target.value);
                      setIsAvailable(false);
                    }}
                    required
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div>
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
                      setCheckOutDate(e.target.value);
                      setIsAvailable(false);
                    }}
                    required
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
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
                      const val = parseInt(e.target.value) || 1;
                      const maxLimit = room?.maxGuests || 2;
                      if (val > maxLimit) {
                        toast.error(`Phòng này chỉ phục vụ tối đa ${maxLimit} khách.`);
                        setGuests(maxLimit);
                      } else {
                        setGuests(Math.max(1, val));
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

              {/* Voucher / Exclusive Offer Code */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Mã ưu đãi / Voucher giảm giá
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCouponList(!showCouponList)}
                    className="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    {showCouponList ? "Ẩn danh sách" : "Xem ưu đãi có sẵn"}
                  </button>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-800">
                          {appliedCoupon.code} - Giảm {appliedCoupon.percent}%
                        </p>
                        <p className="text-[11px] text-emerald-600">
                          {appliedCoupon.title || "Ưu đãi độc quyền"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-xs text-gray-400 hover:text-red-500 font-bold p-1 cursor-pointer"
                      title="Hủy mã ưu đãi"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập mã (VD: SUMMER25, ROMANCE20...)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 border border-gray-300 rounded-xl px-3.5 py-2 text-xs uppercase font-mono tracking-wider outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      onClick={() => handleApplyCoupon()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {isApplyingCoupon ? "Đang kiểm tra..." : "Áp dụng"}
                    </button>
                  </div>
                )}

                {/* Quick select list of available offers */}
                {showCouponList && !appliedCoupon && (
                  <div className="mt-2.5 p-2.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5 max-h-40 overflow-y-auto">
                    <p className="text-[11px] text-gray-500 font-medium px-1">Nhấp vào ưu đãi để áp dụng nhanh:</p>
                    {exclusiveOffers.map((offer) => (
                      <div
                        key={offer._id}
                        onClick={() => handleApplyCoupon(offer.code)}
                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-colors text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-blue-700 mr-2">{offer.code}</span>
                          <span className="text-gray-700 font-medium">{offer.title}</span>
                        </div>
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          -{offer.priceOff}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nights & Estimated Price Summary */}
              {numberOfNights > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2 mt-4 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Thời gian lưu trú:</span>
                    <strong className="text-gray-900">{numberOfNights} đêm</strong>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Giá phòng gốc:</span>
                    <span className="text-gray-900 font-medium">
                      {estimatedTotal.toLocaleString('vi-VN')} {currency}
                    </span>
                  </div>

                  {appliedCoupon && discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
                      <span>Ưu đãi áp dụng ({appliedCoupon.code}):</span>
                      <span>-{discountAmount.toLocaleString('vi-VN')} {currency}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Hình thức thanh toán:</span>
                    <strong className="text-gray-900">Thanh toán tại homestay</strong>
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline text-sm">
                    <span className="font-bold text-gray-800">Tổng thanh toán:</span>
                    <span className="text-lg font-extrabold text-blue-600">
                      {finalTotal.toLocaleString('vi-VN')} {currency}
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
                  onClick={closeModal}
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
      )}
    </div>
  );
};

export default RoomDetails;
