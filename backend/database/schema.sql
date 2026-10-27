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

-- Dữ liệu mẫu ban đầu cho danh mục (Seed Data)
INSERT IGNORE INTO `categories` (`name`, `type`, `description`) VALUES
('Free WiFi', 'amenity', 'Kết nối Internet tốc độ cao miễn phí'),
('Free Breakfast', 'amenity', 'Bữa sáng miễn phí hàng ngày'),
('Room Service', 'amenity', 'Dịch vụ phục vụ tại phòng'),
('Mountain View', 'amenity', 'Tầm nhìn hướng núi tuyệt đẹp'),
('Pool Access', 'amenity', 'Hồ bơi ngoài trời hoặc trong nhà'),
('Air Conditioning', 'amenity', 'Điều hòa nhiệt độ hai chiều'),
('Kitchen', 'amenity', 'Bếp nấu ăn đầy đủ tiện nghi'),
('Parking', 'amenity', 'Bãi đỗ xe an toàn miễn phí'),
('Đà Lạt', 'city', 'Thành phố sương mù và ngàn hoa'),
('Hà Nội', 'city', 'Thủ đô ngàn năm văn hiến'),
('TP. Hồ Chí Minh', 'city', 'Trung tâm kinh tế sầm uất'),
('Đà Nẵng', 'city', 'Thành phố biển đáng sống'),
('Nha Trang', 'city', 'Vịnh biển nhiệt đới quyến rũ'),
('Sa Pa', 'city', 'Thị trấn mây mù kỳ vĩ'),
('Phú Quốc', 'city', 'Đảo ngọc thiên đường nghỉ dưỡng'),
('Hội An', 'city', 'Đô thị cổ thanh bình'),
('Vũng Tàu', 'city', 'Thành phố biển nghỉ dưỡng cuối tuần'),
('Ninh Bình', 'city', 'Quần thể danh thắng Tràng An');

-- Dữ liệu tài khoản mẫu (Demo Accounts) - Mật khẩu: password123
INSERT IGNORE INTO `users` (`id`, `username`, `email`, `password`, `image`, `role`) VALUES
('user_admin_01', 'Quản Trị Viên', 'admin@homestay.vn', 'e67de5492e95cff0c63fcb23f6ae7afc:04a291ed2322911605a059014369e8eb81c60bb99941e1a22efb2e4dfe73d162914a6ea462e552dfa08d804cfeb44743b4b449e065f0e0a7c6f25cf340e42e96', 'https://api.dicebear.com/7.x/initials/svg?seed=Admin', 'admin'),
('user_owner_01', 'Trần Văn Chủ Nhà', 'chubay@homestay.vn', 'e67de5492e95cff0c63fcb23f6ae7afc:04a291ed2322911605a059014369e8eb81c60bb99941e1a22efb2e4dfe73d162914a6ea462e552dfa08d804cfeb44743b4b449e065f0e0a7c6f25cf340e42e96', 'https://api.dicebear.com/7.x/initials/svg?seed=ChuNha', 'hotelOwner'),
('user_guest_01', 'Nguyễn Văn Khách', 'khachhang@homestay.vn', 'e67de5492e95cff0c63fcb23f6ae7afc:04a291ed2322911605a059014369e8eb81c60bb99941e1a22efb2e4dfe73d162914a6ea462e552dfa08d804cfeb44743b4b449e065f0e0a7c6f25cf340e42e96', 'https://api.dicebear.com/7.x/initials/svg?seed=KhachHang', 'user');
