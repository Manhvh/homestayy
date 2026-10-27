import React, { useEffect, useState } from 'react';
import Title from '../../components/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ManageHotel = () => {
    const { axios, getToken, user, cities: dynamicCities } = useAppContext();

    const [hotelData, setHotelData] = useState({
        name: '',
        contact: '',
        address: '',
        city: '',
        description: '',
        image: '',
        status: 'approved',
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchMyHotel = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await axios.get('/api/hotels/my-hotel', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success && data.hotel) {
                setHotelData({
                    name: data.hotel.name || '',
                    contact: data.hotel.contact || '',
                    address: data.hotel.address || '',
                    city: data.hotel.city || '',
                    description: data.hotel.description || '',
                    image: data.hotel.image || '',
                    status: data.hotel.status || 'approved',
                });
            }
        } catch (error) {
            console.error("Fetch hotel error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const token = await getToken();
            const { data } = await axios.put('/api/hotels/my-hotel', hotelData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message || "Cập nhật thông tin homestay thành công!");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMyHotel();
        }
    }, [user]);

    return (
        <div className="max-w-3xl pb-16">
            <Title
                align="left"
                font="outfit"
                title="Quản Lý Thông Tin Homestay"
                subTitle="Cập nhật thông tin liên hệ, vị trí, địa chỉ và mô tả giới thiệu homestay của bạn để thu hút thêm du khách."
            />

            {loading ? (
                <div className="py-12 text-gray-500">Đang tải thông tin homestay...</div>
            ) : (
                <form onSubmit={handleSave} className="mt-8 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-semibold">Trạng thái hồ sơ</p>
                            <span className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full ${
                                hotelData.status === "approved" 
                                    ? "bg-green-100 text-green-700" 
                                    : hotelData.status === "pending" 
                                        ? "bg-amber-100 text-amber-700" 
                                        : "bg-red-100 text-red-700"
                            }`}>
                                {hotelData.status === "approved" ? "✓ Đã được phê duyệt" : hotelData.status === "pending" ? "⏳ Đang chờ duyệt" : "✕ Bị từ chối"}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên Homestay / Khách sạn</label>
                        <input
                            type="text"
                            value={hotelData.name}
                            onChange={e => setHotelData(prev => ({ ...prev, name: e.target.value }))}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại liên hệ</label>
                            <input
                                type="text"
                                value={hotelData.contact}
                                onChange={e => setHotelData(prev => ({ ...prev, contact: e.target.value }))}
                                required
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tỉnh / Thành phố</label>
                            <input
                                type="text"
                                list="cities-list"
                                value={hotelData.city}
                                onChange={e => setHotelData(prev => ({ ...prev, city: e.target.value }))}
                                required
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <datalist id="cities-list">
                                {dynamicCities && dynamicCities.map((city, idx) => (
                                    <option key={idx} value={city} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Địa chỉ chi tiết</label>
                        <input
                            type="text"
                            value={hotelData.address}
                            onChange={e => setHotelData(prev => ({ ...prev, address: e.target.value }))}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả giới thiệu</label>
                        <textarea
                            rows="4"
                            value={hotelData.description}
                            onChange={e => setHotelData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Giới thiệu về không gian homestay, phong cảnh xung quanh, trải nghiệm du lịch..."
                            className="w-full border border-gray-300 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition disabled:opacity-50"
                    >
                        {saving ? "Đang lưu thay đổi..." : "Lưu cập nhật"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default ManageHotel;
