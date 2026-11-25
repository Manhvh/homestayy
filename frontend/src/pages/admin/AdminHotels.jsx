import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Title from '../../components/Title';
import Pagination from '../../components/Pagination';
import { useAppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

const AdminHotels = () => {
    const { axios, getToken, currency } = useAppContext();
    const [hotels, setHotels] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [previewHotel, setPreviewHotel] = useState(null);
    const [rejectingHotel, setRejectingHotel] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [submittingAction, setSubmittingAction] = useState(false);

    const fetchHotels = useCallback(async () => {
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
    }, [axios, getToken]);

    const handleUpdateStatus = async (hotelId, status, reason = '') => {
        if (submittingAction) return;
        try {
            setSubmittingAction(true);
            const token = await getToken();
            const payload = { status };
            if (status === 'rejected' && reason.trim()) {
                payload.rejectionReason = reason.trim();
            }
            const { data } = await axios.put(`/api/admin/hotels/${hotelId}/status`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.success(data.message);
                setRejectingHotel(null);
                setRejectionReason('');
                setPreviewHotel(null);
                fetchHotels();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setSubmittingAction(false);
        }
    };

    const openRejectModal = (hotel) => {
        setRejectingHotel(hotel);
        setRejectionReason(hotel.rejectionReason || '');
    };

    useEffect(() => {
        fetchHotels();
    }, [fetchHotels]);

    const filteredHotels = useMemo(() => hotels.filter(h => {
        if (filterStatus === 'all') return true;
        return h.status === filterStatus;
    }), [hotels, filterStatus]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus]);

    const paginatedHotels = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return filteredHotels.slice(startIndex, startIndex + PAGE_SIZE);
    }, [filteredHotels, currentPage]);

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
                                {paginatedHotels.map((hotel) => (
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
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewHotel(hotel)}
                                                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                                                >
                                                    Xem chi tiết
                                                </button>
                                                {hotel.status === "pending" && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            disabled={submittingAction}
                                                            onClick={() => handleUpdateStatus(hotel._id || hotel.id, "approved")}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
                                                        >
                                                            Phê duyệt
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={submittingAction}
                                                            onClick={() => openRejectModal(hotel)}
                                                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                                                        >
                                                            Từ chối
                                                        </button>
                                                    </>
                                                )}
                                                {hotel.status === "approved" && (
                                                    <button
                                                        type="button"
                                                        disabled={submittingAction}
                                                        onClick={() => openRejectModal(hotel)}
                                                        className="px-3 py-1.5 bg-gray-50 hover:bg-rose-50 disabled:opacity-50 text-gray-600 hover:text-rose-600 border border-gray-200 hover:border-rose-200 rounded-lg text-xs font-medium transition cursor-pointer"
                                                        title="Chuyển trạng thái sang từ chối"
                                                    >
                                                        Từ chối
                                                    </button>
                                                )}
                                                {hotel.status === "rejected" && (
                                                    <button
                                                        type="button"
                                                        disabled={submittingAction}
                                                        onClick={() => handleUpdateStatus(hotel._id || hotel.id, "approved")}
                                                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition cursor-pointer"
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
                    {filteredHotels.length > 0 && (
                        <div className="px-6 pb-4">
                            <Pagination
                                currentPage={currentPage}
                                totalItems={filteredHotels.length}
                                pageSize={PAGE_SIZE}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Homestay Detail Preview Modal */}
            {previewHotel && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
                    onClick={() => setPreviewHotel(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[88vh] overflow-y-auto p-6 space-y-5 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setPreviewHotel(null)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold cursor-pointer"
                        >
                            ✕
                        </button>

                        <div className="pr-8">
                            <p className="text-xs font-semibold text-purple-700 uppercase">Hồ sơ kiểm duyệt Homestay</p>
                            <h3 className="text-xl font-bold text-gray-900 mt-1">{previewHotel.name}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {previewHotel.address}, {previewHotel.city} • SĐT: {previewHotel.contact}
                            </p>
                        </div>

                        {previewHotel.image && (
                            <img
                                src={previewHotel.image}
                                alt={previewHotel.name}
                                className="w-full h-48 rounded-xl object-cover border border-gray-200"
                            />
                        )}

                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-xs space-y-1.5">
                            <p className="font-bold text-gray-800">Mô tả giới thiệu</p>
                            <p className="text-gray-600 leading-relaxed">
                                {previewHotel.description || "Chủ nhà chưa bổ sung mô tả."}
                            </p>
                            {previewHotel.rejectionReason && (
                                <p className="text-rose-700 pt-2 border-t border-gray-200">
                                    <strong>Lý do từ chối gần nhất:</strong> {previewHotel.rejectionReason}
                                </p>
                            )}
                        </div>

                        <div>
                            <p className="text-xs font-bold text-gray-800 mb-2">
                                Danh sách phòng thuộc Homestay ({previewHotel.rooms?.length || 0})
                            </p>
                            {previewHotel.rooms && previewHotel.rooms.length > 0 ? (
                                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                    {previewHotel.rooms.map((rm) => (
                                        <div
                                            key={rm.id || rm._id}
                                            className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 bg-white text-xs"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <img
                                                    src={rm.images?.[0] || assets.roomImg1}
                                                    alt={rm.roomType}
                                                    className="w-12 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">{rm.roomType}</p>
                                                    <p className="text-[11px] text-gray-500">
                                                        Tối đa {rm.maxGuests || 2} khách • {rm.isAvailable ? "Đang mở" : "Tạm khóa"}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-blue-700 whitespace-nowrap">
                                                {Number(rm.pricePerNight).toLocaleString("vi-VN")} {currency}/đêm
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">Homestay chưa đăng phòng nào.</p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setPreviewHotel(null)}
                                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                            >
                                Đóng
                            </button>
                            {previewHotel.status !== "rejected" && (
                                <button
                                    type="button"
                                    onClick={() => openRejectModal(previewHotel)}
                                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold cursor-pointer"
                                >
                                    Từ chối
                                </button>
                            )}
                            {previewHotel.status !== "approved" && (
                                <button
                                    type="button"
                                    disabled={submittingAction}
                                    onClick={() => handleUpdateStatus(previewHotel._id || previewHotel.id, "approved")}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm cursor-pointer"
                                >
                                    Phê duyệt ngay
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Reason Modal */}
            {rejectingHotel && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
                    onClick={() => !submittingAction && setRejectingHotel(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6 space-y-4 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-gray-900">Từ chối phê duyệt Homestay</h3>
                        <p className="text-xs text-gray-500">
                            Homestay: <strong className="text-gray-800">{rejectingHotel.name}</strong>
                        </p>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Lý do từ chối (gửi tới Chủ nhà để chỉnh sửa) *
                            </label>
                            <textarea
                                rows={3}
                                required
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="VD: Ảnh đại diện mờ, địa chỉ chưa đầy đủ số nhà/phường hoặc SĐT không liên hệ được..."
                                className="w-full border border-gray-300 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-rose-500"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                disabled={submittingAction}
                                onClick={() => setRejectingHotel(null)}
                                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                disabled={submittingAction || !rejectionReason.trim()}
                                onClick={() =>
                                    handleUpdateStatus(
                                        rejectingHotel._id || rejectingHotel.id,
                                        "rejected",
                                        rejectionReason
                                    )
                                }
                                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm cursor-pointer"
                            >
                                {submittingAction ? "Đang xử lý..." : "Xác nhận từ chối"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHotels;
