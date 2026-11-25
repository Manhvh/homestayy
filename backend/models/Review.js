import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db.js";

const Review = sequelize.define("Review", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    hotelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    roomId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    bookingId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    ownerReply: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    },
    repliedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
}, {
    tableName: "reviews",
    timestamps: true,
    indexes: [
        {
            name: "idx_reviews_hotel_rating",
            fields: ["hotelId", "rating"],
        },
    ],
});

Review.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
};

export default Review;
