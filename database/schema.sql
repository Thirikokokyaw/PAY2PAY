CREATE DATABASE IF NOT EXISTS pay2pay_db;
USE pay2pay_db;

-- 1. Users Table (အသုံးပြုသူများ စာရင်း)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(10) NOT NULL DEFAULT 'user',
  `profile_photo` LONGTEXT DEFAULT 'uploads/default-avatar.png', -- Base64 သိမ်းဆည်းရန် LONGTEXT သုံးထားသည်
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `status` VARCHAR(20) DEFAULT 'Active',
  `isBlacklisted` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Exchange Transactions Table (ငွေလဲလှယ်မှု မှတ်တမ်းများ)
CREATE TABLE IF NOT EXISTS `exchange_transactions` (
  `txn_id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `from_wallet` VARCHAR(10) NOT NULL,
  `to_wallet` VARCHAR(10) NOT NULL,
  `send_amount` DECIMAL(15,2) NOT NULL,
  `receive_amount` DECIMAL(15,2) NOT NULL,
  `txn_id_tail` CHAR(6) NOT NULL,
  `sender_name` VARCHAR(100) DEFAULT NULL,
  `sender_phone` VARCHAR(20) DEFAULT NULL,
  `receiver_name` VARCHAR(100) DEFAULT NULL,
  `receiver_phone` VARCHAR(20) DEFAULT NULL,
  `status` CHAR(1) DEFAULT '0', -- '0' = Pending, '1' = Approved, '2' = Rejected
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (`txn_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;