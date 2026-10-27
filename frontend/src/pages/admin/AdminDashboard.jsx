import React, { useEffect, useState } from 'react';
import Title from '../../components/Title';
import { useAppContext } from '../../context/AppContext';

const AdminDashboard = () => {
    const { axios, getToken, currency } = useAppContext();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await axios.get('/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Fetch admin stats error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return <div className="py-12 text-gray-500">Đang tải dữ liệu báo cáo thống kê...</div>;
    }

    return (
        <div className="max-w-6xl space-y-8">
            <Title
                align="left"
                font="outfit"
                title="Báo Cáo Thống Kê Tổng Quan Hệ Thống"
                subTitle="Theo dõi tăng trưởng người dùng, tình trạng kiểm duyệt tin homestay, doanh số giao dịch và mức độ hài lòng của khách hàng."
            />

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-gray-400">Người dùng</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-2">{stats?.totalUsers || 0}</p>
                    <p className="text-xs text-blue-600 mt-1">Trong đó có {stats?.totalOwners || 0} chủ nhà</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-gray-400">Homestay & Khách sạn</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-2">{stats?.totalHotels || 0}</p>
                    <p className="text-xs text-amber-600 mt-1">Có {stats?.pendingHotels || 0} homestay chờ duyệt</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-gray-400">Tổng doanh thu toàn sàn</p>
                    <p className="text-3xl font-extrabold text-green-700 mt-2">{currency} {stats?.totalRevenue || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">{stats?.totalBookings || 0} lượt đặt phòng</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-gray-400">Đánh giá & Hài lòng</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-extrabold text-amber-500">★ {stats?.averageRating || 0}</span>
                        <span className="text-xs text-gray-400">/ 5 sao</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stats?.totalReviews || 0} lượt phản hồi</p>
                </div>
            </div>

            {/* Dual Sections: Recent Bookings & Recent Reviews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Bookings */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 text-base mb-4">🛒 Đơn đặt phòng mới nhất</h3>
                    {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                        <div className="space-y-3">
                            {stats.recentBookings.map((b) => (
                                <div key={b._id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                                    <div>
                                        <p className="font-semibold text-gray-800">{b.user?.username || "Khách"} → {b.hotel?.name}</p>
                                        <p className="text-gray-400">{new Date(b.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{currency}{b.totalPrice}</p>
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                            b.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                        }`}>
                                            {b.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400">Chưa có đơn đặt phòng nào.</p>
                    )}
                </div>

                {/* Recent Reviews */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 text-base mb-4">⭐ Đánh giá mới gửi</h3>
                    {stats?.recentReviews && stats.recentReviews.length > 0 ? (
                        <div className="space-y-3">
                            {stats.recentReviews.map((r) => (
                                <div key={r._id} className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-gray-800">{r.user?.username || "Ẩn danh"} @ {r.hotel?.name}</p>
                                        <span className="text-amber-500 font-bold">★ {r.rating}</span>
                                    </div>
                                    <p className="text-gray-600 line-clamp-2 italic">"{r.comment}"</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400">Chưa có đánh giá nào.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
