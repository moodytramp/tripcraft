-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auth_provider_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" VARCHAR(100) NOT NULL,
    "departure_country" CHAR(2),
    "preferred_language" CHAR(2) NOT NULL DEFAULT 'en',
    "preferred_currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "country_code" CHAR(3) NOT NULL,
    "expiry_date" DATE,
    "document_s3_key" VARCHAR(512),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "destination_country" CHAR(2) NOT NULL,
    "visa_type" VARCHAR(50) NOT NULL,
    "expiry_date" DATE,
    "document_s3_key" VARCHAR(512),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_provider_id_key" ON "users"("auth_provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "passports_user_id_idx" ON "passports"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "passports_user_id_country_code_key" ON "passports"("user_id", "country_code");

-- CreateIndex
CREATE INDEX "visas_user_id_idx" ON "visas"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "visas_user_id_destination_country_key" ON "visas"("user_id", "destination_country");

-- AddForeignKey
ALTER TABLE "passports" ADD CONSTRAINT "passports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visas" ADD CONSTRAINT "visas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
