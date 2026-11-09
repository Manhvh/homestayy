import React, { useEffect, useState, useMemo } from "react";
import Title from "../../components/Title";
import Pagination from "../../components/Pagination";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

const OwnerReviews = () => {
  const { axios, getToken, user } = useAppContext();

  const [hotelInfo, setHotelInfo] = useState(null);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Filters
  const [filterStar, setFilterStar] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOwnerReviews = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get("/api/reviews/owner", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setHotelInfo(data.hotel);
        setStats(
          data.stats || {
            totalReviews: 0,
            averageRating: 0,
            ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          }
        );
        setReviews(data.reviews || []);
      } else {
        toast.error(data.message || "Không thể tải danh sách đánh giá.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (deletingId) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này khỏi homestay của bạn?")) {
      return;
    }

    try {
      setDeletingId(reviewId);
      const token = await getToken();
      const { data } = await axios.delete(`/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(data.message);
        fetchOwnerReviews();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOwnerReviews();
    }
  }, [user]);

  const filteredReviews = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    return reviews.filter((r) => {
      if (filterStar !== "all" && Number(r.rating) !== Number(filterStar)) {
        return false;
      }
      if (kw) {
        const userStr = String(r.user?.username || "").toLowerCase();
        const commentStr = String(r.comment || "").toLowerCase();
        const roomStr = String(r.room?.roomType || "").toLowerCase();
        if (!userStr.includes(kw) && !commentStr.includes(kw) && !roomStr.includes(kw)) {
          return false;
        }
      }
      return true;
    });
  }, [reviews, filterStar, searchKeyword]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStar, searchKeyword]);

  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredReviews.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredReviews, currentPage]);

  const total = stats.totalReviews || 0;
  const breakdown = stats.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div className="space-y-8">
      <Title
        align="left"
        font="outfit"
        title="Quản Lý Đánh Giá Khách Hàng"
        subTitle={
          hotelInfo
            ? `Xem điểm bình chọn sao và quản lý các đánh giá của khách hàng dành cho ${hotelInfo.name}.`
            : "Xem điểm bình chọn sao và quản lý các đánh giá của khách hàng dành cho homestay của bạn."
        }
      />

      {/* Rating Summary & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-center items-center text-center">
          <span className="text-5xl font-black text-amber-500">
            ★ {stats.averageRating > 0 ? stats.averageRating : "0.0"}
          </span>
          <p className="text-sm font-semibold text-gray-800 mt-2">
            Điểm bình chọn trung bình / 5.0
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Tổng cộng <strong>{total}</strong> lượt đánh giá từ khách lưu trú
          </p>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <p className="text-sm font-bold text-gray-800 mb-3">
            Phân bổ số sao bình chọn
          </p>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = breakdown[star] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-14 text-gray-700 font-semibold">{star} sao ★</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-gray-500">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-600 mr-1">Lọc theo số sao:</span>
          {[
            { label: "Tất cả", value: "all" },
            { label: "5 ★", value: "5" },
            { label: "4 ★", value: "4" },
            { label: "3 ★", value: "3" },
            { label: "2 ★", value: "2" },
            { label: "1 ★", value: "1" },
          ].map((btn) => (
            <button
              key={btn.value}
              type="button"
              onClick={() => setFilterStar(btn.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterStar === btn.value
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm theo tên khách hoặc nội dung..."
            className="w-full sm:w-64 px-3 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={fetchOwnerReviews}
            className="text-xs text-blue-600 hover:underline font-medium whitespace-nowrap cursor-pointer"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-base">
            Danh sách đánh giá ({filteredReviews.length})
          </h3>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            Đang tải danh sách đánh giá...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 text-sm">
            Chưa có đánh giá nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedReviews.map((r) => {
              const revId = r.id || r._id;
              return (
                <div
                  key={revId}
                  className="p-5 bg-white border border-gray-200 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-gray-300 transition"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <img
                        src={r.user?.image || assets.userIcon}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm">
                            {r.user?.username || "Khách hàng"}
                          </span>
                          {r.room?.roomType && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                              {r.room.roomType}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {r.user?.email}
                          {r.user?.phone ? ` • SĐT: ${r.user.phone}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-amber-400 text-sm">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= r.rating ? "text-amber-400" : "text-gray-300"}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-xs font-bold text-gray-700 ml-1">
                        {r.rating}/5 sao
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        • {new Date(r.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-gray-700 text-sm leading-relaxed">
                      "{r.comment}"
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={deletingId === revId}
                    onClick={() => handleDeleteReview(revId)}
                    className="px-3.5 py-1.5 text-xs border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg self-end sm:self-start transition font-semibold cursor-pointer"
                  >
                    {deletingId === revId ? "Đang xóa..." : "Xóa đánh giá"}
                  </button>
                </div>
              );
            })}
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

export default OwnerReviews;
