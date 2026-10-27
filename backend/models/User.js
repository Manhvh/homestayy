import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db.js";

const User = sequelize.define("User", {
    id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    image: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: "",
    },
    role: {
        type: DataTypes.ENUM("user", "hotelOwner", "admin"),
        defaultValue: "user",
    },
    isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    recentSearchedCities: {
        type: DataTypes.JSON,
        defaultValue: [],
    },
}, {
    tableName: "users",
    timestamps: true,
});

User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    values._id = values.id;
    return values;
};

export default User;
