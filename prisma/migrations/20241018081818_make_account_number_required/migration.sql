/*
  Warnings:

  - You are about to drop the column `destinationAccountId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `sourceAccountId` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_destinationAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_sourceAccountId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "destinationAccountId",
DROP COLUMN "sourceAccountId",
ADD COLUMN     "destination_account_number" TEXT,
ADD COLUMN     "source_account_number" TEXT;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_source_account_number_fkey" FOREIGN KEY ("source_account_number") REFERENCES "BankAccount"("bank_account_number") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_destination_account_number_fkey" FOREIGN KEY ("destination_account_number") REFERENCES "BankAccount"("bank_account_number") ON DELETE SET NULL ON UPDATE CASCADE;
