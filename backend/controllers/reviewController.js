import { Op } from "sequelize";
import { Review, Hotel, Room, User, Booking } from "../models/index.js";

const buildReviewStats = (reviews = []) => {
    const totalReviews = reviews.length;
    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach((r) => {
        const rating = Number(r.rating) || 0;
        sum += rating;
        const star = Math.round(rating);
        if (ratingBreakdown[star] !== undefined) {
            ratingBreakdown[star]++;
        }
    });

    const averageRating = totalReviews > 0 ? Number((sum / totalReviews).toFixed(1)) : 0;
    return { totalReviews, averageRating, ratingBreakdown };
};

// API to create a new review (or update if same bookingId)
export const createReview = async (req, res) => {
    try {
        const { hotelId, roomId, bookingId, rating, comment } = req.body;
        const userId = req.user.id;

        if (!hotelId || !rating || !comment || !String(comment).trim()) {
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

        let matchedBooking = null;
        if (req.user.role !== "admin") {
            const whereBooking = {
                userId,
                hotelId,
                status: { [Op.ne]: "cancelled" },
            };
            if (bookingId) {
                whereBooking.id = bookingId;
            }

            matchedBooking = await Booking.findOne({
                where: whereBooking,
                order: [["createdAt", "DESC"]],
            });

            if (!matchedBooking) {
                return res.status(403).json({
                    success: false,
                    message: "Chỉ khách hàng đã đặt phòng tại homestay này mới có thể gửi đánh giá."
                });
            }
        }

        const targetBookingId = bookingId || matchedBooking?.id || null;
        const targetRoomId = roomId || matchedBooking?.roomId || null;

        // If user already reviewed this specific booking, update it; otherwise create new
        let review = null;
        if (targetBookingId) {
            review = await Review.findOne({
                where: { userId, bookingId: targetBookingId }
            });
        }

        if (review) {
            review.rating = numericRating;
            review.comment = comment.trim();
            await review.save();
        } else {
            review = await Review.create({
                userId,
                hotelId,
                roomId: targetRoomId,
                bookingId: targetBookingId,
                rating: numericRating,
                comment: comment.trim(),
            });
        }

        const populatedReview = await Review.findByPk(review.id, {
            include: [
                { model: User, as: "user", attributes: ["id", "username", "image"] },
                { model: Room, as: "room", attributes: ["id", "roomType"] },
            ]
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
            include: [
                { model: User, as: "user", attributes: ["id", "username", "image"] },
                { model: Room, as: "room", attributes: ["id", "roomType"] },
            ],
            order: [["createdAt", "DESC"]]
        });

        const { totalReviews, averageRating } = buildReviewStats(reviews);

        res.json({ success: true, reviews, totalReviews, averageRating });
    } catch (error) {
        console.error("Get hotel reviews error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API for Homestay Owner to view all reviews & stats of their own homestay
export const getOwnerReviews = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ where: { ownerId: req.user.id } });
        if (!hotel) {
            return res.json({
                success: true,
                hotel: null,
                stats: buildReviewStats([]),
                reviews: [],
            });
        }

        const reviews = await Review.findAll({
            where: { hotelId: hotel.id },
            include: [
                { model: User, as: "user", attributes: ["id", "username", "email", "phone", "image"] },
                { model: Room, as: "room", attributes: ["id", "roomType"] },
                { model: Hotel, as: "hotel", attributes: ["id", "name", "city"] },
            ],
            order: [["createdAt", "DESC"]],
        });

        const stats = buildReviewStats(reviews);

        res.json({
            success: true,
            hotel: { id: hotel.id, name: hotel.name, city: hotel.city },
            stats,
            reviews,
        });
    } catch (error) {
        console.error("Get owner reviews error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to get overall review statistics (Admin)
export const getReviewStats = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { model: User, as: "user", attributes: ["id", "username", "image"] },
                { model: Hotel, as: "hotel", attributes: ["id", "name", "city"] }
            ],
            order: [["createdAt", "DESC"]]
        });

        const { totalReviews, averageRating, ratingBreakdown } = buildReviewStats(reviews);

        res.json({
            success: true,
            stats: {
                totalReviews,
                averageRating,
                ratingBreakdown,
                recentReviews: reviews,
            }
        });
    } catch (error) {
        console.error("Get review stats error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API to delete review (Allowed for: Review Author, Owner of the Homestay, or Admin)
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByPk(id, {
            include: [{ model: Hotel, as: "hotel" }]
        });

        if (!review) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá." });
        }

        const isReviewAuthor = review.userId === req.user.id;
        const isHotelOwner = review.hotel && review.hotel.ownerId === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (!isReviewAuthor && !isHotelOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền xóa đánh giá này."
            });
        }

        await Review.destroy({ where: { id } });
        res.json({ success: true, message: "Đã xóa đánh giá thành công." });
    } catch (error) {
        console.error("Delete review error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
