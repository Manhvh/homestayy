import React, { useState, useEffect } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";

const Dashboard = () => {
  const { currency, user, getToken, toast, axios } = useAppContext();

  const [dashboardData, setDashboardData] = useState({
    bookings: [],
    totalBookings: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get('/api/bookings/hotel', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Partner Approve or Cancel booking
  const handleUpdateStatus = async (bookingId, status) => {
    try {
      const token = await getToken();
      const { data } = await axios.put(`/api/bookings/${bookingId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        toast.success(data.message);
        fetchDashboardData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const pendingCount = dashboardData.bookings.filter(b => b.status === "pending").length;

  return (
    <div>
      <Title
        align="left"
        font="outfit"
        title="Bảng Điều Khiển Chủ Nhà"
        subTitle="Quản lý toàn bộ danh mục phòng, duyệt đơn đặt phòng từ khách hàng và theo dõi doanh thu theo thời gian thực."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center">
          <img src={assets.totalBookingIcon} alt="total-booking" className="h-10 w-10 mr-4" />
          <div>
            <p className="text-gray-500 text-xs uppercase font-semibold">Tổng số đơn đặt</p>
            <p className="text-2xl font-bold text-gray-900">{dashboardData.totalBookings}</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center">
          <img src={assets.totalRevenueIcon} alt="total-revenue" className="h-10 w-10 mr-4" />
          <div>
            <p className="text-gray-500 text-xs uppercase font-semibold">Tổng doanh thu</p>
            <p className="text-2xl font-bold text-gray-900">{currency} {dashboardData.totalRevenue}</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center">
          <span className="text-3xl mr-4">⏳</span>
          <div>
            <p className="text-gray-500 text-xs uppercase font-semibold">Đơn chờ duyệt</p>
            <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">📋 Danh sách đơn đặt phòng gần đây</h2>
        <button onClick={fetchDashboardData} className="text-xs text-blue-600 hover:underline">
          Làm mới
        </button>
      </div>

      <div className="w-full text-left border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase">
              <tr>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Loại phòng</th>
                <th className="py-3.5 px-4">Ngày nhận / trả</th>
                <th className="py-3.5 px-4 text-center">Tổng tiền</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-center">Hành động duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : dashboardData.bookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    Chưa có đơn đặt phòng nào.
                  </td>
                </tr>
              ) : (
                dashboardData.bookings.map((item) => (
                  <tr key={item.id || item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">{item.user?.username || "Khách hàng"}</p>
                      <p className="text-xs text-gray-400">{item.user?.email}</p>
                    </td>

                    <td className="py-3 px-4 text-gray-700">
                      {item.room?.roomType || "Phòng tiêu chuẩn"}
                    </td>

                    <td className="py-3 px-4 text-xs text-gray-600">
                      <div>Từ: <strong>{new Date(item.checkInDate).toLocaleDateString()}</strong></div>
                      <div>Đến: <strong>{new Date(item.checkOutDate).toLocaleDateString()}</strong></div>
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-gray-900">
                      {currency} {item.totalPrice}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block py-1 px-2.5 text-xs font-bold rounded-full ${
                        item.status === "confirmed" 
                          ? "bg-green-100 text-green-700" 
                          : item.status === "cancelled" 
                            ? "bg-red-100 text-red-700" 
                            : "bg-amber-100 text-amber-700"
                      }`}>
                        {item.status === "confirmed" ? "✓ Đã duyệt" : item.status === "cancelled" ? "✕ Đã hủy" : "⏳ Chờ duyệt"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {item.status === "pending" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleUpdateStatus(item.id || item._id, "confirmed")}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item.id || item._id, "cancelled")}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : item.status === "confirmed" ? (
                        <button
                          onClick={() => handleUpdateStatus(item.id || item._id, "cancelled")}
                          className="px-2.5 py-1 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs transition"
                        >
                          Hủy đơn
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Đã đóng</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
