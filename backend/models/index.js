import { sequelize } from "../configs/db.js";
import User from "./User.js";
import Hotel from "./Hotel.js";
import Room from "./Room.js";
import Booking from "./Booking.js";
import Review from "./Review.js";
import Category from "./Category.js";

// Define Associations

// User <-> Hotel (1-to-1: an owner owns one hotel)
User.hasOne(Hotel, { foreignKey: "ownerId", as: "hotel", onDelete: "CASCADE" });
Hotel.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// Hotel <-> Room (1-to-N: a hotel has multiple rooms)
Hotel.hasMany(Room, { foreignKey: "hotelId", as: "rooms", onDelete: "CASCADE" });
Room.belongsTo(Hotel, { foreignKey: "hotelId", as: "hotel" });

// User <-> Booking
User.hasMany(Booking, { foreignKey: "userId", as: "bookings", onDelete: "CASCADE" });
Booking.belongsTo(User, { foreignKey: "userId", as: "user" });

// Room <-> Booking
Room.hasMany(Booking, { foreignKey: "roomId", as: "bookings", onDelete: "CASCADE" });
Booking.belongsTo(Room, { foreignKey: "roomId", as: "room" });

// Hotel <-> Booking
Hotel.hasMany(Booking, { foreignKey: "hotelId", as: "bookings", onDelete: "CASCADE" });
Booking.belongsTo(Hotel, { foreignKey: "hotelId", as: "hotel" });

// User <-> Review
User.hasMany(Review, { foreignKey: "userId", as: "reviews", onDelete: "CASCADE" });
Review.belongsTo(User, { foreignKey: "userId", as: "user" });

// Hotel <-> Review
Hotel.hasMany(Review, { foreignKey: "hotelId", as: "reviews", onDelete: "CASCADE" });
Review.belongsTo(Hotel, { foreignKey: "hotelId", as: "hotel" });

// Room <-> Review
Room.hasMany(Review, { foreignKey: "roomId", as: "reviews", onDelete: "SET NULL" });
Review.belongsTo(Room, { foreignKey: "roomId", as: "room" });

// Function to synchronize tables with MySQL
export const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log("All MySQL tables synchronized successfully.");
    } catch (err) {
        console.error("Database sync warning:", err.message);
    }
};

export {
    sequelize,
    User,
    Hotel,
    Room,
    Booking,
    Review,
    Category,
};
