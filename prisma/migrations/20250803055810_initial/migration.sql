-- CreateTable
CREATE TABLE "VariableMapping" (
    "id" TEXT NOT NULL,
    "korean" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "usage" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VariableMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchHistory" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "results" INTEGER NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VariableMapping_korean_idx" ON "VariableMapping"("korean");

-- CreateIndex
CREATE INDEX "VariableMapping_english_idx" ON "VariableMapping"("english");

-- CreateIndex
CREATE INDEX "VariableMapping_category_idx" ON "VariableMapping"("category");

-- CreateIndex
CREATE INDEX "VariableMapping_tags_idx" ON "VariableMapping"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "VariableMapping_korean_english_type_key" ON "VariableMapping"("korean", "english", "type");

-- CreateIndex
CREATE INDEX "SearchHistory_query_idx" ON "SearchHistory"("query");

-- CreateIndex
CREATE INDEX "SearchHistory_createdAt_idx" ON "SearchHistory"("createdAt");
