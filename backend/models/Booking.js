import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db.js";

const Booking = sequelize.define("Booking", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    roomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    hotelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    checkInDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    checkOutDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    totalPrice: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    guests: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    status: {
        type: DataTypes.ENUM("pending", "confirmed", "cancelled"),
        defaultValue: "pending",
    },
    paymentMethod: {
        type: DataTypes.STRING(100),
        defaultValue: "Pay At Hotel",
    },
    isPaid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
    transactionRef: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
    },
    refundStatus: {
        type: DataTypes.ENUM("none", "pending", "refunded"),
        allowNull: false,
        defaultValue: "none",
    },
    isSendMail: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    bookingCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
}, {
    tableName: "bookings",
    timestamps: true,
    indexes: [
        {
            name: "idx_bookings_room_status_dates",
            fields: ["roomId", "status", "checkInDate", "checkOutDate"],
        },
        {
            name: "idx_bookings_hotel_status",
            fields: ["hotelId", "status"],
        },
        {
            name: "idx_bookings_user",
            fields: ["userId"],
        },
        {
            name: "idx_bookings_txn_ref",
            fields: ["transactionRef"],
        },
    ],
});

Booking.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
};

export default Booking;
