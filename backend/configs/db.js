import { Sequelize } from "sequelize";
import mysql from "mysql2/promise";

const DB_NAME = process.env.MYSQL_DATABASE || "homestay_db";
const DB_USER = process.env.MYSQL_USER || "homestay_user";
const DB_PASSWORD = process.env.MYSQL_PASSWORD !== undefined ? process.env.MYSQL_PASSWORD : "homestay_password";
const DB_HOST = process.env.MYSQL_HOST || "localhost";
const DB_PORT = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306;

// Auto create database if it doesn't exist
const ensureDatabaseExists = async () => {
    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await connection.end();
    } catch (err) {
        console.warn("Note on auto-create database:", err.message);
    }
};

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
        dateStrings: true,
        typeCast: true,
    },
    timezone: "+07:00",
    define: {
        timestamps: true,
        underscored: false,
    }
});

const connectDB = async () => {
    try {
        await ensureDatabaseExists();
        await sequelize.authenticate();
        console.log("Successfully connected to MySQL database via Sequelize!");
    } catch (error) {
        console.error("MySQL Database connection error:", error.message);
    }
};

export default connectDB;
