-- Tambahkan informasi gedung dan lantai.
ALTER TABLE `Facility`
    ADD COLUMN `building` VARCHAR(191) NOT NULL DEFAULT 'Gedung B',
    ADD COLUMN `floor` VARCHAR(191) NOT NULL DEFAULT 'Lantai 1';

-- Buat tabel laporan kerusakan.
CREATE TABLE `Report` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `facilityId` INTEGER NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `photoUrl` VARCHAR(191) NULL,
    `status` ENUM(
        'PENDING',
        'IN_PROGRESS',
        'RESOLVED',
        'CLOSED'
    ) NOT NULL DEFAULT 'PENDING',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    INDEX `Report_userId_fkey` (`userId`),
    INDEX `Report_facilityId_fkey` (`facilityId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Hubungkan laporan dengan pengguna.
ALTER TABLE `Report`
    ADD CONSTRAINT `Report_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Hubungkan laporan dengan fasilitas.
ALTER TABLE `Report`
    ADD CONSTRAINT `Report_facilityId_fkey`
    FOREIGN KEY (`facilityId`) REFERENCES `Facility` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;