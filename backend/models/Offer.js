import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db.js";

const Offer = sequelize.define("Offer", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: "",
    },
    priceOff: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 20,
    },
    maxDiscount: {
        type: DataTypes.DOUBLE,
        defaultValue: 500000,
    },
    minNights: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    expiryDate: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    badge: {
        type: DataTypes.STRING(50),
        defaultValue: "HOT DEAL",
    },
    category: {
        type: DataTypes.STRING(50),
        defaultValue: "summer",
    },
    terms: {
        type: DataTypes.JSON,
        defaultValue: [],
    },
    image: {
        type: DataTypes.TEXT,
        defaultValue: "",
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    hotelId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ownerId: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
}, {
    tableName: "offers",
    timestamps: true,
});

Offer.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
};

export default Offer;
