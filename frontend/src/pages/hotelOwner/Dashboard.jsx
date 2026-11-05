import React, { useState, useEffect, useMemo } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [actionBookingId, setActionBookingId] = useState(null);

  // Filter states: bookingCode, tên người dùng, SĐT người đăng ký
  const [filterBookingCode, setFilterBookingCode] = useState("");
  const [filterUsername, setFilterUsername] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

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
    if (isLoading) return;
    try {
      setIsLoading(true);
      setActionBookingId(bookingId);
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
    } finally {
      setIsLoading(false);
      setActionBookingId(null);
    }
  };

  // Send confirmation email to customer & update isSendMail = true
  const handleSendMail = async (bookingId) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      setActionBookingId(bookingId);
      const token = await getToken();
      const { data } = await axios.post(`/api/bookings/${bookingId}/send-mail`, {}, {
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
    } finally {
      setIsLoading(false);
      setActionBookingId(null);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const pendingCount = dashboardData.bookings.filter(b => b.status === "pending").length;

  const hasActiveFilter =
    filterBookingCode.trim() !== "" ||
    filterUsername.trim() !== "" ||
    filterPhone.trim() !== "" ||
    filterStatus !== "all";

  const handleResetFilters = () => {
    setFilterBookingCode("");
    setFilterUsername("");
    setFilterPhone("");
    setFilterStatus("all");
  };

  // Filtered bookings list by bookingCode, username, phone, status
  const filteredBookings = useMemo(() => {
    const codeQuery = filterBookingCode.trim().replace(/^#/, "").toLowerCase();
    const nameQuery = filterUsername.trim().toLowerCase();
    const phoneQuery = filterPhone.trim().toLowerCase();

    return dashboardData.bookings.filter((item) => {
      const itemCode = String(item.bookingCode || item.id || item._id || "").toLowerCase();
      const itemName = String(item.user?.username || "").toLowerCase();
      const itemPhone = String(item.user?.phone || "").toLowerCase();

      if (codeQuery && !itemCode.includes(codeQuery)) {
        return false;
      }
      if (nameQuery && !itemName.includes(nameQuery)) {
        return false;
      }
      if (phoneQuery && !itemPhone.includes(phoneQuery)) {
        return false;
      }
      if (filterStatus !== "all" && item.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [dashboardData.bookings, filterBookingCode, filterUsername, filterPhone, filterStatus]);

  return (
    <div>
      <Title
        align="left"
        font="outfit"
        title="Bảng Điều Khiển"
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
            <p className="text-2xl font-bold text-gray-900">{Number(dashboardData.totalRevenue).toLocaleString('vi-VN')} {currency}</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center">
          <div className="h-10 w-10 mr-4 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
            CHỜ
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase font-semibold">Đơn chờ duyệt</p>
            <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Recent Bookings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Danh sách đơn đặt phòng gần đây</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Hiển thị <strong>{filteredBookings.length}</strong> / {dashboardData.bookings.length} đơn đặt phòng
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-red-600 hover:text-red-800 font-medium underline cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
          <button onClick={fetchDashboardData} className="text-xs text-blue-600 hover:underline font-medium cursor-pointer">
            Làm mới dữ liệu
          </button>
        </div>
      </div>

      {/* Filter Bar: bookingCode, tên người dùng, SĐT người đăng ký */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">
              Mã đặt phòng (bookingCode)
            </label>
            <input
              type="text"
              value={filterBookingCode}
              onChange={(e) => setFilterBookingCode(e.target.value)}
              placeholder="Nhập mã đơn (VD: bk113579...)"
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">
              Tên người dùng đặt phòng
            </label>
            <input
              type="text"
              value={filterUsername}
              onChange={(e) => setFilterUsername(e.target.value)}
              placeholder="Nhập tên khách hàng..."
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">
              Số điện thoại khách hàng
            </label>
            <input
              type="text"
              value={filterPhone}
              onChange={(e) => setFilterPhone(e.target.value)}
              placeholder="Nhập SĐT (VD: 0912345678...)"
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">
              Trạng thái đơn
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Đang chờ duyệt</option>
              <option value="confirmed">Đã duyệt</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      <div className="w-full text-left border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase">
              <tr>
                <th className="py-3.5 px-4">Mã đơn</th>
                <th className="py-3.5 px-4">Khách hàng / SĐT</th>
                <th className="py-3.5 px-4">Loại phòng</th>
                <th className="py-3.5 px-4">Ngày nhận / trả</th>
                <th className="py-3.5 px-4 text-center">Tổng tiền</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-center">Email xác nhận</th>
                <th className="py-3.5 px-4 text-center">Hành động duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    {hasActiveFilter
                      ? "Không tìm thấy đơn đặt phòng nào khớp với bộ lọc."
                      : "Chưa có đơn đặt phòng nào."}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((item) => (
                  <tr key={item.id || item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="inline-block font-mono text-xs font-bold bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md border border-gray-200">
                        #{item.bookingCode || item.id || item._id}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900">{item.user?.username || "Khách hàng"}</p>
                      <p className="text-xs text-blue-600 font-medium">
                        SĐT: {item.user?.phone || "Chưa cập nhật"}
                      </p>
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
                      {Number(item.totalPrice).toLocaleString('vi-VN')} {currency}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block py-1 px-2.5 text-xs font-bold rounded-full ${
                        item.status === "confirmed" 
                          ? "bg-green-100 text-green-700" 
                          : item.status === "cancelled" 
                            ? "bg-red-100 text-red-700" 
                            : "bg-amber-100 text-amber-700"
                      }`}>
                        {item.status === "confirmed" ? "Đã duyệt" : item.status === "cancelled" ? "Đã hủy" : "Đang chờ duyệt"}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`inline-block py-0.5 px-2 text-[11px] font-semibold rounded-full ${
                          item.isSendMail
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {item.isSendMail ? "Đã gửi mail" : "Chưa gửi mail"}
                        </span>
                        {item.status !== "cancelled" && (
                          <button
                            onClick={() => handleSendMail(item.id || item._id)}
                            disabled={isLoading}
                            className="text-[11px] text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium underline cursor-pointer"
                          >
                            {isLoading && actionBookingId === (item.id || item._id)
                              ? "Đang gửi..."
                              : item.isSendMail
                              ? "Gửi lại"
                              : "Gửi mail"}
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {item.status === "pending" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleUpdateStatus(item.id || item._id, "confirmed")}
                            disabled={isLoading}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer"
                          >
                            {isLoading && actionBookingId === (item.id || item._id) ? "Đang xử lý..." : "Duyệt"}
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item.id || item._id, "cancelled")}
                            disabled={isLoading}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : item.status === "confirmed" ? (
                        <button
                          onClick={() => handleUpdateStatus(item.id || item._id, "cancelled")}
                          disabled={isLoading}
                          className="px-2.5 py-1 border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs transition cursor-pointer"
                        >
                          {isLoading && actionBookingId === (item.id || item._id) ? "Đang xử lý..." : "Hủy đơn"}
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
