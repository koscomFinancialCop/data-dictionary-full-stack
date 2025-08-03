-- AlterTable
ALTER TABLE "VariableMapping" ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual';

-- CreateTable
CREATE TABLE "RAGSuggestionLog" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "suggestions" JSONB NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "acceptedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RAGSuggestionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RAGSuggestionLog_query_idx" ON "RAGSuggestionLog"("query");

-- CreateIndex
CREATE INDEX "RAGSuggestionLog_accepted_idx" ON "RAGSuggestionLog"("accepted");

-- CreateIndex
CREATE INDEX "RAGSuggestionLog_createdAt_idx" ON "RAGSuggestionLog"("createdAt");

-- CreateIndex
CREATE INDEX "VariableMapping_source_idx" ON "VariableMapping"("source");
