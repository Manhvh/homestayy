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
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "",
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
    isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    codeVerify: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: null,
    },
    resetOtpHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
    },
    resetOtpExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
    recentSearchedCities: {
        type: DataTypes.JSON,
        defaultValue: [],
    },
}, {
    tableName: "users",
    timestamps: true,
    indexes: [
        {
            name: "uk_users_email",
            unique: true,
            fields: ["email"],
        },
    ],
});

User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password;
    delete values.codeVerify;
    delete values.resetOtpHash;
    delete values.resetOtpExpiresAt;
    values._id = values.id;
    return values;
};

export default User;
