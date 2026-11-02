-- ========================================================
-- HomeStay Database Schema (MySQL 5.7+ / 8.0+)
-- ========================================================

CREATE DATABASE IF NOT EXISTS `homestay_db`
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `homestay_db`;

-- 1. Bảng người dùng (Users)
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(255) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NULL,
    `image` TEXT NULL,
    `role` ENUM('user', 'hotelOwner', 'admin') DEFAULT 'user',
    `isBlocked` BOOLEAN DEFAULT FALSE,
    `recentSearchedCities` JSON DEFAULT (JSON_ARRAY()),
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng Homestay / Khách sạn (Hotels)
CREATE TABLE IF NOT EXISTS `hotels` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `address` TEXT NOT NULL,
    `contact` VARCHAR(100) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `image` TEXT,
    `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
    `ownerId` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_hotels_owner` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng phòng (Rooms)
CREATE TABLE IF NOT EXISTS `rooms` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `hotelId` INT NOT NULL,
    `roomType` VARCHAR(100) NOT NULL,
    `pricePerNight` DOUBLE NOT NULL,
    `maxGuests` INT NOT NULL DEFAULT 2,
    `seasonalPricing` JSON DEFAULT (JSON_ARRAY()),
    `amenities` JSON NOT NULL,
    `images` JSON DEFAULT (JSON_ARRAY()),
    `isAvailable` BOOLEAN DEFAULT TRUE,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_rooms_hotel` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng đơn đặt phòng (Bookings)
CREATE TABLE IF NOT EXISTS `bookings` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `userId` VARCHAR(255) NOT NULL,
    `roomId` INT NOT NULL,
    `hotelId` INT NOT NULL,
    `checkInDate` DATETIME NOT NULL,
    `checkOutDate` DATETIME NOT NULL,
    `totalPrice` DOUBLE NOT NULL,
    `guests` INT NOT NULL DEFAULT 1,
    `status` ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    `paymentMethod` VARCHAR(100) DEFAULT 'Pay At Hotel',
    `couponCode` VARCHAR(50) DEFAULT NULL,
    `discountAmount` DOUBLE DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_bookings_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_bookings_room` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_bookings_hotel` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng đánh giá & phản hồi (Reviews)
CREATE TABLE IF NOT EXISTS `reviews` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `userId` VARCHAR(255) NOT NULL,
    `hotelId` INT NOT NULL,
    `roomId` INT DEFAULT NULL,
    `bookingId` INT DEFAULT NULL,
    `rating` INT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
    `comment` TEXT NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_reviews_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_reviews_hotel` FOREIGN KEY (`hotelId`) REFERENCES `hotels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_reviews_room` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng danh mục tiện ích & khu vực (Categories)
CREATE TABLE IF NOT EXISTS `categories` (
    `id` INT AUTO_INCREMENT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('amenity', 'city') NOT NULL,
    `icon` VARCHAR(255) DEFAULT '',
    `description` TEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_category_name_type` (`name`, `type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
