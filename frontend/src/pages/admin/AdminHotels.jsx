import React, { useEffect, useState } from 'react';
import Title from '../../components/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AdminHotels = () => {
    const { axios, getToken } = useAppContext();
    const [hotels, setHotels] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [loading, setLoading] = useState(true);

    const fetchHotels = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await axios.get('/api/admin/hotels', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setHotels(data.hotels || []);
            }
        } catch (error) {
            console.error("Fetch hotels error:", error);
            toast.error("Không thể tải danh sách homestay.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (hotelId, status) => {
        try {
            const token = await getToken();
            const { data } = await axios.put(`/api/admin/hotels/${hotelId}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.success(data.message);
                fetchHotels();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchHotels();
    }, []);

    const filteredHotels = hotels.filter(h => {
        if (filterStatus === 'all') return true;
        return h.status === filterStatus;
    });

    return (
        <div className="max-w-6xl space-y-6">
            <Title
                align="left"
                font="outfit"
                title="Duyệt Tin Đăng Homestay & Khách Sạn"
                subTitle="Kiểm duyệt thông tin homestay của chủ nhà đối tác trước khi hiển thị công khai trên hệ thống tìm kiếm cho du khách."
            />

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'pending', label: '⏳ Chờ duyệt' },
                    { id: 'approved', label: '✓ Đã phê duyệt' },
                    { id: 'rejected', label: '✕ Bị từ chối' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                            filterStatus === tab.id
                                ? 'bg-purple-700 text-white shadow-sm'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-12 text-gray-500">Đang tải danh sách homestay...</div>
            ) : filteredHotels.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 text-sm">
                    Không có homestay nào trong trạng thái này.
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase">
                                <tr>
                                    <th className="py-3 px-4">Homestay / Vị trí</th>
                                    <th className="py-3 px-4">Chủ nhà (Partner)</th>
                                    <th className="py-3 px-4 text-center">Số phòng</th>
                                    <th className="py-3 px-4 text-center">Lượt đặt</th>
                                    <th className="py-3 px-4 text-center">Trạng thái</th>
                                    <th className="py-3 px-4 text-center">Hành động kiểm duyệt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredHotels.map((hotel) => (
                                    <tr key={hotel._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <p className="font-bold text-gray-900">{hotel.name}</p>
                                            <p className="text-xs text-gray-500">{hotel.address}, {hotel.city}</p>
                                            <p className="text-xs text-blue-600">SĐT: {hotel.contact}</p>
                                        </td>

                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={hotel.owner?.image}
                                                    alt="owner"
                                                    className="w-7 h-7 rounded-full object-cover border"
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-xs">{hotel.owner?.username || "Chủ nhà"}</p>
                                                    <p className="text-[11px] text-gray-400">{hotel.owner?.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3 px-4 text-center font-bold text-gray-800">
                                            {hotel.roomCount || 0}
                                        </td>

                                        <td className="py-3 px-4 text-center font-bold text-gray-800">
                                            {hotel.bookingCount || 0}
                                        </td>

                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                hotel.status === "approved"
                                                    ? "bg-green-100 text-green-700"
                                                    : hotel.status === "rejected"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-amber-100 text-amber-700"
                                            }`}>
                                                {hotel.status === "approved" ? "✓ Đã duyệt" : hotel.status === "rejected" ? "✕ Từ chối" : "⏳ Chờ duyệt"}
                                            </span>
                                        </td>

                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {hotel.status !== "approved" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(hotel._id, "approved")}
                                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                                                    >
                                                        Phê duyệt
                                                    </button>
                                                )}
                                                {hotel.status !== "rejected" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(hotel._id, "rejected")}
                                                        className="px-3 py-1 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition"
                                                    >
                                                        Từ chối
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHotels;
