import { Review, Hotel, User } from "../models/index.js";

// API to create a new review
export const createReview = async (req, res) => {
    try {
        const { hotelId, roomId, bookingId, rating, comment } = req.body;
        const userId = req.user.id;

        if (!hotelId || !rating || !comment) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ đánh giá và số sao (1-5)." });
        }

        const numericRating = Number(rating);
        if (numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ success: false, message: "Số sao phải từ 1 đến 5." });
        }

        const hotel = await Hotel.findByPk(hotelId);
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Không tìm thấy homestay." });
        }

        const review = await Review.create({
            userId,
            hotelId,
            roomId: roomId || null,
            bookingId: bookingId || null,
            rating: numericRating,
            comment: comment.trim(),
        });

        const populatedReview = await Review.findByPk(review.id, {
            include: [{ model: User, as: "user", attributes: ["id", "username", "image"] }]
        });

        res.json({ success: true, message: "Gửi đánh giá thành công!", review: populatedReview });
    } catch (error) {
        console.error("Create review error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get reviews for a specific hotel
export const getHotelReviews = async (req, res) => {
    try {
        const { hotelId } = req.params;

        const reviews = await Review.findAll({
            where: { hotelId },
            include: [{ model: User, as: "user", attributes: ["id", "username", "image"] }],
            order: [["createdAt", "DESC"]]
        });

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? (reviews.reduce((acc, item) => acc + item.rating, 0) / totalReviews).toFixed(1)
            : 0;

        res.json({ success: true, reviews, totalReviews, averageRating: Number(averageRating) });
    } catch (error) {
        console.error("Get hotel reviews error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get overall review statistics
export const getReviewStats = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { model: User, as: "user", attributes: ["id", "username", "image"] },
                { model: Hotel, as: "hotel", attributes: ["id", "name", "city"] }
            ],
            order: [["createdAt", "DESC"]]
        });

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? (reviews.reduce((acc, item) => acc + item.rating, 0) / totalReviews).toFixed(1)
            : 0;

        const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            const star = Math.round(r.rating);
            if (ratingBreakdown[star] !== undefined) {
                ratingBreakdown[star]++;
            }
        });

        res.json({
            success: true,
            stats: {
                totalReviews,
                averageRating: Number(averageRating),
                ratingBreakdown,
                recentReviews: reviews.slice(0, 10),
            }
        });
    } catch (error) {
        console.error("Get review stats error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to delete review
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá." });
        }

        if (review.userId !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Bạn không có quyền xóa đánh giá này." });
        }

        await Review.destroy({ where: { id } });
        res.json({ success: true, message: "Đã xóa đánh giá thành công." });
    } catch (error) {
        console.error("Delete review error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
