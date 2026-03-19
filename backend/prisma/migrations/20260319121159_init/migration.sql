-- CreateTable
CREATE TABLE "Recipe" (
    "id" SERIAL NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_th" TEXT NOT NULL,
    "ingredients_en" TEXT[],
    "ingredients_th" TEXT[],
    "seasonings_en" TEXT[],
    "seasonings_th" TEXT[],
    "time_min" INTEGER,
    "difficulty" TEXT,
    "steps_en" TEXT[],
    "steps_th" TEXT[],
    "ai_reason" TEXT,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);
