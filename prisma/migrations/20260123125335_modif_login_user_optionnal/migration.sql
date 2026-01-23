-- DropForeignKey
ALTER TABLE `LoginHistory` DROP FOREIGN KEY `LoginHistory_userId_fkey`;

-- DropIndex
DROP INDEX `LoginHistory_userId_fkey` ON `LoginHistory`;

-- AlterTable
ALTER TABLE `LoginHistory` MODIFY `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `LoginHistory` ADD CONSTRAINT `LoginHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
