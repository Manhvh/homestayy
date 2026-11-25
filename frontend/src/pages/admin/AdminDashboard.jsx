import React, { useEffect, useState, useCallback } from 'react';
import Title from '../../components/Title';
import RevenueChart from '../../components/RevenueChart';
import { useAppContext } from '../../context/AppContext';
import { downloadCsv } from '../../utils/csvExport';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { axios, getToken, currency } = useAppContext();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
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
    }, [axios, getToken]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleExportCsv = () => {
        if (!stats) return;
        const todayStr = new Date().toISOString().split('T')[0];

        const headers = [
            'Tháng',
            'Tổng số đơn',
            'Đơn đã xác nhận',
            'Đơn đã hủy',
            `Doanh thu đã xác nhận (${currency})`,
            `Doanh thu đã thanh toán VNPay (${currency})`,
        ];

        const monthlyRows = (stats.monthlyRevenue || []).map((m) => [
            m.month,
            m.totalBookings || 0,
            m.confirmedBookings || 0,
            m.cancelledBookings || 0,
            Number(m.revenue) || 0,
            Number(m.paidRevenue) || 0,
        ]);

        const summaryRows = [
            [],
            ['TỔNG QUAN TOÀN HỆ THỐNG'],
            ['Tổng người dùng', stats.totalUsers || 0],
            ['Tổng Chủ homestay', stats.totalOwners || 0],
            ['Tổng Homestay', stats.totalHotels || 0],
            ['Homestay đã duyệt', stats.approvedHotels || 0],
            ['Homestay chờ duyệt', stats.pendingHotels || 0],
            ['Tổng lượt đặt phòng', stats.totalBookings || 0],
            ['Tổng đơn đã xác nhận', stats.confirmedBookings || 0],
            [`Tổng doanh thu đã duyệt (${currency})`, Number(stats.totalRevenue) || 0],
            [`Tổng doanh thu VNPay (${currency})`, Number(stats.onlineRevenue) || 0],
            ['Tổng đánh giá', stats.totalReviews || 0],
            ['Điểm đánh giá trung bình', stats.averageRating || 0],
        ];

        downloadCsv({
            filename: `bao-cao-thong-ke-admin-${todayStr}.csv`,
            headers,
            rows: [...monthlyRows, ...summaryRows],
        });
        toast.success('Đã xuất báo cáo thống kê CSV thành công!');
    };

    if (loading) {
        return <div className="py-12 text-gray-500">Đang tải dữ liệu báo cáo thống kê...</div>;
    }

    return (
        <div className="w-full space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <Title
                    align="left"
                    font="outfit"
                    title="Tổng Quan Hệ Thống"
                    subTitle="Theo dõi tăng trưởng người dùng, tình trạng kiểm duyệt tin homestay, doanh số giao dịch 6 tháng gần nhất và mức độ hài lòng của khách hàng."
                />
                <button
                    type="button"
                    onClick={handleExportCsv}
                    className="self-start sm:self-end inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition cursor-pointer whitespace-nowrap"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <span>Xuất báo cáo CSV</span>
                </button>
            </div>

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
                    <p className="text-xs text-amber-600 mt-1">
                        {stats?.approvedHotels || 0} đã duyệt • {stats?.pendingHotels || 0} chờ duyệt
                    </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-gray-400">Doanh thu (Đơn xác nhận)</p>
                    <p className="text-2xl font-extrabold text-green-700 mt-2">
                        {Number(stats?.totalRevenue || 0).toLocaleString('vi-VN')} {currency}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {stats?.confirmedBookings || 0} / {stats?.totalBookings || 0} đơn đã duyệt • VNPay: {Number(stats?.onlineRevenue || 0).toLocaleString('vi-VN')} {currency}
                    </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-gray-400">Đánh giá</p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-extrabold text-amber-500">★ {stats?.averageRating || 0}</span>
                        <span className="text-xs text-gray-400">/ 5 sao</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stats?.totalReviews || 0} lượt phản hồi</p>
                </div>
            </div>

            {/* 6-Month Revenue Chart */}
            <RevenueChart
                data={stats?.monthlyRevenue || []}
                currency={currency}
                accent="purple"
                title="Biểu Đồ Doanh Thu Toàn Sàn (6 Tháng Gần Nhất)"
                subtitle="Thống kê doanh thu thực nhận từ các đơn đặt phòng đã xác nhận trên toàn hệ thống HomeStay"
                onExportCsv={handleExportCsv}
                exportLabel="Xuất báo cáo CSV"
            />

            {/* Dual Sections: Recent Bookings & Recent Reviews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Bookings */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 text-base mb-4">Đơn đặt phòng mới nhất</h3>
                    {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                        <div className="space-y-3">
                            {stats.recentBookings.slice(0, 6).map((b) => (
                                <div key={b.id || b._id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs gap-2">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-800 truncate">{b.user?.username || "Khách"} → {b.hotel?.name}</p>
                                        <p className="text-gray-400">{new Date(b.createdAt).toLocaleString('vi-VN')}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-gray-900">{Number(b.totalPrice).toLocaleString('vi-VN')} {currency}</p>
                                        <div className="flex items-center justify-end gap-1 mt-0.5">
                                            {b.isPaid && (
                                                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                                                    VNPay
                                                </span>
                                            )}
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                b.status === "confirmed" ? "bg-green-100 text-green-700" : b.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                            }`}>
                                                {b.status === "confirmed" ? "Đã duyệt" : b.status === "cancelled" ? "Đã hủy" : "Chờ duyệt"}
                                            </span>
                                        </div>
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
                                <div key={r.id || r._id} className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
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
