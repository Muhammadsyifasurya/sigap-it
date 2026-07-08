/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `User`;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role_id` INTEGER NOT NULL,
    `department_id` INTEGER NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ms_applications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(255) NULL,
    `owner_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `doc_number` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `level` VARCHAR(255) NULL,
    `current_version` VARCHAR(255) NOT NULL DEFAULT 'v1.0',
    `status` VARCHAR(255) NULL,
    `file_path` VARCHAR(255) NULL,
    `publish_date` DATE NULL,
    `expiry_date` DATE NULL,
    `created_by` INTEGER NOT NULL,

    UNIQUE INDEX `documents_doc_number_key`(`doc_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_histories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `document_id` INTEGER NOT NULL,
    `version` VARCHAR(255) NOT NULL,
    `change_description` TEXT NULL,
    `file_path` VARCHAR(255) NULL,
    `updated_by` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maturity_assessments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` INTEGER NOT NULL,
    `framework_name` VARCHAR(255) NOT NULL,
    `domain_code` VARCHAR(255) NULL,
    `process_name` VARCHAR(255) NOT NULL,
    `current_level` DECIMAL(3, 2) NOT NULL,
    `target_level` DECIMAL(3, 2) NOT NULL,
    `gap_score` DECIMAL(3, 2) NOT NULL,
    `notes` TEXT NULL,
    `updated_by` INTEGER NOT NULL,
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maturity_evidences` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `document_id` INTEGER NULL,
    `description` TEXT NOT NULL,
    `file_path` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `it_assets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `asset_tag` VARCHAR(255) NOT NULL,
    `serial_number` VARCHAR(255) NOT NULL,
    `brand` VARCHAR(255) NOT NULL,
    `model` VARCHAR(255) NOT NULL,
    `type` VARCHAR(255) NULL,
    `hardware_tier` VARCHAR(255) NULL,
    `purchase_date` DATE NULL,
    `status` VARCHAR(255) NULL,
    `current_user_id` INTEGER NULL,

    UNIQUE INDEX `it_assets_asset_tag_key`(`asset_tag`),
    UNIQUE INDEX `it_assets_serial_number_key`(`serial_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asset_handovers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `handover_number` VARCHAR(255) NOT NULL,
    `asset_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `handover_date` DATE NOT NULL,
    `return_date` DATE NULL,
    `status` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    `evidence_file` VARCHAR(255) NULL,
    `created_by` INTEGER NOT NULL,

    UNIQUE INDEX `asset_handovers_handover_number_key`(`handover_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `it_risks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `risk_code` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `likelihood` INTEGER NULL,
    `impact` INTEGER NULL,
    `risk_score` INTEGER NULL,
    `risk_status` VARCHAR(255) NULL,
    `mitigation_plan` TEXT NULL,
    `due_date` DATE NULL,
    `pic_id` INTEGER NOT NULL,
    `status` VARCHAR(255) NULL,

    UNIQUE INDEX `it_risks_risk_code_key`(`risk_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `it_incidents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `incident_number` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `root_cause` TEXT NULL,
    `downtime_minutes` INTEGER NOT NULL DEFAULT 0,
    `incident_date` TIMESTAMP(0) NOT NULL,
    `status` VARCHAR(255) NULL,
    `reported_by` INTEGER NOT NULL,

    UNIQUE INDEX `it_incidents_incident_number_key`(`incident_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rkap_budgets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` INTEGER NOT NULL,
    `code` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` VARCHAR(255) NULL,
    `allocated_amount` DECIMAL(15, 2) NOT NULL,
    `remaining_amount` DECIMAL(15, 2) NOT NULL,

    UNIQUE INDEX `rkap_budgets_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rkap_realizations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rkap_budget_id` INTEGER NOT NULL,
    `application_id` INTEGER NULL,
    `description` TEXT NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `transaction_date` DATE NOT NULL,
    `evidence_file` VARCHAR(255) NULL,
    `input_by` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ms_applications` ADD CONSTRAINT `ms_applications_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_histories` ADD CONSTRAINT `document_histories_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_histories` ADD CONSTRAINT `document_histories_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maturity_assessments` ADD CONSTRAINT `maturity_assessments_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maturity_evidences` ADD CONSTRAINT `maturity_evidences_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `maturity_assessments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `maturity_evidences` ADD CONSTRAINT `maturity_evidences_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `it_assets` ADD CONSTRAINT `it_assets_current_user_id_fkey` FOREIGN KEY (`current_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_handovers` ADD CONSTRAINT `asset_handovers_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `it_assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_handovers` ADD CONSTRAINT `asset_handovers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_handovers` ADD CONSTRAINT `asset_handovers_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `it_risks` ADD CONSTRAINT `it_risks_pic_id_fkey` FOREIGN KEY (`pic_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `it_incidents` ADD CONSTRAINT `it_incidents_reported_by_fkey` FOREIGN KEY (`reported_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rkap_realizations` ADD CONSTRAINT `rkap_realizations_rkap_budget_id_fkey` FOREIGN KEY (`rkap_budget_id`) REFERENCES `rkap_budgets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rkap_realizations` ADD CONSTRAINT `rkap_realizations_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `ms_applications`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rkap_realizations` ADD CONSTRAINT `rkap_realizations_input_by_fkey` FOREIGN KEY (`input_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
