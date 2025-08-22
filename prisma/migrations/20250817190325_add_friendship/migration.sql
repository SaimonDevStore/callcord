-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Friendship_profileId_idx" ON "Friendship"("profileId");

-- CreateIndex
CREATE INDEX "Friendship_friendId_idx" ON "Friendship"("friendId");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_profileId_friendId_key" ON "Friendship"("profileId", "friendId");
