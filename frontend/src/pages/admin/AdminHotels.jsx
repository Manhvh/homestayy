import React, { useEffect, useState } from 'react';
import Title from '../../components/Title';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
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
        <div className="w-full space-y-6">
            <Title
                align="left"
                font="outfit"
                title="Duyệt Tin"
                subTitle="Kiểm duyệt thông tin homestay của chủ nhà đối tác trước khi hiển thị công khai trên hệ thống tìm kiếm cho du khách."
            />

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'pending', label: 'Chờ duyệt' },
                    { id: 'approved', label: 'Đã phê duyệt' },
                    { id: 'rejected', label: 'Bị từ chối' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
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
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden w-full">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase tracking-wider whitespace-nowrap">
                                <tr>
                                    <th className="py-3 px-6 text-left">Homestay</th>
                                    <th className="py-3 px-6 text-left">Chủ nhà</th>
                                    <th className="py-3 px-4 text-center">Số phòng</th>
                                    <th className="py-3 px-4 text-center">Lượt đặt</th>
                                    <th className="py-3 px-6 text-center">Trạng thái</th>
                                    <th className="py-3 px-6 text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredHotels.map((hotel) => (
                                    <tr key={hotel._id || hotel.id} className="hover:bg-gray-50/70 transition-colors">
                                        <td className="py-4 px-6 min-w-[280px]">
                                            <div className="flex items-center gap-3.5">
                                                {hotel.image && (
                                                    <img
                                                        src={hotel.image}
                                                        alt={hotel.name}
                                                        className="w-16 h-12 rounded-xl object-cover border border-gray-200 shadow-2xs flex-shrink-0"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{hotel.name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{hotel.address}, {hotel.city}</p>
                                                    <p className="text-xs text-blue-600 font-medium mt-0.5">SĐT: {hotel.contact}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-4 px-6 min-w-[200px]">
                                            <div className="flex items-center gap-2.5">
                                                <img
                                                    src={hotel.owner?.image || assets.userIcon}
                                                    alt="owner"
                                                    className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-xs">{hotel.owner?.username || "Chủ nhà"}</p>
                                                    <p className="text-[11px] text-gray-400">{hotel.owner?.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-4 px-4 text-center font-bold text-gray-800 whitespace-nowrap">
                                            {hotel.roomCount || 0}
                                        </td>

                                        <td className="py-4 px-4 text-center font-bold text-gray-800 whitespace-nowrap">
                                            {hotel.bookingCount || 0}
                                        </td>

                                        <td className="py-4 px-6 text-center whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shadow-2xs ${
                                                hotel.status === "approved"
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                    : hotel.status === "rejected"
                                                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                                                        : "bg-amber-50 text-amber-700 border border-amber-200"
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    hotel.status === "approved"
                                                        ? "bg-emerald-500"
                                                        : hotel.status === "rejected"
                                                            ? "bg-rose-500"
                                                            : "bg-amber-500 animate-pulse"
                                                }`} />
                                                {hotel.status === "approved" ? "Đã duyệt" : hotel.status === "rejected" ? "Từ chối" : "Chờ duyệt"}
                                            </span>
                                        </td>

                                        <td className="py-4 px-6 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-2">
                                                {hotel.status === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(hotel._id || hotel.id, "approved")}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                                                        >
                                                            Phê duyệt
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(hotel._id || hotel.id, "rejected")}
                                                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                                                        >
                                                            Từ chối
                                                        </button>
                                                    </>
                                                )}
                                                {hotel.status === "approved" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(hotel._id || hotel.id, "rejected")}
                                                        className="px-3 py-1.5 bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-600 border border-gray-200 hover:border-rose-200 rounded-lg text-xs font-medium transition cursor-pointer"
                                                        title="Chuyển trạng thái sang từ chối"
                                                    >
                                                        Từ chối
                                                    </button>
                                                )}
                                                {hotel.status === "rejected" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(hotel._id || hotel.id, "approved")}
                                                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                                                    >
                                                        Phê duyệt
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
