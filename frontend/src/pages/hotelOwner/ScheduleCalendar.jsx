import React, { useEffect, useState } from 'react';
import Title from '../../components/Title';
import { useAppContext } from '../../context/AppContext';

const ScheduleCalendar = () => {
    const { axios, getToken, user, currency } = useAppContext();
    const [bookings, setBookings] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [loading, setLoading] = useState(false);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await axios.get('/api/bookings/hotel', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success && data.dashboardData) {
                setBookings(data.dashboardData.bookings || []);
            }
        } catch (error) {
            console.error("Fetch calendar error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user]);

    const filtered = bookings.filter(b => {
        if (filterStatus === 'all') return true;
        return b.status === filterStatus;
    });

    // Group bookings by upcoming, active, and past
    const now = new Date();
    const activeStays = filtered.filter(b => {
        const inDate = new Date(b.checkInDate);
        const outDate = new Date(b.checkOutDate);
        return inDate <= now && outDate >= now && b.status !== 'cancelled';
    });

    const upcomingStays = filtered.filter(b => {
        const inDate = new Date(b.checkInDate);
        return inDate > now && b.status !== 'cancelled';
    });

    const pastStays = filtered.filter(b => {
        const outDate = new Date(b.checkOutDate);
        return outDate < now || b.status === 'cancelled';
    });

    return (
        <div className="pb-16 max-w-5xl">
            <Title
                align="left"
                font="outfit"
                title="Theo Dõi Lịch Đặt Phòng (Booking Schedule)"
                subTitle="Theo dõi chi tiết các lượt khách đang lưu trú, các đợt khách sắp nhận phòng và lịch sử các chuyến đi tại homestay của bạn."
            />

            {/* Quick Status Filters */}
            <div className="flex gap-2 my-6">
                {['all', 'confirmed', 'pending', 'cancelled'].map((st) => (
                    <button
                        key={st}
                        onClick={() => setFilterStatus(st)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                            filterStatus === st 
                                ? 'bg-blue-600 text-white shadow-sm' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {st === 'all' ? 'Tất cả đơn' : st === 'confirmed' ? '✓ Đã duyệt' : st === 'pending' ? '⏳ Chờ duyệt' : '✕ Đã hủy'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-12 text-gray-500">Đang tải lịch đặt phòng...</div>
            ) : (
                <div className="space-y-8">
                    {/* Active Stays */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
                            <h3 className="font-bold text-gray-900 text-base">Khách đang lưu trú tại homestay ({activeStays.length})</h3>
                        </div>
                        {activeStays.length === 0 ? (
                            <p className="text-xs text-gray-400 bg-white p-4 rounded-xl border border-gray-200">Hiện tại không có phòng nào đang có khách lưu trú.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeStays.map(b => (
                                    <div key={b._id} className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-900">{b.user?.username || "Khách hàng"}</p>
                                                <p className="text-xs text-gray-500">{b.room?.roomType} • {b.guests} khách</p>
                                            </div>
                                            <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">Đang ở</span>
                                        </div>
                                        <div className="mt-3 text-xs text-gray-600 pt-2 border-t border-green-200 flex justify-between">
                                            <span>Trả phòng: <strong>{new Date(b.checkOutDate).toLocaleDateString()}</strong></span>
                                            <span>Tổng: <strong>{currency}{b.totalPrice}</strong></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upcoming Stays */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                            <h3 className="font-bold text-gray-900 text-base">Khách sắp nhận phòng ({upcomingStays.length})</h3>
                        </div>
                        {upcomingStays.length === 0 ? (
                            <p className="text-xs text-gray-400 bg-white p-4 rounded-xl border border-gray-200">Chưa có lịch nhận phòng sắp tới.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {upcomingStays.map(b => (
                                    <div key={b._id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-900">{b.user?.username || "Khách hàng"}</p>
                                                <p className="text-xs text-gray-500">{b.room?.roomType} • {b.guests} khách</p>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {b.status === 'confirmed' ? 'Đã duyệt' : 'Chờ duyệt'}
                                            </span>
                                        </div>
                                        <div className="mt-3 text-xs text-gray-600 pt-2 border-t border-gray-100 flex justify-between">
                                            <span>Nhận phòng: <strong>{new Date(b.checkInDate).toLocaleDateString()}</strong></span>
                                            <span>Trả phòng: <strong>{new Date(b.checkOutDate).toLocaleDateString()}</strong></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Past or Cancelled Stays */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="h-3 w-3 rounded-full bg-gray-400"></span>
                            <h3 className="font-bold text-gray-900 text-base">Lịch sử các chuyến đi trước đây ({pastStays.length})</h3>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                                    <tr>
                                        <th className="py-2.5 px-3">Khách hàng</th>
                                        <th className="py-2.5 px-3">Loại phòng</th>
                                        <th className="py-2.5 px-3">Khoảng ngày</th>
                                        <th className="py-2.5 px-3">Doanh thu</th>
                                        <th className="py-2.5 px-3">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pastStays.slice(0, 10).map(b => (
                                        <tr key={b._id}>
                                            <td className="py-2 px-3 font-medium">{b.user?.username || "Khách"}</td>
                                            <td className="py-2 px-3">{b.room?.roomType}</td>
                                            <td className="py-2 px-3">{new Date(b.checkInDate).toLocaleDateString()} - {new Date(b.checkOutDate).toLocaleDateString()}</td>
                                            <td className="py-2 px-3 font-semibold">{currency}{b.totalPrice}</td>
                                            <td className="py-2 px-3">
                                                <span className={b.status === 'cancelled' ? 'text-red-500' : 'text-gray-500'}>
                                                    {b.status === 'cancelled' ? 'Đã hủy' : 'Hoàn tất'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleCalendar;
