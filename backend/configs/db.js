import "dotenv/config";
import { Sequelize } from "sequelize";
import mysql from "mysql2/promise";

const DB_NAME = process.env.MYSQL_DATABASE || "homestay_db";
const DB_USER = process.env.MYSQL_USER || "homestay_user";
const DB_PASSWORD = process.env.MYSQL_PASSWORD !== undefined ? process.env.MYSQL_PASSWORD : "homestay_password";
const DB_HOST = process.env.MYSQL_HOST || "localhost";
const DB_PORT = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306;
const DB_URL = process.env.MYSQL_URL || process.env.DATABASE_URL || "";
const isLocalHost = DB_HOST === "localhost" || DB_HOST === "127.0.0.1";
const USE_SSL =
    process.env.MYSQL_SSL === "true" ||
    (process.env.MYSQL_SSL !== "false" && !isLocalHost);

const sslOption = USE_SSL
    ? {
          minVersion: "TLSv1.2",
          rejectUnauthorized: false,
      }
    : undefined;

// Auto create database if it doesn't exist (mainly for local dev)
const ensureDatabaseExists = async () => {
    if (DB_URL) return;
    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
            ...(sslOption ? { ssl: sslOption } : {}),
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await connection.end();
    } catch (err) {
        console.warn("Note on auto-create database:", err.message);
    }
};

const commonConfig = {
    dialect: "mysql",
    logging: false,
    dialectOptions: {
        dateStrings: true,
        typeCast: true,
        ...(sslOption ? { ssl: sslOption } : {}),
    },
    timezone: "+07:00",
    define: {
        timestamps: true,
        underscored: false,
    },
};

export const sequelize = DB_URL
    ? new Sequelize(DB_URL, commonConfig)
    : new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
          host: DB_HOST,
          port: DB_PORT,
          ...commonConfig,
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
