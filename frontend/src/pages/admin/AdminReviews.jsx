import React, { useEffect, useState } from 'react';
import Title from '../../components/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const AdminReviews = () => {
    const { axios, getToken } = useAppContext();
    const [stats, setStats] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await axios.get('/api/reviews/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setStats(data.stats);
                setReviews(data.stats.recentReviews || []);
            }
        } catch (error) {
            console.error("Fetch reviews stats error:", error);
            toast.error("Lỗi khi tải thống kê đánh giá.");
        } finally {
            setLoading(false);
        }
    };

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
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const total = stats?.totalReviews || 0;
    const breakdown = stats?.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    return (
        <div className="max-w-5xl space-y-8">
            <Title
                align="left"
                font="outfit"
                title="Thống Kê Đánh Giá & Phản Hồi Về Homestay"
                subTitle="Theo dõi mức độ hài lòng của du khách, phân bổ sao đánh giá và kiểm duyệt các nội dung phản hồi về các homestay trên hệ thống."
            />

            {/* Overview & Rating Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
                    <span className="text-5xl font-black text-amber-500">★ {stats?.averageRating || "0.0"}</span>
                    <p className="text-sm font-semibold text-gray-700 mt-2">Điểm đánh giá trung bình</p>
                    <p className="text-xs text-gray-400 mt-1">Dựa trên {total} lượt đánh giá thực tế</p>
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
                                    <span className="w-12 text-right text-gray-500">{count} ({pct}%)</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-base">📝 Toàn bộ danh sách đánh giá & phản hồi</h3>

                {loading ? (
                    <div className="py-12 text-gray-500">Đang tải danh sách đánh giá...</div>
                ) : reviews.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 text-sm">
                        Chưa có đánh giá nào từ người dùng.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reviews.map((r) => (
                            <div key={r._id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={r.user?.image}
                                            alt="avatar"
                                            className="w-8 h-8 rounded-full object-cover border"
                                        />
                                        <div>
                                            <span className="font-semibold text-gray-900 text-sm">{r.user?.username || "Khách"}</span>
                                            <span className="text-gray-400 text-xs ml-2">đã đánh giá</span>
                                            <strong className="text-blue-600 text-xs ml-1">{r.hotel?.name || "Homestay"}</strong>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-400 text-sm">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={i < r.rating ? "text-amber-400" : "text-gray-300"}>★</span>
                                        ))}
                                        <span className="text-xs text-gray-400 ml-2">{new Date(r.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="text-gray-700 text-sm mt-1 leading-relaxed">"{r.comment}"</p>
                                </div>

                                <button
                                    onClick={() => handleDeleteReview(r._id)}
                                    className="px-3 py-1 text-xs border border-red-200 text-red-600 hover:bg-red-50 rounded-lg self-end sm:self-start transition font-medium"
                                >
                                    Xóa đánh giá
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReviews;
