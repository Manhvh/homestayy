import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db.js";

const Room = sequelize.define("Room", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    hotelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    roomType: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    pricePerNight: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    seasonalPricing: {
        type: DataTypes.JSON,
        defaultValue: [],
    },
    amenities: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    images: {
        type: DataTypes.JSON,
        defaultValue: [],
    },
    isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: "rooms",
    timestamps: true,
});

Room.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
};

export default Room;
