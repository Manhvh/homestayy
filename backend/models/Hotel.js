import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db.js";

const Hotel = sequelize.define("Hotel", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    contact: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: "",
    },
    image: {
        type: DataTypes.TEXT,
        defaultValue: "",
    },
    status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    },
    ownerId: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    tableName: "hotels",
    timestamps: true,
    indexes: [
        {
            name: "idx_hotels_status_city",
            fields: ["status", "city"],
        },
        {
            name: "idx_hotels_owner",
            fields: ["ownerId"],
        },
    ],
});

Hotel.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
};

export default Hotel;
