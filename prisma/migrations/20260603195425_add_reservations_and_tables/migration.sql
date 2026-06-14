-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "guests" INTEGER NOT NULL,
    "tableId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "specialRequests" TEXT,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantTable" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "zone" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RestaurantTable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reservation_storeId_date_idx" ON "Reservation"("storeId", "date");

-- CreateIndex
CREATE INDEX "Reservation_storeId_status_idx" ON "Reservation"("storeId", "status");

-- CreateIndex
CREATE INDEX "RestaurantTable_storeId_zone_idx" ON "RestaurantTable"("storeId", "zone");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantTable_storeId_number_key" ON "RestaurantTable"("storeId", "number");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "RestaurantTable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantTable" ADD CONSTRAINT "RestaurantTable_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
