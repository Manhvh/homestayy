import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Title from '../../components/Title';
import Pagination from '../../components/Pagination';
import { useAppContext } from '../../context/AppContext';
import { getAvatarUrl } from '../../utils/formatters';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

const AdminReviews = () => {
    const { axios, getToken } = useAppContext();
    const [stats, setStats] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [hotelStats, setHotelStats] = useState([]);
    const [filterHotelId, setFilterHotelId] = useState('all');
    const [filterStar, setFilterStar] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const params = {};
            if (filterHotelId !== 'all') params.hotelId = filterHotelId;
            if (filterStar !== 'all') params.rating = filterStar;

            const { data } = await axios.get('/api/reviews/stats', {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });
            if (data.success) {
                setStats(data.stats);
                setReviews(data.stats.recentReviews || []);
                setHotelStats(data.stats.hotelStats || []);
            }
        } catch (error) {
            console.error("Fetch reviews stats error:", error);
            toast.error("Lỗi khi tải thống kê đánh giá.");
        } finally {
            setLoading(false);
        }
    }, [axios, getToken, filterHotelId, filterStar]);

    const handleDeleteReview = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;

        try {
            const token = await getToken();
            const { data } = await axios.delete(`/api/reviews/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message);
                fetchReviews();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const filteredReviews = useMemo(() => {
        const kw = searchKeyword.trim().toLowerCase();
        if (!kw) return reviews;
        return reviews.filter((r) => {
            const uName = String(r.user?.username || '').toLowerCase();
            const hName = String(r.hotel?.name || '').toLowerCase();
            const comment = String(r.comment || '').toLowerCase();
            const reply = String(r.ownerReply || '').toLowerCase();
            return uName.includes(kw) || hName.includes(kw) || comment.includes(kw) || reply.includes(kw);
        });
    }, [reviews, searchKeyword]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterHotelId, filterStar, searchKeyword]);

    const total = stats?.totalReviews || 0;
    const breakdown = stats?.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    const paginatedReviews = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return filteredReviews.slice(startIndex, startIndex + PAGE_SIZE);
    }, [filteredReviews, currentPage]);

    const hasActiveFilters = filterHotelId !== 'all' || filterStar !== 'all' || searchKeyword.trim() !== '';

    return (
        <div className="w-full space-y-8">
            <Title
                align="left"
                font="outfit"
                title="Thống Kê & Kiểm Duyệt Đánh Giá"
                subTitle="Theo dõi điểm đánh giá theo từng Homestay, phân bổ số sao toàn sàn, lọc theo tiêu chí và kiểm duyệt các nội dung phản hồi."
            />

            {/* Overview & Rating Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
                    <span className="text-5xl font-black text-amber-500">★ {stats?.averageRating || "0.0"}</span>
                    <p className="text-sm font-semibold text-gray-700 mt-2">
                        {filterHotelId !== 'all' || filterStar !== 'all'
                            ? 'Điểm trung bình theo bộ lọc'
                            : 'Điểm đánh giá trung bình toàn sàn'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Dựa trên <strong>{total}</strong> lượt đánh giá
                        {stats?.overallTotalReviews !== undefined && stats.overallTotalReviews !== total
                            ? ` (Tổng toàn sàn: ${stats.overallTotalReviews})`
                            : ''}
                    </p>
                </div>

                <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-sm font-bold text-gray-800 mb-3">Phân bổ đánh giá theo số sao</p>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = breakdown[star] || 0;
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                            return (
                                <div key={star} className="flex items-center gap-3 text-xs">
                                    <span className="w-12 text-gray-600 font-medium">{star} sao</span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-amber-400 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="w-16 text-right text-gray-500">{count} ({pct}%)</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Per-Homestay Rating Statistics */}
            {hotelStats.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h3 className="font-bold text-gray-900 text-base">
                                Thống kê điểm đánh giá theo từng Homestay
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Nhấp vào một Homestay để lọc nhanh danh sách đánh giá bên dưới.
                            </p>
                        </div>
                        {filterHotelId !== 'all' && (
                            <button
                                type="button"
                                onClick={() => setFilterHotelId('all')}
                                className="text-xs font-semibold text-purple-700 hover:underline cursor-pointer"
                            >
                                Xem tất cả Homestay
                            </button>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                                <tr>
                                    <th className="py-3 px-5">Homestay</th>
                                    <th className="py-3 px-4">Khu vực</th>
                                    <th className="py-3 px-4 text-center">Điểm TB</th>
                                    <th className="py-3 px-4 text-center">Lượt đánh giá</th>
                                    <th className="py-3 px-4 text-center">5★ / 4★ / ≤3★</th>
                                    <th className="py-3 px-4 text-right">Lọc nhanh</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {hotelStats.map((hs) => {
                                    const isSelected = String(filterHotelId) === String(hs.hotelId);
                                    const lowStars =
                                        (hs.ratingBreakdown?.[3] || 0) +
                                        (hs.ratingBreakdown?.[2] || 0) +
                                        (hs.ratingBreakdown?.[1] || 0);
                                    return (
                                        <tr
                                            key={hs.hotelId}
                                            onClick={() =>
                                                setFilterHotelId(isSelected ? 'all' : String(hs.hotelId))
                                            }
                                            className={`cursor-pointer transition-colors ${
                                                isSelected ? 'bg-purple-50/70' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <td className="py-3 px-5 font-semibold text-gray-900">
                                                {hs.hotelName}
                                            </td>
                                            <td className="py-3 px-4 text-gray-500">{hs.city}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                                                    ★ {hs.totalReviews > 0 ? hs.averageRating.toFixed(1) : '0.0'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center font-bold text-gray-800">
                                                {hs.totalReviews}
                                            </td>
                                            <td className="py-3 px-4 text-center text-gray-600 font-mono">
                                                <span className="text-emerald-600 font-semibold">{hs.ratingBreakdown?.[5] || 0}</span>
                                                {' / '}
                                                <span className="text-blue-600 font-semibold">{hs.ratingBreakdown?.[4] || 0}</span>
                                                {' / '}
                                                <span className={lowStars > 0 ? 'text-rose-600 font-semibold' : 'text-gray-400'}>
                                                    {lowStars}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span
                                                    className={`px-2.5 py-1 rounded-lg font-semibold ${
                                                        isSelected
                                                            ? 'bg-purple-600 text-white'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    {isSelected ? 'Đang lọc' : 'Xem đánh giá'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Filter Toolbar: Homestay + Star Rating + Keyword */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Homestay select */}
                    <select
                        value={filterHotelId}
                        onChange={(e) => setFilterHotelId(e.target.value)}
                        className="px-3 py-2 text-xs font-medium border border-gray-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="all">Tất cả Homestay ({hotelStats.length})</option>
                        {hotelStats.map((hs) => (
                            <option key={hs.hotelId} value={hs.hotelId}>
                                {hs.hotelName} ({hs.totalReviews})
                            </option>
                        ))}
                    </select>

                    {/* Star buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        {[
                            { label: 'Tất cả sao', value: 'all' },
                            { label: '5 ★', value: '5' },
                            { label: '4 ★', value: '4' },
                            { label: '3 ★', value: '3' },
                            { label: '2 ★', value: '2' },
                            { label: '1 ★', value: '1' },
                        ].map((st) => (
                            <button
                                key={st.value}
                                type="button"
                                onClick={() => setFilterStar(st.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                    filterStar === st.value
                                        ? 'bg-purple-600 text-white shadow-xs'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {st.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="Tìm tên khách, homestay, nội dung..."
                        className="w-full sm:w-64 px-3.5 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={() => {
                                setFilterHotelId('all');
                                setFilterStar('all');
                                setSearchKeyword('');
                            }}
                            className="text-xs font-semibold text-red-600 hover:underline whitespace-nowrap cursor-pointer"
                        >
                            Đặt lại
                        </button>
                    )}
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-base">
                    Danh sách đánh giá & phản hồi ({filteredReviews.length})
                </h3>

                {loading ? (
                    <div className="py-12 text-gray-500">Đang tải danh sách đánh giá...</div>
                ) : filteredReviews.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 text-sm">
                        Không có đánh giá nào khớp với bộ lọc hiện tại.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {paginatedReviews.map((r) => (
                            <div key={r._id || r.id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={getAvatarUrl(r.user)}
                                            alt="avatar"
                                            className="w-8 h-8 rounded-full object-cover border"
                                        />
                                        <div>
                                            <span className="font-semibold text-gray-900 text-sm">{r.user?.username || "Khách"}</span>
                                            <span className="text-gray-400 text-xs ml-2">đã đánh giá</span>
                                            <strong className="text-blue-600 text-xs ml-1">{r.hotel?.name || "Homestay"}</strong>
                                            {r.room?.roomType && (
                                                <span className="text-[11px] text-gray-500 ml-1.5">({r.room.roomType})</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-400 text-sm">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={i < r.rating ? "text-amber-400" : "text-gray-300"}>★</span>
                                        ))}
                                        <span className="text-xs text-gray-400 ml-2">{new Date(r.createdAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                    <p className="text-gray-700 text-sm mt-1 leading-relaxed">"{r.comment}"</p>

                                    {r.ownerReply && (
                                        <div className="mt-2 bg-blue-50/70 border-l-4 border-blue-500 rounded-r-lg px-3.5 py-2.5 text-xs">
                                            <p className="font-bold text-blue-900">
                                                Phản hồi từ Chủ homestay
                                                {r.repliedAt && (
                                                    <span className="font-normal text-gray-500 ml-2">
                                                        • {new Date(r.repliedAt).toLocaleString('vi-VN')}
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-gray-700 mt-0.5">{r.ownerReply}</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleDeleteReview(r._id || r.id)}
                                    className="px-3 py-1 text-xs border border-red-200 text-red-600 hover:bg-red-50 rounded-lg self-end sm:self-start transition font-medium cursor-pointer whitespace-nowrap"
                                >
                                    Xóa đánh giá
                                </button>
                            </div>
                        ))}
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredReviews.length}
                            pageSize={PAGE_SIZE}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReviews;
