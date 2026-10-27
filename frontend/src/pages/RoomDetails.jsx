import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { assets, facilityIcons, roomCommonData } from "../assets/assets";
import StarRating from "../components/StarRating";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const RoomDetails = () => {
  const { id } = useParams();

  const { rooms, getToken, axios, navigate, user, currency } = useAppContext();

  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);

  const [isAvailable, setIsAvailable] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Check if the Room is Available
  const checkAvailability = async () => {
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

      const { data } = await axios.post('/api/bookings/check-availability', {
        room: id,
        checkInDate,
        checkOutDate
      });

      if (data.success) {
        if (data.isAvailable) {
          setIsAvailable(true);
          toast.success('Phòng đang còn trống! Bạn có thể đặt ngay.');
        } else {
          setIsAvailable(false);
          toast.error('Phòng đã kín trong khoảng thời gian này. Vui lòng chọn ngày khác.');
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Lỗi kiểm tra lịch phòng');
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Submit Handler to book
  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();

      if (!isAvailable) {
        return checkAvailability();
      }

      if (!user) {
        toast.error("Vui lòng đăng nhập để tiến hành đặt phòng!");
        return;
      }

      setIsBooking(true);
      setIsBooked(true);

      const token = await getToken();
      const { data } = await axios.post('/api/bookings/book', {
        room: id,
        checkInDate,
        checkOutDate,
        guests,
        paymentMethod: "Pay At Hotel"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        toast.success(data.message || "Đặt phòng thành công!");
        setTimeout(() => {
          navigate('/my-bookings');
          window.scrollTo(0, 0);
        }, 1500);
      } else {
        setIsBooking(false);
        setIsBooked(false);
        toast.error(data.message);
      }
    } catch (error) {
      setIsBooking(false);
      setIsBooked(false);
      toast.error(error.response?.data?.message || error.message || 'Không thể tạo đơn đặt phòng');
    }
  };

  // Fetch reviews for this hotel
  const fetchReviews = async (hotelId) => {
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
      const { data } = await axios.post('/api/reviews', {
        hotelId: room.hotel._id,
        roomId: room._id,
        rating: userRating,
        comment: userComment,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        toast.success("Cảm ơn bạn đã gửi đánh giá!");
        setUserComment("");
        setUserRating(5);
        fetchReviews(room.hotel._id);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Lỗi gửi đánh giá");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    const foundRoom = rooms.find((r) => r._id === id);
    if (foundRoom) {
      setRoom(foundRoom);
      setMainImage(foundRoom.images?.[0] || assets.roomImg1);
      if (foundRoom.hotel?._id) {
        fetchReviews(foundRoom.hotel._id);
      }
    }
  }, [rooms, id]);

  return (
    room && (
      <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32 max-w-7xl mx-auto">
        {/* Room Details Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900">
                {room.hotel.name}
              </h1>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                {room.roomType}
              </span>
            </div>
            {/* Room Address */}
            <div className="flex items-center gap-1.5 text-gray-500 mt-2 text-sm">
              <img src={assets.locationIcon} alt="location-icon" className="w-4 h-4" />
              <span>{room.hotel.address}, {room.hotel.city}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              <span className="text-amber-500 font-bold text-lg">★</span>
              <span className="font-bold text-gray-800">{averageRating > 0 ? averageRating : "5.0"}</span>
              <span className="text-gray-500 text-xs">({totalReviews} đánh giá)</span>
            </div>
            <p className="text-xs font-semibold py-1.5 px-3 text-white bg-green-600 rounded-full">
              Homestay đã xác minh
            </p>
          </div>
        </div>

        {/* Room Images Gallery */}
        <div className="flex flex-col lg:flex-row mt-6 gap-6">
          <div className="lg:w-2/3 w-full">
            <img
              src={mainImage}
              alt="Room Main"
              className="w-full h-96 lg:h-[460px] rounded-2xl shadow-lg object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:w-1/3 w-full">
            {room.images && room.images.map((image, index) => (
              <img
                onClick={() => setMainImage(image)}
                key={index}
                src={image}
                alt={`Room thumbnail ${index + 1}`}
                className={`w-full h-44 lg:h-[220px] rounded-xl shadow-sm object-cover cursor-pointer transition-all duration-200 ${
                  mainImage === image ? "ring-4 ring-blue-600 scale-[1.02]" : "hover:opacity-90"
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
              {room.amenities && room.amenities.map((item, index) => (
                <div key={index} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 text-gray-700">
                  {facilityIcons[item] && <img src={facilityIcons[item]} alt={item} className="w-5 h-5" />}
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl md:min-w-[280px]">
            <p className="text-xs text-blue-700 uppercase font-semibold mb-1">Giá tiêu chuẩn</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-gray-900">{currency} {room.pricePerNight}</span>
              <span className="text-gray-500 text-sm">/ đêm</span>
            </div>

            {/* Seasonal pricing info if available */}
            {room.seasonalPricing && room.seasonalPricing.length > 0 && (
              <div className="mt-4 pt-3 border-t border-blue-200 text-xs">
                <p className="font-semibold text-blue-900 mb-1">✨ Bảng giá theo mùa/dịp lễ:</p>
                {room.seasonalPricing.map((s, idx) => (
                  <div key={idx} className="flex justify-between text-gray-600 py-0.5">
                    <span>{s.name}:</span>
                    <strong className="text-gray-900">{currency}{s.pricePerNight}/đêm</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Check-In / Check-Out Form */}
        <form onSubmit={onSubmitHandler} className="bg-white shadow-xl p-6 md:p-8 rounded-2xl border border-gray-200 my-10 max-w-4xl mx-auto">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🗓️ Kiểm tra lịch trống & Đặt phòng</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label htmlFor="checkInDate" className="font-semibold text-sm text-gray-700 mb-1.5">Ngày nhận phòng</label>
              <input 
                onChange={(e) => {
                  setCheckInDate(e.target.value);
                  setIsAvailable(false);
                }} 
                min={new Date().toISOString().split('T')[0]} 
                value={checkInDate}
                type="date" 
                id="checkInDate" 
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="checkOutDate" className="font-semibold text-sm text-gray-700 mb-1.5">Ngày trả phòng</label>
              <input 
                onChange={(e) => {
                  setCheckOutDate(e.target.value);
                  setIsAvailable(false);
                }} 
                min={checkInDate || new Date().toISOString().split('T')[0]} 
                value={checkOutDate}
                disabled={!checkInDate} 
                type="date" 
                id="checkOutDate" 
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="guests" className="font-semibold text-sm text-gray-700 mb-1.5">Số khách</label>
              <input 
                onChange={(e) => setGuests(e.target.value)} 
                value={guests} 
                type="number" 
                id="guests" 
                min="1"
                max="10"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
            <button 
              type="submit" 
              disabled={isCheckingAvailability || isBooking || isBooked}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white transition-all shadow-md ${
                isBooked 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : isAvailable 
                    ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer animate-pulse'
                    : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }`}
            >
              {isBooked ? "✓ Đã đặt phòng thành công" : isBooking ? "Đang xử lý đặt phòng..." : isCheckingAvailability ? "Đang kiểm tra lịch trống..." : isAvailable ? "⚡ Đặt phòng ngay" : "Kiểm tra phòng trống"}
            </button>
            {isAvailable && (
              <span className="text-sm font-medium text-emerald-600">
                ✓ Phòng đang còn trống cho ngày bạn chọn!
              </span>
            )}
          </div>
        </form>

        {/* Common specifications */}
        <div className="mt-12 space-y-4">
          <h3 className="text-xl font-bold font-playfair text-gray-800">Quy định & Tiêu chuẩn Homestay</h3>
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
              src={room.hotel?.owner?.image || assets.userIcon} 
              alt="Host" 
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow" 
            />
            <div>
              <p className="text-lg font-bold text-gray-900">{room.hotel?.name}</p>
              <p className="text-sm text-gray-500">Chủ nhà: {room.hotel?.owner?.username || "Chủ nhà HomeStay"}</p>
              <p className="text-xs text-gray-400">Liên hệ: {room.hotel?.contact}</p>
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
                <span className="text-2xl font-extrabold text-amber-500">★ {averageRating > 0 ? averageRating : "5.0"}</span>
                <span className="text-gray-500 text-sm">trên 5 sao</span>
              </div>
            </div>
          </div>

          {/* Form to submit review */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-10">
            <h3 className="text-base font-bold text-gray-800 mb-3">✍️ Gửi đánh giá / phản hồi của bạn</h3>
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
                <div key={rev._id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
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
                        <span key={i} className={i < rev.rating ? "text-amber-400" : "text-gray-300"}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default RoomDetails;
