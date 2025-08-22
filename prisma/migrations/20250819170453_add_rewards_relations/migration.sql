/*
  Warnings:

  - Added the required column `requestedById` to the `Friendship` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NitroPlan" AS ENUM ('FLUX', 'NEBULA', 'QUANTUM');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Friendship" ADD COLUMN     "requestedById" TEXT,
ADD COLUMN     "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING';

-- Update existing records to set requestedById to profileId
UPDATE "Friendship" SET "requestedById" = "profileId" WHERE "requestedById" IS NULL;

-- Make requestedById NOT NULL after updating
ALTER TABLE "Friendship" ALTER COLUMN "requestedById" SET NOT NULL;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "nitroPlan" "NitroPlan";

-- CreateTable
CREATE TABLE "RewardProgress" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validDays" INTEGER NOT NULL DEFAULT 0,
    "lastQualifiedDate" TIMESTAMP(3),
    "availableCents" INTEGER NOT NULL DEFAULT 0,
    "totalEarnedCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardDay" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "seconds" INTEGER NOT NULL DEFAULT 0,
    "isValid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardSession" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardPayoutRequest" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "pixKey" TEXT NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardPayoutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RewardProgress_profileId_key" ON "RewardProgress"("profileId");

-- CreateIndex
CREATE INDEX "RewardDay_profileId_date_idx" ON "RewardDay"("profileId", "date");

-- CreateIndex
CREATE INDEX "RewardSession_profileId_startedAt_idx" ON "RewardSession"("profileId", "startedAt");
