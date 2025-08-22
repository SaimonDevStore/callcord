-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MemberRole" ADD VALUE 'OWNER';
ALTER TYPE "MemberRole" ADD VALUE 'MEMBER';
ALTER TYPE "MemberRole" ADD VALUE 'VIP';
ALTER TYPE "MemberRole" ADD VALUE 'FRIEND';

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "customRole" TEXT,
ADD COLUMN     "roleColor" TEXT;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "customNickname" TEXT,
ADD COLUMN     "isNitro" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nitroExpiresAt" TIMESTAMP(3);
