import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db.js";

const Category = sequelize.define("Category", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM("amenity", "city"),
        allowNull: false,
    },
    icon: {
        type: DataTypes.STRING(255),
        defaultValue: "",
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: "",
    },
}, {
    tableName: "categories",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ["name", "type"],
        }
    ]
});

Category.prototype.toJSON = function () {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
};

export default Category;
