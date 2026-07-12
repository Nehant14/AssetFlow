/*
  Warnings:

  - The `status` column on the `Allocation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Asset` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `department` on the `AuditCycle` table. All the data in the column will be lost.
  - The `status` column on the `AuditCycle` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `result` column on the `AuditItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `bookedBy` on the `Booking` table. All the data in the column will be lost.
  - The `status` column on the `Booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Department` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `raisedBy` on the `MaintenanceRequest` table. All the data in the column will be lost.
  - The `priority` column on the `MaintenanceRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `MaintenanceRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[qrCode]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[headId]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookedById` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `raisedById` to the `MaintenanceRequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'AssetManager', 'DepartmentHead', 'Employee');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('Available', 'Allocated', 'Reserved', 'UnderMaintenance', 'Lost', 'Retired', 'Disposed');

-- CreateEnum
CREATE TYPE "AllocationStatus" AS ENUM ('Active', 'Returned');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('Requested', 'Approved', 'Rejected', 'Completed');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('Upcoming', 'Ongoing', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('Pending', 'Approved', 'Rejected', 'TechnicianAssigned', 'InProgress', 'Resolved');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('Low', 'Medium', 'High', 'Critical');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('Open', 'Closed');

-- CreateEnum
CREATE TYPE "AuditResult" AS ENUM ('Verified', 'Missing', 'Damaged');

-- AlterTable
ALTER TABLE "Allocation" ADD COLUMN     "departmentId" INTEGER,
ADD COLUMN     "returnCondition" TEXT,
ALTER COLUMN "employeeId" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "AllocationStatus" NOT NULL DEFAULT 'Active';

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "acquisitionCost" DECIMAL(12,2),
ADD COLUMN     "acquisitionDate" TIMESTAMP(3),
ADD COLUMN     "documentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "qrCode" TEXT,
ADD COLUMN     "serialNumber" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "AssetStatus" NOT NULL DEFAULT 'Available';

-- AlterTable
ALTER TABLE "AuditCycle" DROP COLUMN "department",
ADD COLUMN     "departmentId" INTEGER,
ADD COLUMN     "location" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "AuditStatus" NOT NULL DEFAULT 'Open';

-- AlterTable
ALTER TABLE "AuditItem" ADD COLUMN     "notes" TEXT,
DROP COLUMN "result",
ADD COLUMN     "result" "AuditResult";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "bookedBy",
ADD COLUMN     "bookedById" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'Upcoming';

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "customFields" JSONB;

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "headId" INTEGER,
ADD COLUMN     "parentId" INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'Active';

-- AlterTable
ALTER TABLE "MaintenanceRequest" DROP COLUMN "raisedBy",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "raisedById" INTEGER NOT NULL,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "technicianId" INTEGER,
DROP COLUMN "priority",
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'Medium',
DROP COLUMN "status",
ADD COLUMN     "status" "MaintenanceStatus" NOT NULL DEFAULT 'Pending';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'Employee',
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'Active';

-- CreateTable
CREATE TABLE "Transfer" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "allocationId" INTEGER,
    "requestedById" INTEGER NOT NULL,
    "toEmployeeId" INTEGER,
    "toDepartmentId" INTEGER,
    "approvedById" INTEGER,
    "status" "TransferStatus" NOT NULL DEFAULT 'Requested',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditAssignment" (
    "id" SERIAL NOT NULL,
    "auditCycleId" INTEGER NOT NULL,
    "auditorId" INTEGER NOT NULL,

    CONSTRAINT "AuditAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "actorId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transfer_assetId_idx" ON "Transfer"("assetId");

-- CreateIndex
CREATE INDEX "Transfer_status_idx" ON "Transfer"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AuditAssignment_auditCycleId_auditorId_key" ON "AuditAssignment"("auditCycleId", "auditorId");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_entityId_idx" ON "ActivityLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Allocation_assetId_idx" ON "Allocation"("assetId");

-- CreateIndex
CREATE INDEX "Allocation_employeeId_idx" ON "Allocation"("employeeId");

-- CreateIndex
CREATE INDEX "Allocation_status_idx" ON "Allocation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_qrCode_key" ON "Asset"("qrCode");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

-- CreateIndex
CREATE INDEX "Asset_categoryId_idx" ON "Asset"("categoryId");

-- CreateIndex
CREATE INDEX "AuditCycle_departmentId_idx" ON "AuditCycle"("departmentId");

-- CreateIndex
CREATE INDEX "AuditItem_auditCycleId_idx" ON "AuditItem"("auditCycleId");

-- CreateIndex
CREATE INDEX "Booking_assetId_startTime_endTime_idx" ON "Booking"("assetId", "startTime", "endTime");

-- CreateIndex
CREATE UNIQUE INDEX "Department_headId_key" ON "Department"("headId");

-- CreateIndex
CREATE INDEX "Department_parentId_idx" ON "Department"("parentId");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_assetId_idx" ON "MaintenanceRequest"("assetId");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_status_idx" ON "MaintenanceRequest"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "User_departmentId_idx" ON "User"("departmentId");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_headId_fkey" FOREIGN KEY ("headId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "Allocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_bookedById_fkey" FOREIGN KEY ("bookedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditCycle" ADD CONSTRAINT "AuditCycle_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAssignment" ADD CONSTRAINT "AuditAssignment_auditCycleId_fkey" FOREIGN KEY ("auditCycleId") REFERENCES "AuditCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAssignment" ADD CONSTRAINT "AuditAssignment_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
