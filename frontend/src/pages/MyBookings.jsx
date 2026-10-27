import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MyBookings = () => {
  const { axios, getToken, user, currency, navigate } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch the User Booking Data from database
  const fetchUserBookings = async () => {
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

      const { data } = await axios.get('/api/bookings/user', {
        headers: { Authorization: `Bearer ${token}` }
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
  };

  // User cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn đặt phòng này không?")) return;

    try {
      const token = await getToken();
      const { data } = await axios.put(`/api/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

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

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32 max-w-7xl mx-auto">
      <Title
        title="Lịch Sử Đặt Phòng"
        subTitle="Theo dõi chi tiết tất cả các chuyến đi, quản lý trạng thái đơn đặt phòng và xem lại kỳ nghỉ của bạn."
        align="left"
      />

      <div className="mt-8 w-full text-gray-800">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-gray-500">Đang tải lịch sử đặt phòng...</div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-2xl border border-gray-200">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Bạn chưa có đơn đặt phòng nào</h3>
            <p className="text-gray-500 mb-6">Hãy khám phá các homestay tuyệt vời và lên kế hoạch cho kỳ nghỉ sắp tới.</p>
            <button 
              onClick={() => navigate('/rooms')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-md"
            >
              Khám phá phòng ngay
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.filter(b => b && (b.id || b._id)).map((booking) => (
              <div 
                key={booking.id || booking._id}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row justify-between gap-6"
              >
                {/* Hotel info */}
                <div className="flex flex-col sm:flex-row gap-5 flex-1">
                  <img
                    src={booking.room?.images?.[0] || assets.roomImg1}
                    alt="hotel-img"
                    className="w-full sm:w-48 h-36 rounded-xl object-cover shadow-sm"
                  />
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          booking.status === "confirmed" 
                            ? "bg-green-100 text-green-700" 
                            : booking.status === "cancelled" 
                              ? "bg-red-100 text-red-700" 
                              : "bg-amber-100 text-amber-700"
                        }`}>
                          {booking.status === "confirmed" ? "✓ Đã xác nhận" : booking.status === "cancelled" ? "✕ Đã hủy" : "⏳ Đang chờ duyệt"}
                        </span>
                        <span className="text-xs text-gray-400">Mã: #{String(booking.id || booking._id).slice(-6)}</span>
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
                      <span>Khách: <strong>{booking.guests || 1} người</strong> | </span>
                      <span>Tổng tiền: <strong className="text-gray-900 text-base">{currency} {booking.totalPrice}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex sm:flex-col justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 text-sm">
                  <div className="mb-2">
                    <p className="text-gray-400 text-xs uppercase font-medium">Nhận phòng</p>
                    <p className="font-semibold text-gray-800">
                      {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-medium">Trả phòng</p>
                    <p className="font-semibold text-gray-800">
                      {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Actions & Payment Info */}
                <div className="flex flex-col justify-between items-end border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 min-w-[170px]">
                  <div className="text-left lg:text-right w-full">
                    <span className="text-[11px] text-gray-400 block uppercase font-semibold">Hình thức thanh toán</span>
                    <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg inline-block mt-1">
                      💵 Thanh toán tại Homestay
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 self-stretch lg:self-end justify-end">
                    {(booking.room?.id || booking.room?._id || booking.roomId) && (
                      <button 
                        onClick={() => {
                          const rId = booking.room?.id || booking.room?._id || booking.roomId;
                          navigate(`/rooms/${rId}`);
                          window.scrollTo(0, 0);
                        }}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-medium rounded-xl transition"
                      >
                        Đánh giá / Xem lại
                      </button>
                    )}

                    {booking.status !== "cancelled" && (
                      <button 
                        onClick={() => handleCancelBooking(booking.id || booking._id)}
                        className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium rounded-xl transition"
                      >
                        Hủy đơn
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
