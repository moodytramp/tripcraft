-- CreateTable
CREATE TABLE "destinations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "country_code" CHAR(2) NOT NULL,
    "country_name" VARCHAR(100) NOT NULL,
    "region" VARCHAR(50) NOT NULL,
    "currency_code" CHAR(3) NOT NULL,
    "timezone" VARCHAR(50),
    "image_url" TEXT,
    "avg_daily_cost_usd" DECIMAL(8,2),
    "avg_temperature" DECIMAL(4,1),
    "safety_rating" SMALLINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visa_requirements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "passport_country" CHAR(3) NOT NULL,
    "destination_country" CHAR(2) NOT NULL,
    "visa_required" BOOLEAN NOT NULL,
    "visa_on_arrival" BOOLEAN NOT NULL DEFAULT false,
    "e_visa_available" BOOLEAN NOT NULL DEFAULT false,
    "max_stay_days" SMALLINT,
    "notes" TEXT,
    "fetched_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "visa_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "destinations_country_code_key" ON "destinations"("country_code");

-- CreateIndex
CREATE INDEX "destinations_region_idx" ON "destinations"("region");

-- CreateIndex
CREATE UNIQUE INDEX "visa_requirements_passport_country_destination_country_key" ON "visa_requirements"("passport_country", "destination_country");

-- CreateIndex
CREATE INDEX "visa_requirements_passport_country_idx" ON "visa_requirements"("passport_country");

-- CreateIndex
CREATE INDEX "visa_requirements_expires_at_idx" ON "visa_requirements"("expires_at");
