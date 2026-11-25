import React, { useEffect, useState, useCallback } from 'react';
import Title from '../../components/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ManageHotel = () => {
    const { axios, getToken, user, cities: dynamicCities } = useAppContext();

    const [hasHotel, setHasHotel] = useState(false);
    const [hotelData, setHotelData] = useState({
        name: '',
        contact: '',
        address: '',
        city: '',
        description: '',
        image: '',
        status: 'pending',
        rejectionReason: '',
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const fetchMyHotel = useCallback(async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await axios.get('/api/hotels/my-hotel', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success && data.hotel) {
                setHasHotel(true);
                setHotelData({
                    name: data.hotel.name || '',
                    contact: data.hotel.contact || '',
                    address: data.hotel.address || '',
                    city: data.hotel.city || '',
                    description: data.hotel.description || '',
                    image: data.hotel.image || '',
                    status: data.hotel.status || 'pending',
                    rejectionReason: data.hotel.rejectionReason || '',
                });
            } else {
                setHasHotel(false);
            }
        } catch (error) {
            console.error("Fetch hotel error:", error);
            setHasHotel(false);
        } finally {
            setLoading(false);
        }
    }, [axios, getToken]);

    const handleImageFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (saving) return;

        try {
            setSaving(true);
            const token = await getToken();

            const formData = new FormData();
            formData.append('name', hotelData.name.trim());
            formData.append('contact', hotelData.contact.trim());
            formData.append('address', hotelData.address.trim());
            formData.append('city', hotelData.city.trim());
            formData.append('description', hotelData.description || '');

            if (imageFile) {
                formData.append('image', imageFile);
            } else {
                formData.append('image', hotelData.image || '');
            }

            const { data } = await axios.put('/api/hotels/my-hotel', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (data.success) {
                toast.success(
                    data.message ||
                        (data.created
                            ? 'Tạo hồ sơ homestay thành công!'
                            : 'Cập nhật thông tin homestay thành công!')
                );
                if (data.hotel) {
                    setHasHotel(true);
                    setHotelData({
                        name: data.hotel.name || '',
                        contact: data.hotel.contact || '',
                        address: data.hotel.address || '',
                        city: data.hotel.city || '',
                        description: data.hotel.description || '',
                        image: data.hotel.image || '',
                        status: data.hotel.status || 'pending',
                        rejectionReason: data.hotel.rejectionReason || '',
                    });
                }
                setImageFile(null);
                if (imagePreview) {
                    URL.revokeObjectURL(imagePreview);
                    setImagePreview('');
                }
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
    }, [user, fetchMyHotel]);

    const displayedImage = imagePreview || hotelData.image;

    return (
        <div className="max-w-3xl pb-16">
            <Title
                align="left"
                font="outfit"
                title={hasHotel ? "Quản Lý Thông Tin Homestay" : "Khởi Tạo Hồ Sơ Homestay"}
                subTitle={
                    hasHotel
                        ? "Cập nhật hình ảnh đại diện, thông tin liên hệ, vị trí, địa chỉ và mô tả giới thiệu homestay của bạn để thu hút thêm du khách."
                        : "Tài khoản Chủ nhà của bạn chưa có hồ sơ Homestay. Hãy điền thông tin bên dưới để tạo mới Homestay và bắt đầu đăng phòng."
                }
            />

            {!loading && !hasHotel && (
                <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
                    <span className="text-lg leading-none">🏡</span>
                    <div>
                        <p className="font-bold">Bạn chưa có hồ sơ Homestay</p>
                        <p className="text-amber-800 mt-0.5 leading-relaxed">
                            Hoàn tất biểu mẫu dưới đây để khởi tạo Homestay của bạn. Hồ sơ mới sẽ ở trạng thái{' '}
                            <strong>Chờ duyệt (pending)</strong> và sẽ hiển thị công khai cho khách đặt phòng ngay sau khi Quản trị viên phê duyệt.
                        </p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="py-12 text-gray-500">Đang tải thông tin homestay...</div>
            ) : (
                <form onSubmit={handleSave} className="mt-6 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-semibold">Trạng thái hồ sơ</p>
                            {hasHotel ? (
                                <span className={`inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full ${
                                    hotelData.status === "approved"
                                        ? "bg-green-100 text-green-700"
                                        : hotelData.status === "pending"
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-red-100 text-red-700"
                                }`}>
                                    {hotelData.status === "approved"
                                        ? "Đã được phê duyệt (Đang hiển thị công khai)"
                                        : hotelData.status === "pending"
                                            ? "Đang chờ Quản trị viên phê duyệt"
                                            : "Bị từ chối (Cập nhật và lưu để gửi duyệt lại)"}
                                </span>
                            ) : (
                                <span className="inline-block mt-1 text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                                    Chưa khởi tạo hồ sơ
                                </span>
                            )}
                        </div>
                    </div>

                    {hasHotel && hotelData.status === "rejected" && (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                            <p className="font-bold text-rose-900">Hồ sơ Homestay hiện đang bị từ chối phê duyệt</p>
                            {hotelData.rejectionReason ? (
                                <p>
                                    <strong>Lý do từ Quản trị viên:</strong> {hotelData.rejectionReason}
                                </p>
                            ) : (
                                <p>Vui lòng rà soát lại hình ảnh, địa chỉ và thông tin liên hệ của Homestay.</p>
                            )}
                            <p className="text-[11px] text-rose-700">
                                Khi bạn bấm <strong>Lưu & gửi duyệt lại</strong>, trạng thái hồ sơ sẽ tự động chuyển về <strong>Chờ duyệt</strong>.
                            </p>
                        </div>
                    )}

                    {/* Ảnh đại diện Homestay */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                            Ảnh đại diện Homestay
                        </label>
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                            <div className="w-full sm:w-48 h-32 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0">
                                {displayedImage ? (
                                    <img
                                        src={displayedImage}
                                        alt={hotelData.name || 'Homestay cover'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center px-3 text-gray-400">
                                        <p className="text-xs font-medium">Chưa có ảnh đại diện</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 w-full space-y-2.5">
                                <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1">
                                        Tải ảnh từ thiết bị (JPG, PNG, WEBP — tối đa 10MB):
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageFileChange}
                                        className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-xl"
                                    />
                                    {imageFile && (
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-emerald-600 font-medium truncate">
                                                Đã chọn: {imageFile.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImageFile(null);
                                                    if (imagePreview) {
                                                        URL.revokeObjectURL(imagePreview);
                                                        setImagePreview('');
                                                    }
                                                }}
                                                className="text-xs text-red-500 hover:underline cursor-pointer ml-2"
                                            >
                                                Hủy chọn
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 block mb-1">
                                        Hoặc nhập URL ảnh đại diện:
                                    </label>
                                    <input
                                        type="url"
                                        value={hotelData.image}
                                        onChange={e => setHotelData(prev => ({ ...prev, image: e.target.value }))}
                                        placeholder="https://images.unsplash.com/..."
                                        className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên Homestay / Khách sạn *</label>
                        <input
                            type="text"
                            value={hotelData.name}
                            onChange={e => setHotelData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ví dụ: Mây Lang Thang Homestay & Retreat"
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại liên hệ *</label>
                            <input
                                type="text"
                                value={hotelData.contact}
                                onChange={e => setHotelData(prev => ({ ...prev, contact: e.target.value }))}
                                placeholder="0905 123 456"
                                required
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tỉnh / Thành phố *</label>
                            <input
                                type="text"
                                list="cities-list"
                                value={hotelData.city}
                                onChange={e => setHotelData(prev => ({ ...prev, city: e.target.value }))}
                                placeholder="Đà Lạt, Đà Nẵng, Hà Nội..."
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
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Địa chỉ chi tiết *</label>
                        <input
                            type="text"
                            value={hotelData.address}
                            onChange={e => setHotelData(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
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
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
                    >
                        {saving
                            ? "Đang lưu thay đổi..."
                            : !hasHotel
                                ? "Tạo hồ sơ Homestay"
                                : hotelData.status === "rejected"
                                    ? "Lưu & gửi duyệt lại"
                                    : "Lưu cập nhật"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default ManageHotel;
